/**
 * Derives the mail configuration from validated environment variables.
 *
 * Providers
 *   console   – development default: logs each email and writes HTML/text previews to disk
 *   smtp      – any SMTP server (Gmail, Zoho, Hostinger, Amazon SES SMTP, …)
 *   office365 – Microsoft 365 SMTP (smtp.office365.com:587, STARTTLS, TLS 1.2+)
 *               with password auth today and OAuth2 (client credentials) for the future
 */
export function buildMailConfig(env) {
  const provider = env.MAIL_PROVIDER ?? (env.SMTP_HOST ? 'smtp' : 'console');
  const teamTo = env.MAIL_TEAM_TO.length > 0 ? env.MAIL_TEAM_TO : [env.MAIL_FROM_ADDRESS];

  return Object.freeze({
    provider,
    from: Object.freeze({ name: env.MAIL_FROM_NAME, address: env.MAIL_FROM_ADDRESS }),
    teamTo,
    teamCc: env.MAIL_TEAM_CC,
    replyTo: env.MAIL_REPLY_TO ?? env.MAIL_FROM_ADDRESS,
    verifyOnStartup: env.MAIL_VERIFY_ON_STARTUP,
    previewDir: env.MAIL_PREVIEW_DIR,
    retry: Object.freeze({ attempts: 3, baseDelayMs: env.NODE_ENV === 'test' ? 5 : 500 }),
    smtp: Object.freeze({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      pool: env.SMTP_POOL,
    }),
    office365: Object.freeze({
      auth: env.MS365_AUTH,
      host: env.MS365_HOST,
      port: env.MS365_PORT,
      user: env.MS365_USER,
      password: env.MS365_PASSWORD,
      tenantId: env.MS365_TENANT_ID,
      clientId: env.MS365_CLIENT_ID,
      clientSecret: env.MS365_CLIENT_SECRET,
      sender: env.MS365_SENDER ?? env.MS365_USER,
    }),
  });
}
