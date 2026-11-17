import { assertMailProvider } from './providers/mail-provider.interface.js';

/**
 * Repository (data-access layer) for outgoing email.
 * It is the only layer that talks to the mail transport (SMTP / Office 365 / console),
 * so services stay unaware of which provider is configured.
 */
export class MailRepository {
  /**
   * @param {{
   *   provider: import('./providers/mail-provider.interface.js').MailProvider,
   *   from: { name: string, address: string },
   *   replyTo?: string,
   *   logger: import('pino').Logger
   * }} deps
   */
  constructor({ provider, from, replyTo, logger }) {
    assertMailProvider(provider);
    this.provider = provider;
    this.defaults = { from, replyTo };
    this.logger = logger.child({ layer: 'repository', repository: 'mail' });
  }

  get providerName() {
    return this.provider.name;
  }

  /**
   * Delivers one message through the configured provider.
   * @param {Omit<import('./providers/mail-provider.interface.js').MailMessage, 'from'> & { from?: { name: string, address: string } }} message
   */
  async deliver(message) {
    const from = message.from ?? this.defaults.from;
    const payload = {
      ...message,
      // nodemailer normalises address objects in place, and the configured sender is frozen, so it gets a copy.
      from: typeof from === 'string' ? from : { ...from },
      replyTo: message.replyTo ?? this.defaults.replyTo,
    };
    const result = await this.provider.send(payload);
    this.logger.debug({ messageId: result.messageId, subject: message.subject }, 'Email delivered to transport');
    return result;
  }

  async verify() {
    return this.provider.verify();
  }

  async close() {
    await this.provider.close?.();
  }
}
