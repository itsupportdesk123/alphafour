import { ConsoleMailProvider } from './console.provider.js';
import { Office365MailProvider } from './office365.provider.js';
import { SmtpMailProvider } from './smtp.provider.js';

/**
 * Mail provider factory: selects the transport from MAIL_PROVIDER.
 * @param {ReturnType<typeof import('../../config/mail.config.js').buildMailConfig>} mailConfig
 * @param {{ logger: import('pino').Logger }} deps
 * @returns {import('./mail-provider.interface.js').MailProvider}
 */
export function createMailProvider(mailConfig, { logger }) {
  switch (mailConfig.provider) {
    case 'smtp':
      return new SmtpMailProvider(mailConfig.smtp, { logger });
    case 'office365':
      return new Office365MailProvider(mailConfig.office365, { logger });
    case 'console':
    default:
      return new ConsoleMailProvider({ previewDir: mailConfig.previewDir, logger });
  }
}

export { ConsoleMailProvider, Office365MailProvider, SmtpMailProvider };
