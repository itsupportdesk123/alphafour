import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/api-response.js';

/**
 * Global error handler: every error leaves the API in the same envelope.
 * Operational errors (AppError) keep their status and message; anything else
 * is logged with its stack and reported as a generic 500.
 */
export function createErrorHandler(logger) {
  // Express recognises error handlers by their four parameters.
  return (err, req, res, _next) => {
    if (err?.type === 'entity.too.large') {
      return sendError(res, { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' });
    }
    if (err?.type === 'entity.parse.failed') {
      return sendError(res, { status: 400, code: 'BAD_REQUEST', message: 'Malformed JSON in request body' });
    }

    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error({ err, cause: err.cause, requestId: req.id }, err.message);
      }
      return sendError(res, {
        status: err.statusCode,
        code: err.code,
        message: err.message,
        errors: err.errors,
      });
    }

    logger.error({ err, requestId: req.id }, 'Unhandled error');
    return sendError(res, {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side. Please try again shortly.',
    });
  };
}
