import 'dotenv/config';
import { z } from 'zod';
import { buildMailConfig } from './mail.config.js';

const booleanFlag = (fallback) =>
  z
    .enum(['true', 'false', '1', '0', 'yes', 'no'])
    .optional()
    .transform((value) => (value === undefined ? fallback : ['true', '1', 'yes'].includes(value)));

const csvList = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  );

/** Comma-separated email addresses; a typo fails at startup rather than on the first lead. */
const emailList = csvList.superRefine((emails, ctx) => {
  for (const email of emails) {
    if (!z.string().email().safeParse(email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${email}" is not a valid email address (separate several addresses with commas)`,
      });
    }
  }
});

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.trim() ? value.trim() : undefined));

const optionalEmail = optionalString.pipe(z.string().email('must be a valid email address').optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4083),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),

    CLIENT_URL: z.string().url().default('http://localhost:5200'),
    CORS_ORIGINS: csvList,

    RATE_LIMIT_WINDOW_MIN: z.coerce.number().positive().default(15),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
    FORM_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

    MAIL_PROVIDER: z.enum(['console', 'smtp', 'office365']).optional(),
    MAIL_FROM_NAME: z.string().min(1).default('Alphafour Infrastructure Pvt Ltd'),
    MAIL_FROM_ADDRESS: z.string().email().default('sales@alpha4infra.com'),
    MAIL_TEAM_TO: emailList,
    MAIL_TEAM_CC: emailList,
    MAIL_REPLY_TO: optionalEmail,
    MAIL_VERIFY_ON_STARTUP: booleanFlag(true),
    MAIL_PREVIEW_DIR: z.string().default('.mail-previews'),

    SMTP_HOST: optionalString,
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: booleanFlag(false),
    SMTP_USER: optionalString,
    SMTP_PASS: optionalString,
    SMTP_POOL: booleanFlag(true),

    MS365_AUTH: z.enum(['password', 'oauth2']).default('password'),
    MS365_HOST: z.string().default('smtp.office365.com'),
    MS365_PORT: z.coerce.number().int().positive().default(587),
    MS365_USER: optionalEmail,
    MS365_PASSWORD: optionalString,
    MS365_TENANT_ID: optionalString,
    MS365_CLIENT_ID: optionalString,
    MS365_CLIENT_SECRET: optionalString,
    MS365_SENDER: optionalEmail,

    BRAND_EMAIL: optionalEmail,
    BRAND_PHONE: z.string().default('+91 94443 14567'),
    BRAND_PHONE_ALT: optionalString,
    BRAND_WHATSAPP: z.string().default('919800000000'),
    BRAND_ADDRESS: z
      .string()
      .default('Dadha Chambers, 5th & 7th Floor, New No: 250, Old No: 268, V.P. Raman Road, Royapettah, Chennai 600014, Tamil Nadu'),
    BRAND_MAPS_URL: z.string().url().default('https://maps.google.com/?q=Dadha+Chambers,+V.P.+Raman+Road,+Royapettah,+Chennai+600014'),
  })
  .superRefine((env, ctx) => {
    const provider = env.MAIL_PROVIDER ?? (env.SMTP_HOST ? 'smtp' : 'console');
    const issue = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (provider === 'smtp' && !env.SMTP_HOST) {
      issue('SMTP_HOST', 'SMTP_HOST is required when MAIL_PROVIDER=smtp');
    }
    if (provider === 'office365') {
      if (env.MS365_AUTH === 'password') {
        if (!env.MS365_USER) issue('MS365_USER', 'MS365_USER is required for Office 365 password auth');
        if (!env.MS365_PASSWORD) issue('MS365_PASSWORD', 'MS365_PASSWORD is required for Office 365 password auth');
      } else {
        for (const key of ['MS365_TENANT_ID', 'MS365_CLIENT_ID', 'MS365_CLIENT_SECRET', 'MS365_SENDER']) {
          if (!env[key]) issue(key, `${key} is required for Office 365 OAuth2`);
        }
      }
    }
    if (env.NODE_ENV === 'production' && provider === 'console') {
      issue('MAIL_PROVIDER', 'Configure MAIL_PROVIDER=smtp or office365 in production (console only logs emails)');
    }
  });

/**
 * Validates environment variables and returns a frozen, structured config object.
 * Throws an Error listing every problem when the environment is invalid.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} source
 */
export function loadConfig(source = process.env) {
  // `KEY=` with no value means "not set", so the setting falls back to its default.
  const values = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, typeof value === 'string' && !value.trim() ? undefined : value]),
  );
  const parsed = envSchema.safeParse(values);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `  • ${i.path.join('.') || 'env'}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  const env = parsed.data;
  // Browsers send the Origin header without a trailing slash.
  const corsOrigins = (env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : [env.CLIENT_URL]).map((origin) =>
    origin.replace(/\/+$/, ''),
  );

  return Object.freeze({
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    port: env.PORT,
    logLevel: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
    trustProxy: env.TRUST_PROXY,
    clientUrl: env.CLIENT_URL.replace(/\/$/, ''),
    corsOrigins,
    rateLimit: Object.freeze({
      windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
      max: env.RATE_LIMIT_MAX,
      formMax: env.FORM_RATE_LIMIT_MAX,
    }),
    brand: Object.freeze({
      name: env.MAIL_FROM_NAME,
      // Public contact address shown in emails. It can differ from the sending mailbox (e.g. a Gmail test account).
      email: env.BRAND_EMAIL ?? env.MAIL_FROM_ADDRESS,
      phone: env.BRAND_PHONE,
      phoneAlt: env.BRAND_PHONE_ALT,
      whatsapp: env.BRAND_WHATSAPP.replace(/\D/g, ''),
      address: env.BRAND_ADDRESS,
      mapsUrl: env.BRAND_MAPS_URL,
      siteUrl: env.CLIENT_URL.replace(/\/$/, ''),
    }),
    mail: buildMailConfig(env),
  });
}
