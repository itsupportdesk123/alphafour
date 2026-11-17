import { rateLimit } from 'express-rate-limit';
import { sendError } from '../utils/api-response.js';

/**
 * api   – generous limit for every /api request
 * forms – strict limit for public form submissions (per IP)
 * Both are disabled in the test environment.
 */
export function createRateLimiters(config) {
  const common = {
    windowMs: config.rateLimit.windowMs,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => config.isTest,
    handler: (_req, res, _next, options) =>
      sendError(res, {
        status: options.statusCode,
        code: 'RATE_LIMITED',
        message: 'You’ve sent a lot of requests in a short time. Please wait a few minutes and try again.',
      }),
  };

  return {
    api: rateLimit({ ...common, limit: config.rateLimit.max }),
    forms: rateLimit({ ...common, limit: config.rateLimit.formMax }),
  };
}
