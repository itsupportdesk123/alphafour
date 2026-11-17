import { EnquiryController } from './controllers/enquiry.controller.js';
import { FeedbackController } from './controllers/feedback.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { NewsletterController } from './controllers/newsletter.controller.js';
import { MailRepository } from './repositories/mail.repository.js';
import { createMailProvider } from './repositories/providers/index.js';
import { TemplateRepository } from './repositories/template.repository.js';
import { EnquiryService } from './services/enquiry.service.js';
import { FeedbackService } from './services/feedback.service.js';
import { MailService } from './services/mail.service.js';
import { NewsletterService } from './services/newsletter.service.js';
import { createLogger } from './utils/logger.js';

/**
 * Composition root: builds every layer once and wires dependencies through constructors.
 *
 *   Controller (HTTP)  →  Service (business logic)  →  Repository (data access: mail transport, templates)
 *
 * `overrides` lets tests (or future features) swap any dependency, e.g. a fake mail provider.
 *
 * @param {ReturnType<typeof import('./config/env.js').loadConfig>} config
 * @param {{ logger?: import('pino').Logger, mailProvider?: import('./repositories/providers/mail-provider.interface.js').MailProvider }} [overrides]
 */
export function createContainer(config, overrides = {}) {
  const logger = overrides.logger ?? createLogger(config);

  // ── Repositories ────────────────────────────────────────────────
  const mailProvider = overrides.mailProvider ?? createMailProvider(config.mail, { logger });
  const mailRepository = new MailRepository({
    provider: mailProvider,
    from: config.mail.from,
    replyTo: config.mail.replyTo,
    logger,
  });
  const templateRepository = new TemplateRepository({ logger });

  // ── Services ────────────────────────────────────────────────────
  const mailService = new MailService({ mailRepository, templateRepository, config, logger });
  const enquiryService = new EnquiryService({ mailService, config, logger });
  const feedbackService = new FeedbackService({ mailService, logger });
  const newsletterService = new NewsletterService({ mailService, logger });

  // ── Controllers ─────────────────────────────────────────────────
  const controllers = {
    health: new HealthController({ mailService, config }),
    enquiry: new EnquiryController({ enquiryService }),
    feedback: new FeedbackController({ feedbackService }),
    newsletter: new NewsletterController({ newsletterService }),
  };

  return {
    config,
    logger,
    repositories: { mailRepository, templateRepository },
    services: { mailService, enquiryService, feedbackService, newsletterService },
    controllers,
  };
}
