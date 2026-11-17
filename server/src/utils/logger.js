import pino from 'pino';

/**
 * Creates the application logger. Pretty output in development, JSON elsewhere.
 * Sensitive headers are always redacted.
 */
export function createLogger(config) {
  const usePretty = config.env === 'development';
  return pino({
    level: config.logLevel,
    base: { service: 'aurelia-api' },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.pass', '*.clientSecret'],
      censor: '[redacted]',
    },
    transport: usePretty
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,service' } }
      : undefined,
  });
}
