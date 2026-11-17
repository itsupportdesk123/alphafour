import nodemailer from 'nodemailer';

const OUTLOOK_SCOPE = 'https://outlook.office365.com/.default';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Microsoft 365 / Exchange Online SMTP provider.
 *
 *   host smtp.office365.com · port 587 · STARTTLS required · TLS 1.2+
 *
 * Auth modes (MS365_AUTH):
 *   password – SMTP AUTH with mailbox credentials. Works today where SMTP AUTH is
 *              enabled for the mailbox, but Microsoft is retiring Basic auth.
 *   oauth2   – XOAUTH2 with an Azure AD (Entra ID) app using the client-credentials
 *              flow via @azure/msal-node. Tokens are cached and refreshed
 *              automatically before expiry. See server/README.md for tenant setup.
 *
 * @implements {import('./mail-provider.interface.js').MailProvider}
 */
export class Office365MailProvider {
  constructor(options, { logger }) {
    this.name = 'office365';
    this.options = options;
    this.logger = logger.child({ provider: 'office365', auth: options.auth });
    this.cachedToken = null;
    this.msalClient = null;

    const base = {
      host: options.host,
      port: options.port,
      secure: false,
      requireTLS: true,
      tls: { minVersion: 'TLSv1.2' },
      pool: true,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    };

    if (options.auth === 'oauth2') {
      this.transporter = nodemailer.createTransport({ ...base, auth: { type: 'OAuth2', user: options.sender } });
      this.transporter.set('oauth2_provision_cb', (_user, renew, callback) => {
        this.getAccessToken(renew)
          .then((token) => callback(null, token))
          .catch((error) => callback(error));
      });
    } else {
      this.transporter = nodemailer.createTransport({ ...base, auth: { user: options.user, pass: options.password } });
      this.logger.warn('Office 365 password (Basic) SMTP AUTH is being retired by Microsoft. Plan a move to MS365_AUTH=oauth2.');
    }
  }

  /** Returns a cached access token, acquiring a new one when missing, near expiry, or when forced. */
  async getAccessToken(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cachedToken && this.cachedToken.expiresAt - now > REFRESH_MARGIN_MS) {
      return this.cachedToken.value;
    }

    if (!this.msalClient) {
      const { ConfidentialClientApplication } = await import('@azure/msal-node');
      this.msalClient = new ConfidentialClientApplication({
        auth: {
          clientId: this.options.clientId,
          clientSecret: this.options.clientSecret,
          authority: `https://login.microsoftonline.com/${this.options.tenantId}`,
        },
      });
    }

    const result = await this.msalClient.acquireTokenByClientCredential({
      scopes: [OUTLOOK_SCOPE],
      skipCache: forceRefresh,
    });
    if (!result?.accessToken) throw new Error('Microsoft identity platform returned no access token');

    this.cachedToken = {
      value: result.accessToken,
      expiresAt: result.expiresOn ? new Date(result.expiresOn).getTime() : now + 50 * 60 * 1000,
    };
    this.logger.debug({ expiresAt: new Date(this.cachedToken.expiresAt).toISOString() }, 'Acquired Office 365 access token');
    return this.cachedToken.value;
  }

  async verify() {
    await this.transporter.verify();
    return true;
  }

  async send(message) {
    // Exchange Online only accepts mail from the authenticated mailbox (or one it has Send As rights on).
    const from = this.options.auth === 'oauth2' && this.options.sender ? { ...normaliseFrom(message.from), address: this.options.sender } : message.from;
    const info = await this.transporter.sendMail({ ...message, from });
    return { messageId: info.messageId, accepted: info.accepted?.map(String), provider: this.name };
  }

  async close() {
    this.transporter.close();
  }
}

function normaliseFrom(from) {
  return typeof from === 'string' ? { name: '', address: from } : from;
}
