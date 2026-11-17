import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createErrorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { createRateLimiters } from './middlewares/rate-limit.js';
import { requestId } from './middlewares/request-id.js';
import { createApiRouter } from './routes/index.js';
import { sendSuccess } from './utils/api-response.js';

/**
 * Builds the Express application (no `listen`, so tests can use supertest).
 * @param {ReturnType<typeof import('./container.js').createContainer>} container
 */
export function createApp(container) {
  const { config, logger, controllers } = container;
  const app = express();
  const limiters = createRateLimiters(config);

  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || config.corsOrigins.includes(origin)),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy', 'Retry-After'],
      maxAge: 86_400,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '20kb' }));

  app.get('/', (_req, res) =>
    sendSuccess(res, { message: 'Alphafour Infrastructure Pvt Ltd API', data: { api: '/api', health: '/api/health' } }),
  );
  app.use('/api', limiters.api, createApiRouter({ controllers, limiters }));

  app.use(notFound);
  app.use(createErrorHandler(logger));

  return app;
}
