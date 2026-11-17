import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { createContainer } from './container.js';

let config;
try {
  config = loadConfig();
} catch (error) {
  // The logger is not available yet, so stderr is the only channel left.
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n\n`);
  process.exit(1);
}

const container = createContainer(config);
const { logger, services } = container;
const app = createApp(container);

const server = app.listen(config.port, () => {
  logger.info(
    { port: config.port, env: config.env, mailProvider: services.mailService.providerName },
    `Alphafour API ready on http://localhost:${config.port}/api`,
  );
});

if (config.mail.verifyOnStartup) {
  services.mailService.verify().then((status) => {
    if (status.verified) {
      logger.info({ provider: status.provider }, 'Mail transport verified');
    } else {
      logger.warn(
        { provider: status.provider, error: status.error },
        'Mail transport could not be verified. Emails will fail until the SMTP settings are fixed.',
      );
    }
  });
}

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down gracefully');
  const forceExit = setTimeout(() => process.exit(1), 15_000);
  forceExit.unref();
  server.close();
  await services.mailService.shutdown(10_000);
  logger.info('Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'Unhandled promise rejection'));
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  void shutdown('uncaughtException');
});
