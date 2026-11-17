import nodemailer from 'nodemailer';

/**
 * Generic SMTP provider (Gmail, Zoho, Hostinger, Amazon SES SMTP, cPanel…).
 *  • port 465 → implicit TLS (SMTP_SECURE=true)
 *  • port 587 → STARTTLS is required (requireTLS) with TLS 1.2+
 * @implements {import('./mail-provider.interface.js').MailProvider}
 */
export class SmtpMailProvider {
  constructor({ host, port, secure, user, pass, pool }, { logger }) {
    this.name = 'smtp';
    this.logger = logger.child({ provider: 'smtp' });
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      pool,
      requireTLS: !secure && port !== 25,
      auth: user ? { user, pass } : undefined,
      tls: { minVersion: 'TLSv1.2' },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    });
  }

  async verify() {
    await this.transporter.verify();
    return true;
  }

  async send(message) {
    const info = await this.transporter.sendMail(message);
    return { messageId: info.messageId, accepted: info.accepted?.map(String), provider: this.name };
  }

  async close() {
    this.transporter.close();
  }
}
