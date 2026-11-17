import { randomUUID } from 'node:crypto';
import { AppError } from '../utils/AppError.js';
import { htmlToText } from '../utils/html-to-text.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mail service: renders branded templates and delivers them through the MailRepository.
 *
 *  • send()        – render + deliver now, retrying with exponential backoff (3 attempts)
 *  • enqueue()     – render + deliver in the background (non-blocking) with the same retries
 *  • notifyTeam()  – critical sales notifications (awaited, so a lead is never silently lost)
 *
 * There is no database, so the team notification is the system of record for every lead.
 * It is therefore awaited. Customer confirmations are queued so responses stay fast.
 * The queue interface (enqueue / whenIdle / shutdown) is BullMQ-ready.
 */
export class MailService {
  /**
   * @param {{
   *   mailRepository: import('../repositories/mail.repository.js').MailRepository,
   *   templateRepository: import('../repositories/template.repository.js').TemplateRepository,
   *   config: ReturnType<typeof import('../config/env.js').loadConfig>,
   *   logger: import('pino').Logger
   * }} deps
   */
  constructor({ mailRepository, templateRepository, config, logger }) {
    this.mailRepository = mailRepository;
    this.templateRepository = templateRepository;
    this.brand = config.brand;
    this.mailConfig = config.mail;
    this.logger = logger.child({ layer: 'service', service: 'mail' });

    this.queue = [];
    this.active = 0;
    this.concurrency = 2;
    this.idleResolvers = [];
    this.verification = { verified: null, checkedAt: null, error: null };
  }

  get providerName() {
    return this.mailRepository.providerName;
  }

  /** Renders a body template inside the branded layout. */
  async render(template, context = {}, { preheader = '' } = {}) {
    const shared = { brand: this.brand, year: new Date().getFullYear() };
    const body = await this.templateRepository.render(template, { ...shared, ...context });
    const html = await this.templateRepository.renderLayout('main', {
      ...shared,
      title: context.heading ?? this.brand.name,
      preheader,
      body,
    });
    const contact = [this.brand.phone, this.brand.phoneAlt, this.brand.email].filter(Boolean).join(' · ');
    const footer = [this.brand.name, this.brand.address, contact, this.brand.siteUrl].join('\n');
    return { html, text: `${htmlToText(body)}\n\n—\n${footer}` };
  }

  /**
   * Renders and delivers immediately. Throws the last error after all retries fail.
   * @param {{ template: string, to: string | string[], cc?: string | string[], bcc?: string | string[],
   *           replyTo?: string, subject: string, preheader?: string, context?: Record<string, unknown>,
   *           attachments?: Array<{ filename: string, content: string | Buffer, contentType?: string }> }} mail
   */
  async send(mail) {
    const { html, text } = await this.render(mail.template, mail.context, { preheader: mail.preheader });
    const message = {
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html,
      text,
      attachments: mail.attachments,
    };
    return this.#deliverWithRetry(message, mail.template);
  }

  /** Sends a notification to the sales team. Failure becomes a 503 so the visitor knows to retry. */
  async notifyTeam({ subject, context, replyTo, preheader, attachments }) {
    try {
      return await this.send({
        template: 'team-notification',
        to: this.mailConfig.teamTo,
        cc: this.mailConfig.teamCc.length > 0 ? this.mailConfig.teamCc : undefined,
        replyTo,
        subject,
        preheader,
        context,
        attachments,
      });
    } catch (error) {
      this.logger.error({ err: error, subject }, 'Team notification failed after all retries');
      throw AppError.serviceUnavailable(
        `We couldn’t send your request just now. Please try again in a moment, or call us on ${this.brand.phone}.`,
        error,
      );
    }
  }

  /** Queues an email for background delivery. Never throws; returns a job id. */
  enqueue(mail) {
    const jobId = randomUUID();
    this.queue.push({ jobId, mail });
    this.#drain();
    return jobId;
  }

  /** Resolves once the background queue is empty (or after `timeoutMs`). */
  whenIdle(timeoutMs = 10_000) {
    if (this.active === 0 && this.queue.length === 0) return Promise.resolve(true);
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeoutMs);
      this.idleResolvers.push(() => {
        clearTimeout(timer);
        resolve(true);
      });
    });
  }

  /** Checks the transport (SMTP handshake / credentials). Never throws. */
  async verify() {
    try {
      await this.mailRepository.verify();
      this.verification = { verified: true, checkedAt: new Date().toISOString(), error: null };
    } catch (error) {
      this.verification = {
        verified: false,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return this.getStatus();
  }

  getStatus() {
    return {
      provider: this.providerName,
      ...this.verification,
      queued: this.queue.length,
      sending: this.active,
    };
  }

  /** Waits for queued emails (bounded) and closes the transport. */
  async shutdown(timeoutMs = 10_000) {
    const drained = await this.whenIdle(timeoutMs);
    if (!drained) this.logger.warn({ pending: this.queue.length + this.active }, 'Shutdown with emails still pending');
    await this.mailRepository.close();
  }

  async #deliverWithRetry(message, label) {
    const { attempts, baseDelayMs } = this.mailConfig.retry;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const result = await this.mailRepository.deliver(message);
        this.logger.info({ template: label, messageId: result.messageId, attempt }, 'Email sent');
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn({ template: label, attempt, err: error }, 'Email delivery attempt failed');
        if (attempt < attempts) {
          const jitter = 0.8 + Math.random() * 0.4;
          await sleep(Math.round(baseDelayMs * 2 ** (attempt - 1) * jitter));
        }
      }
    }
    throw lastError;
  }

  #drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.active += 1;
      this.#process(job).finally(() => {
        this.active -= 1;
        if (this.active === 0 && this.queue.length === 0) {
          this.idleResolvers.splice(0).forEach((resolve) => resolve());
        } else {
          this.#drain();
        }
      });
    }
  }

  async #process({ jobId, mail }) {
    try {
      await this.send(mail);
    } catch (error) {
      this.logger.error({ err: error, jobId, template: mail.template }, 'Background email failed after all retries');
    }
  }
}
