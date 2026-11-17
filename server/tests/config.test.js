/**
 * Configuration and mail-provider selection.
 *
 * Safety: every loadConfig() call receives an explicit plain object (never process.env, which dotenv fills from the
 * real server/.env), containers always get an in-memory provider, and real nodemailer transports are only constructed
 * and inspected: sendMail is stubbed on the instance before any send() and nothing ever connects to a mail server.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { buildMailConfig } from '../src/config/mail.config.js';
import { createContainer } from '../src/container.js';
import {
  ConsoleMailProvider,
  createMailProvider,
  Office365MailProvider,
  SmtpMailProvider,
} from '../src/repositories/providers/index.js';
import { MemoryMailProvider } from './helpers.js';

const SERVER_DIR = fileURLToPath(new URL('..', import.meta.url));
const ROOT_DIR = path.resolve(SERVER_DIR, '..');
const readText = (...segments) => readFileSync(path.join(...segments), 'utf8');

/** Admin mailbox today (Gmail testing) and after the switch to Microsoft 365. */
const TEST_ADMIN = 'it.support.enexio@gmail.com';
const LIVE_ADMIN = 'sales@alpha4infra.com';
const FROM_NAME = 'Alphafour Infrastructure Pvt Ltd';
const SECRET_KEYS = ['SMTP_PASS', 'MS365_PASSWORD', 'MS365_CLIENT_SECRET'];

/** Gmail testing setup: the Gmail mailbox signs in, sends, and receives the admin notifications. */
const gmailEnv = (overrides = {}) => ({
  NODE_ENV: 'test',
  MAIL_PROVIDER: 'smtp',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: TEST_ADMIN,
  SMTP_PASS: 'dummy-app-password',
  MAIL_FROM_ADDRESS: TEST_ADMIN,
  MAIL_TEAM_TO: TEST_ADMIN,
  ...overrides,
});

/** Future live setup: Microsoft 365 mailbox sales@alpha4infra.com with OAuth2 (client credentials). */
const m365OAuthEnv = (overrides = {}) => ({
  NODE_ENV: 'test',
  MAIL_PROVIDER: 'office365',
  MS365_AUTH: 'oauth2',
  MS365_TENANT_ID: '00000000-0000-0000-0000-000000000000',
  MS365_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
  MS365_CLIENT_SECRET: 'dummy-client-secret',
  MS365_SENDER: LIVE_ADMIN,
  MAIL_FROM_ADDRESS: LIVE_ADMIN,
  MAIL_TEAM_TO: LIVE_ADMIN,
  ...overrides,
});

/** Future live setup with SMTP AUTH (password) instead of OAuth2. */
const m365PasswordEnv = (overrides = {}) => ({
  NODE_ENV: 'test',
  MAIL_PROVIDER: 'office365',
  MS365_AUTH: 'password',
  MS365_USER: LIVE_ADMIN,
  MS365_PASSWORD: 'dummy-mailbox-password',
  MAIL_FROM_ADDRESS: LIVE_ADMIN,
  MAIL_TEAM_TO: LIVE_ADMIN,
  ...overrides,
});

/** loadConfig must refuse to start, and the message must name what to fix. */
function assertConfigError(env, ...patterns) {
  assert.throws(
    () => loadConfig(env),
    (error) => {
      assert.match(error.message, /^Invalid environment configuration:/);
      for (const pattern of patterns) assert.match(error.message, pattern);
      return true;
    },
    `loadConfig accepted a configuration it should reject (expected ${patterns.join(', ')})`,
  );
}

/** pino-compatible stand-in that records warnings instead of printing them. */
function recordingLogger() {
  const logger = {
    warnings: [],
    child: () => logger,
    warn: (...args) => logger.warnings.push(args.filter((arg) => typeof arg === 'string').join(' ')),
    trace: () => {},
    debug: () => {},
    info: () => {},
    error: () => {},
    fatal: () => {},
  };
  return logger;
}

/** Builds the provider the factory selects, hands it to `fn`, then closes it (no connection is ever opened). */
async function withProvider(mailConfig, fn) {
  const logger = recordingLogger();
  const provider = createMailProvider(mailConfig, { logger });
  try {
    return await fn(provider, logger);
  } finally {
    await provider.close();
  }
}

/** Replaces sendMail on this transport instance only, so send() can be inspected without reaching a mail server. */
function captureSendMail(provider) {
  const sent = [];
  provider.transporter.sendMail = async (message) => {
    sent.push(message);
    return { messageId: `<stub-${sent.length}@config.test>`, accepted: [].concat(message.to) };
  };
  return sent;
}

/** Express app wired to an in-memory provider, exactly like tests/helpers.js but with a chosen configuration. */
function appFor(env) {
  const config = loadConfig(env);
  const provider = new MemoryMailProvider();
  const container = createContainer(config, { mailProvider: provider });
  return {
    app: createApp(container),
    config,
    provider,
    whenIdle: () => container.services.mailService.whenIdle(5_000),
  };
}

/** The browser's CORS preflight before the website POSTs a form as JSON. */
const preflight = (app, origin) =>
  request(app)
    .options('/api/enquiries')
    .set('Origin', origin)
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');

describe('loadConfig: Gmail testing mailbox (MAIL_PROVIDER=smtp)', () => {
  it('notifies it.support.enexio@gmail.com, sends from it, and falls back to it for Reply-To and the footer', () => {
    const { mail, brand } = loadConfig(gmailEnv());
    assert.equal(mail.provider, 'smtp');
    assert.deepEqual(mail.teamTo, [TEST_ADMIN]);
    assert.deepEqual(mail.teamCc, []);
    assert.deepEqual(mail.from, { name: FROM_NAME, address: TEST_ADMIN });
    assert.equal(mail.replyTo, TEST_ADMIN, 'MAIL_REPLY_TO falls back to MAIL_FROM_ADDRESS');
    assert.equal(brand.email, TEST_ADMIN, 'BRAND_EMAIL falls back to MAIL_FROM_ADDRESS');
    assert.deepEqual(mail.smtp, {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: TEST_ADMIN,
      pass: 'dummy-app-password',
      pool: true,
    });
  });

  it('auto-detects smtp from SMTP_HOST, defaults to console, and an explicit MAIL_PROVIDER always wins', () => {
    const { MAIL_PROVIDER: _omitted, ...withoutProvider } = gmailEnv();
    assert.equal(loadConfig(withoutProvider).mail.provider, 'smtp');
    assert.equal(loadConfig({ NODE_ENV: 'test' }).mail.provider, 'console');
    assert.equal(loadConfig(gmailEnv({ MAIL_PROVIDER: 'console' })).mail.provider, 'console');
    // Switching to Microsoft 365 must not depend on clearing the old Gmail SMTP_* values.
    const switched = loadConfig(m365OAuthEnv({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: TEST_ADMIN, SMTP_PASS: 'x' }));
    assert.equal(switched.mail.provider, 'office365');
  });

  it('refuses MAIL_PROVIDER=smtp without SMTP_HOST', () => {
    assertConfigError(gmailEnv({ SMTP_HOST: '' }), /SMTP_HOST: .*required/);
    assertConfigError(gmailEnv({ SMTP_HOST: '   ' }), /SMTP_HOST: .*required/);
  });

  it('treats an empty MAIL_PROVIDER as "auto-detect", as .env.example documents', () => {
    assert.match(readText(SERVER_DIR, '.env.example'), /If empty: "smtp" when SMTP_HOST is set, otherwise "console"/);
    assert.equal(loadConfig(gmailEnv({ MAIL_PROVIDER: '' })).mail.provider, 'smtp');
    assert.equal(loadConfig({ NODE_ENV: 'test', MAIL_PROVIDER: '' }).mail.provider, 'console');
  });
});

describe('loadConfig: admin recipients (MAIL_TEAM_TO / MAIL_TEAM_CC)', () => {
  it('accepts comma-separated admin lists, ignoring stray whitespace and empty entries', () => {
    const { mail } = loadConfig(
      gmailEnv({ MAIL_TEAM_TO: `  ${TEST_ADMIN} ,${LIVE_ADMIN},  `, MAIL_TEAM_CC: ' directors@example.com , , ' }),
    );
    assert.deepEqual(mail.teamTo, [TEST_ADMIN, LIVE_ADMIN]);
    assert.deepEqual(mail.teamCc, ['directors@example.com']);
  });

  it('falls back to MAIL_FROM_ADDRESS when MAIL_TEAM_TO is missing, empty or only separators', () => {
    for (const MAIL_TEAM_TO of [undefined, '', '   ', ' , ']) {
      const { mail } = loadConfig({ NODE_ENV: 'test', MAIL_FROM_ADDRESS: TEST_ADMIN, MAIL_TEAM_TO });
      assert.deepEqual(mail.teamTo, [TEST_ADMIN], `MAIL_TEAM_TO=${JSON.stringify(MAIL_TEAM_TO)}`);
    }
    assert.deepEqual(loadConfig({ NODE_ENV: 'test' }).mail.teamTo, [LIVE_ADMIN], 'built-in default sender');
  });

  it('rejects invalid admin, reply-to and footer addresses at startup, naming the variable', () => {
    const cases = [
      ['MAIL_TEAM_TO', 'it.support.enexio@gmail', /MAIL_TEAM_TO: .*"it\.support\.enexio@gmail".* valid email/],
      ['MAIL_TEAM_TO', `${TEST_ADMIN};${LIVE_ADMIN}`, /MAIL_TEAM_TO: .*separate several addresses with commas/],
      ['MAIL_TEAM_TO', `${TEST_ADMIN}, sales`, /MAIL_TEAM_TO: .*"sales".* valid email/],
      ['MAIL_TEAM_CC', 'directors', /MAIL_TEAM_CC: .*"directors".* valid email/],
      ['MAIL_REPLY_TO', 'sales at alpha4infra.com', /MAIL_REPLY_TO: .*valid email/],
      ['BRAND_EMAIL', 'sales@', /BRAND_EMAIL: .*valid email/],
    ];
    for (const [key, value, pattern] of cases) assertConfigError(gmailEnv({ [key]: value }), pattern);

    // Every problem is listed at once, so the whole .env can be fixed in one go.
    assertConfigError(
      gmailEnv({ MAIL_TEAM_TO: 'a', MAIL_TEAM_CC: 'b', MAIL_REPLY_TO: 'c', BRAND_EMAIL: 'd' }),
      /MAIL_TEAM_TO:/,
      /MAIL_TEAM_CC:/,
      /MAIL_REPLY_TO:/,
      /BRAND_EMAIL:/,
    );
  });
});

describe('loadConfig: brand details shown in email footers', () => {
  it('BRAND_EMAIL decouples the footer contact from the sending mailbox and defaults to MAIL_FROM_ADDRESS', () => {
    const decoupled = loadConfig(gmailEnv({ BRAND_EMAIL: ` ${LIVE_ADMIN}  ` }));
    assert.equal(decoupled.brand.email, LIVE_ADMIN);
    assert.equal(decoupled.mail.from.address, TEST_ADMIN, 'the Gmail test box still sends');
    for (const BRAND_EMAIL of [undefined, '', '   ']) {
      assert.equal(
        loadConfig(gmailEnv({ BRAND_EMAIL })).brand.email,
        TEST_ADMIN,
        `BRAND_EMAIL=${JSON.stringify(BRAND_EMAIL)}`,
      );
    }
  });

  it('BRAND_PHONE_ALT is optional: blank means no second number, values are trimmed', () => {
    assert.equal(loadConfig({ NODE_ENV: 'test' }).brand.phone, '+91 94443 14567');
    assert.equal(loadConfig({ NODE_ENV: 'test' }).brand.phoneAlt, undefined);
    assert.equal(loadConfig({ NODE_ENV: 'test', BRAND_PHONE_ALT: '   ' }).brand.phoneAlt, undefined);
    assert.equal(
      loadConfig({ NODE_ENV: 'test', BRAND_PHONE_ALT: ' +91 94442 54567 ' }).brand.phoneAlt,
      '+91 94442 54567',
    );
  });
});

describe('loadConfig: switching to Microsoft 365 (sales@alpha4infra.com)', () => {
  it('password auth requires MS365_USER and MS365_PASSWORD', () => {
    assertConfigError(
      { NODE_ENV: 'test', MAIL_PROVIDER: 'office365' },
      /MS365_USER: .*required/,
      /MS365_PASSWORD: .*required/,
    );
    assertConfigError(m365PasswordEnv({ MS365_PASSWORD: '  ' }), /MS365_PASSWORD: .*required/);
  });

  it('OAuth2 requires MS365_TENANT_ID, MS365_CLIENT_ID, MS365_CLIENT_SECRET and MS365_SENDER', () => {
    const keys = ['MS365_TENANT_ID', 'MS365_CLIENT_ID', 'MS365_CLIENT_SECRET', 'MS365_SENDER'];
    assertConfigError(
      { NODE_ENV: 'test', MAIL_PROVIDER: 'office365', MS365_AUTH: 'oauth2' },
      ...keys.map((key) => new RegExp(`${key}: .*required.*OAuth2`)),
    );
    for (const key of keys) assertConfigError(m365OAuthEnv({ [key]: '' }), new RegExp(`${key}: .*required`));
  });

  it('uses MS365_SENDER as the sending mailbox, falling back to MS365_USER', () => {
    const password = loadConfig(m365PasswordEnv());
    assert.equal(password.mail.provider, 'office365');
    assert.equal(password.mail.office365.sender, LIVE_ADMIN, 'falls back to MS365_USER');
    const explicit = loadConfig(m365PasswordEnv({ MS365_SENDER: 'enquiries@example.com' }));
    assert.equal(explicit.mail.office365.sender, 'enquiries@example.com');

    const { office365 } = loadConfig(m365OAuthEnv()).mail;
    assert.equal(office365.auth, 'oauth2');
    assert.equal(office365.sender, LIVE_ADMIN);
    assert.equal(office365.host, 'smtp.office365.com');
    assert.equal(office365.port, 587);
  });

  it('rejects an MS365_SENDER that is not an email address (OAuth2 sends every email From it)', () => {
    assertConfigError(m365OAuthEnv({ MS365_SENDER: 'sales' }), /MS365_SENDER/);
  });
});

describe('loadConfig: production safety', () => {
  it('refuses the console provider in production, whether chosen explicitly or by default', () => {
    const message = /MAIL_PROVIDER: .*smtp or office365 in production/;
    assertConfigError({ NODE_ENV: 'production' }, message);
    assertConfigError({ NODE_ENV: 'production', MAIL_PROVIDER: 'console' }, message);
  });

  it('accepts a real transport in production, explicit or auto-detected from SMTP_HOST', () => {
    const config = loadConfig(gmailEnv({ NODE_ENV: 'production', LOG_LEVEL: 'warn' }));
    assert.equal(config.isProduction, true);
    assert.equal(config.mail.provider, 'smtp');
    assert.equal(config.logLevel, 'warn');
    assert.equal(loadConfig({ NODE_ENV: 'production', SMTP_HOST: 'smtp.gmail.com' }).mail.provider, 'smtp');
  });
});

describe('loadConfig: runtime defaults and CORS for the website', () => {
  const VITE_CONFIG = path.join(ROOT_DIR, 'client', 'vite.config.js');
  it(
    'defaults match the website dev setup: API on the Vite proxy target, CLIENT_URL/CORS on the Vite port',
    { skip: existsSync(VITE_CONFIG) ? false : 'client/ is not present next to server/' },
    () => {
      const vite = readFileSync(VITE_CONFIG, 'utf8');
      const vitePort = Number(vite.match(/server:\s*{[^}]*?port:\s*(\d+)/)?.[1]);
      const proxyTarget = vite.match(/API_PROXY_TARGET\s*\|\|\s*'([^']+)'/)?.[1];
      assert.ok(vitePort > 0 && proxyTarget, 'could not read the dev port / proxy target from client/vite.config.js');
      assert.equal(dotenv.parse(readText(ROOT_DIR, 'client', '.env.example')).API_PROXY_TARGET, proxyTarget);

      const config = loadConfig({ NODE_ENV: 'test' });
      assert.equal(`http://localhost:${config.port}`, proxyTarget);
      assert.equal(config.clientUrl, `http://localhost:${vitePort}`);
      assert.equal(config.brand.siteUrl, `http://localhost:${vitePort}`);
      assert.deepEqual(config.corsOrigins, [`http://localhost:${vitePort}`]);
    },
  );

  it('CORS_ORIGINS replaces the CLIENT_URL default and only listed origins pass the browser preflight', async () => {
    const { app, config } = appFor({
      NODE_ENV: 'test',
      CLIENT_URL: 'https://alpha4infra.com',
      CORS_ORIGINS: ' https://alpha4infra.com , https://www.alpha4infra.com ',
    });
    assert.deepEqual(config.corsOrigins, ['https://alpha4infra.com', 'https://www.alpha4infra.com']);
    const allowed = await preflight(app, 'https://www.alpha4infra.com');
    assert.equal(allowed.headers['access-control-allow-origin'], 'https://www.alpha4infra.com');
    const refused = await preflight(app, 'https://evil.example');
    assert.equal(refused.headers['access-control-allow-origin'], undefined);
  });

  it('a CLIENT_URL with a trailing slash still lets the website through CORS', async () => {
    const { app, config } = appFor({ NODE_ENV: 'test', CLIENT_URL: 'https://alpha4infra.com/' });
    assert.equal(config.clientUrl, 'https://alpha4infra.com', 'email links drop the slash');
    const res = await preflight(app, 'https://alpha4infra.com');
    assert.equal(
      res.headers['access-control-allow-origin'],
      'https://alpha4infra.com',
      'browsers send Origin without a trailing slash, so the website must still be allowed',
    );
  });
});

describe('buildMailConfig', () => {
  it('auto-detects the transport and retries each email 3 times with a 500 ms base backoff (5 ms under test)', () => {
    const env = {
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.gmail.com',
      MAIL_FROM_NAME: FROM_NAME,
      MAIL_FROM_ADDRESS: TEST_ADMIN,
      MAIL_TEAM_TO: [],
      MAIL_TEAM_CC: [],
      MAIL_VERIFY_ON_STARTUP: true,
      MAIL_PREVIEW_DIR: '.mail-previews',
      MS365_AUTH: 'password',
    };
    const mail = buildMailConfig(env);
    assert.equal(mail.provider, 'smtp');
    assert.deepEqual(mail.teamTo, [TEST_ADMIN]);
    assert.deepEqual(mail.retry, { attempts: 3, baseDelayMs: 500 });
    assert.deepEqual(buildMailConfig({ ...env, NODE_ENV: 'test' }).retry, { attempts: 3, baseDelayMs: 5 });
    assert.equal(buildMailConfig({ ...env, SMTP_HOST: undefined }).provider, 'console');
  });
});

describe('createMailProvider', () => {
  it('returns the provider named by MAIL_PROVIDER', async () => {
    const cases = [
      [{ NODE_ENV: 'test' }, ConsoleMailProvider, 'console'],
      [gmailEnv(), SmtpMailProvider, 'smtp'],
      [m365PasswordEnv(), Office365MailProvider, 'office365'],
      [m365OAuthEnv(), Office365MailProvider, 'office365'],
    ];
    for (const [env, Provider, name] of cases) {
      await withProvider(loadConfig(env).mail, async (provider) => {
        assert.ok(provider instanceof Provider, `${name} should build a ${Provider.name}`);
        assert.equal(provider.name, name);
      });
    }
    const previews = loadConfig({ NODE_ENV: 'test', MAIL_PREVIEW_DIR: 'tmp/mail-previews' }).mail;
    await withProvider(previews, async (provider) => {
      assert.equal(provider.previewDir, path.resolve('tmp/mail-previews'));
    });
  });

  it('Gmail on port 587 requires STARTTLS with TLS 1.2+ and signs in with the App Password; 465 uses implicit TLS', async () => {
    await withProvider(loadConfig(gmailEnv()).mail, async (provider) => {
      const options = provider.transporter.options;
      assert.equal(options.host, 'smtp.gmail.com');
      assert.equal(options.port, 587);
      assert.equal(options.secure, false);
      assert.equal(options.requireTLS, true, 'credentials must never travel over an unencrypted connection');
      assert.equal(options.tls.minVersion, 'TLSv1.2');
      assert.deepEqual(options.auth, { user: TEST_ADMIN, pass: 'dummy-app-password' });
    });
    await withProvider(loadConfig(gmailEnv({ SMTP_PORT: '465', SMTP_SECURE: 'true' })).mail, async (provider) => {
      assert.equal(provider.transporter.options.secure, true);
      assert.equal(provider.transporter.options.requireTLS, false);
    });
  });

  it('Microsoft 365 password auth: smtp.office365.com:587 over STARTTLS, From MAIL_FROM_ADDRESS, Basic-auth warning', async () => {
    const config = loadConfig(m365PasswordEnv());
    await withProvider(config.mail, async (provider, logger) => {
      const options = provider.transporter.options;
      assert.equal(options.host, 'smtp.office365.com');
      assert.equal(options.port, 587);
      assert.equal(options.secure, false);
      assert.equal(options.requireTLS, true);
      assert.equal(options.tls.minVersion, 'TLSv1.2');
      assert.deepEqual(options.auth, { user: LIVE_ADMIN, pass: 'dummy-mailbox-password' });
      assert.ok(
        logger.warnings.some((warning) => /retir/i.test(warning)),
        'warns that Basic SMTP AUTH is being retired',
      );

      const sent = captureSendMail(provider);
      await provider.send({
        from: config.mail.from,
        to: config.mail.teamTo,
        subject: 'Lead',
        html: '<p>Lead</p>',
        text: 'Lead',
      });
      assert.deepEqual(sent[0].from, { name: FROM_NAME, address: LIVE_ADMIN });
    });
  });

  it('Microsoft 365 OAuth2: XOAUTH2 as MS365_SENDER, and every email goes From MS365_SENDER with the display name kept', async () => {
    // A realistic slip during the switch: MAIL_FROM_ADDRESS still names the Gmail test mailbox.
    const config = loadConfig(m365OAuthEnv({ MAIL_FROM_ADDRESS: TEST_ADMIN }));
    await withProvider(config.mail, async (provider, logger) => {
      assert.deepEqual(provider.transporter.options.auth, { type: 'OAuth2', user: LIVE_ADMIN });
      assert.equal(provider.transporter.options.host, 'smtp.office365.com');
      assert.equal(provider.transporter.options.requireTLS, true);
      assert.deepEqual(logger.warnings, [], 'no Basic-auth warning in OAuth2 mode');

      const sent = captureSendMail(provider);
      const result = await provider.send({
        from: config.mail.from,
        to: config.mail.teamTo,
        replyTo: 'aarav.mehta@example.com',
        subject: 'New enquiry',
        html: '<p>New enquiry</p>',
        text: 'New enquiry',
      });
      assert.deepEqual(sent[0].from, { name: FROM_NAME, address: LIVE_ADMIN });
      assert.deepEqual(sent[0].to, [LIVE_ADMIN]);
      assert.equal(sent[0].replyTo, 'aarav.mehta@example.com');
      assert.equal(result.provider, 'office365');

      await provider.send({
        from: TEST_ADMIN,
        to: 'visitor@example.com',
        subject: 'Copy',
        html: '<p>Copy</p>',
        text: 'Copy',
      });
      assert.equal(sent[1].from.address, LIVE_ADMIN, 'a plain-string From is rewritten too');
    });
  });

  it('Microsoft 365 OAuth2: tokens come from the client-credentials flow, are cached, and renew near expiry', async () => {
    await withProvider(loadConfig(m365OAuthEnv()).mail, async (provider) => {
      const requests = [];
      const lifetimes = [60 * 60_000, 2 * 60_000, 60 * 60_000];
      // Pre-set MSAL client: getAccessToken never imports or calls the real Microsoft identity platform.
      provider.msalClient = {
        acquireTokenByClientCredential: async (tokenRequest) => {
          requests.push(tokenRequest);
          return {
            accessToken: `token-${requests.length}`,
            expiresOn: new Date(Date.now() + lifetimes[requests.length - 1]),
          };
        },
      };
      const provision = provider.transporter.get('oauth2_provision_cb');
      const tokenFor = (renew) =>
        new Promise((resolve, reject) =>
          provision(LIVE_ADMIN, renew, (error, token) => (error ? reject(error) : resolve(token))),
        );

      assert.equal(await tokenFor(false), 'token-1');
      assert.equal(await tokenFor(false), 'token-1', 'a valid token is reused');
      assert.equal(await tokenFor(true), 'token-2', 'nodemailer can force a renewal');
      assert.equal(await tokenFor(false), 'token-3', 'a token within 5 minutes of expiry is replaced');
      assert.deepEqual(
        requests.map(({ skipCache, scopes }) => ({ skipCache, scopes })),
        [false, true, false].map((skipCache) => ({ skipCache, scopes: ['https://outlook.office365.com/.default'] })),
        'Exchange Online scope on every request; only the forced renewal skips the MSAL cache',
      );
    });
  });
});

describe('configuration files', () => {
  const EXAMPLE = path.join(SERVER_DIR, '.env.example');
  const LOCAL_ENV = path.join(SERVER_DIR, '.env');

  it('server/.env.example parses and validates as the safe development setup', () => {
    const example = dotenv.parse(readFileSync(EXAMPLE, 'utf8'));
    const config = loadConfig({ ...example });
    const defaults = loadConfig({ NODE_ENV: example.NODE_ENV });
    assert.equal(config.mail.provider, 'console', 'copying .env.example must not send real email');
    assert.equal(config.port, defaults.port);
    assert.equal(config.clientUrl, defaults.clientUrl);
    assert.deepEqual(config.corsOrigins, defaults.corsOrigins);
    assert.ok(config.mail.teamTo.length > 0);
  });

  it('server/.env.example contains no passwords or client secrets, not even in comments', () => {
    const text = readFileSync(EXAMPLE, 'utf8');
    const example = dotenv.parse(text);
    for (const key of SECRET_KEYS) {
      assert.ok(key in example, `${key} should be listed so people know to set it in .env`);
      assert.ok(example[key] === '', `${key} in .env.example must be empty (value <redacted>)`);
    }
    const leaks = text
      .split(/\r?\n/)
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(({ line }) => /\b(?:SMTP_PASS|MS365_PASSWORD|MS365_CLIENT_SECRET)[ \t]*=[ \t]*[^\s#]/.test(line))
      .map(({ number }) => number);
    assert.deepEqual(leaks, [], 'line numbers that assign a value to a secret (values <redacted>)');
  });

  it('the Microsoft 365 switch described in .env.example validates for production', () => {
    const text = readFileSync(EXAMPLE, 'utf8');
    assert.match(text, /MAIL_PROVIDER=office365/, 'documents the Microsoft 365 switch');

    const config = loadConfig({
      ...dotenv.parse(text),
      NODE_ENV: 'production',
      CLIENT_URL: 'https://alpha4infra.com',
      CORS_ORIGINS: 'https://alpha4infra.com,https://www.alpha4infra.com',
      MAIL_PROVIDER: 'office365',
      MAIL_FROM_ADDRESS: LIVE_ADMIN,
      MAIL_TEAM_TO: LIVE_ADMIN,
      MAIL_REPLY_TO: LIVE_ADMIN,
      MS365_AUTH: 'oauth2',
      MS365_TENANT_ID: '00000000-0000-0000-0000-000000000000',
      MS365_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
      MS365_CLIENT_SECRET: 'dummy-client-secret',
      MS365_SENDER: LIVE_ADMIN,
    });
    assert.equal(config.mail.provider, 'office365');
    assert.deepEqual(config.mail.teamTo, [LIVE_ADMIN]);
    assert.deepEqual(config.mail.from, { name: FROM_NAME, address: LIVE_ADMIN });
    assert.equal(config.mail.replyTo, LIVE_ADMIN);
    assert.equal(config.mail.office365.sender, LIVE_ADMIN);
    assert.equal(config.brand.email, LIVE_ADMIN);
  });

  it(
    'server/.env (local, gitignored) validates',
    { skip: existsSync(LOCAL_ENV) ? false : 'server/.env is not present (it is local and gitignored)' },
    () => {
      const local = dotenv.parse(readFileSync(LOCAL_ENV, 'utf8'));
      const secrets = SECRET_KEYS.map((key) => local[key]).filter(Boolean);
      const redact = (text) =>
        secrets.reduce((result, secret) => result.split(secret).join('<redacted>'), String(text));

      let config;
      try {
        config = loadConfig({ ...local });
      } catch (error) {
        assert.fail(redact(error.message));
      }
      assert.ok(config.mail.teamTo.length > 0, 'admin notifications need at least one recipient');

      // Gmail only sends as the signed-in account (no specific address is asserted: it changes at the M365 switch).
      if (config.mail.provider === 'smtp' && /(^|\.)gmail\.com$/i.test(config.mail.smtp.host ?? '')) {
        assert.ok(
          Boolean(config.mail.smtp.user) && Boolean(config.mail.smtp.pass),
          'Gmail needs SMTP_USER and an App Password (SMTP_PASS)',
        );
        assert.ok(
          config.mail.from.address.toLowerCase() === config.mail.smtp.user.toLowerCase(),
          'MAIL_FROM_ADDRESS must be the Gmail account in SMTP_USER',
        );
      }
    },
  );

  it('git ignores server/.env (it holds real credentials) but keeps .env.example', () => {
    const rules = readText(ROOT_DIR, '.gitignore')
      .split(/\r?\n/)
      .map((line) => line.trim());
    assert.ok(
      rules.some((rule) => ['.env', '*.env', '**/.env', 'server/.env', '/server/.env'].includes(rule)),
      '.gitignore must ignore .env',
    );
    const ignoresExample = rules.some((rule) => ['.env.*', '*.example', '.env.example'].includes(rule));
    assert.ok(!ignoresExample || rules.includes('!.env.example'), '.env.example must stay committed');
  });
});

describe('end to end: a website enquiry under each mailbox configuration', () => {
  const websiteEnquiry = {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98200 12345',
    residence: 'Not sure yet',
    budget: '₹5 – 10 Cr',
    message: 'We are looking for a 4 BHK in Chennai. Please call me this week.',
    consent: true,
    source: 'website/enquiry',
  };
  const footerContact = `+91 94443 14567 · +91 94442 54567 · ${LIVE_ADMIN}`;
  const scenarios = [
    {
      title: 'testing: Gmail mailbox it.support.enexio@gmail.com',
      env: gmailEnv({
        MAIL_TEAM_CC: 'directors@example.com',
        MAIL_REPLY_TO: LIVE_ADMIN,
        BRAND_EMAIL: LIVE_ADMIN,
        BRAND_PHONE_ALT: '+91 94442 54567',
      }),
      admin: TEST_ADMIN,
      sender: TEST_ADMIN,
      cc: ['directors@example.com'],
    },
    {
      title: 'live: Microsoft 365 mailbox sales@alpha4infra.com',
      env: m365OAuthEnv({ BRAND_PHONE_ALT: '+91 94442 54567' }),
      admin: LIVE_ADMIN,
      sender: LIVE_ADMIN,
      cc: undefined,
    },
  ];

  for (const scenario of scenarios) {
    it(`${scenario.title}: the admin and the visitor each receive an email`, async () => {
      const { app, provider, whenIdle } = appFor(scenario.env);
      await request(app).post('/api/enquiries').send(websiteEnquiry).expect(201);
      await whenIdle();

      assert.equal(provider.sent.length, 2, 'one email to the admin, one to the visitor');
      const [admin, visitor] = provider.sent;
      assert.deepEqual(admin.to, [scenario.admin]);
      assert.deepEqual(admin.cc, scenario.cc);
      assert.equal(admin.replyTo, websiteEnquiry.email, 'the admin replies straight to the visitor');
      assert.equal(visitor.to, websiteEnquiry.email);
      assert.equal(visitor.cc, undefined, 'MAIL_TEAM_CC copies the admin notification only');
      assert.equal(visitor.replyTo, LIVE_ADMIN, "the visitor's replies reach the sales mailbox");
      for (const email of [admin, visitor]) {
        assert.deepEqual(email.from, { name: FROM_NAME, address: scenario.sender });
        assert.ok(email.html.includes(`mailto:${LIVE_ADMIN}`), 'footer contact comes from BRAND_EMAIL');
        assert.ok(email.html.includes('+91 94442 54567'), 'footer shows BRAND_PHONE_ALT');
        assert.ok(email.text.includes(footerContact), 'plain-text footer lists both numbers and the contact email');
      }
    });
  }
});
