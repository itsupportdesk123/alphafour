/**
 * Operational error with an HTTP status and a stable machine-readable code.
 * Anything that is not an AppError is treated as an unexpected 500.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {{ code?: string, errors?: Array<{ field: string, message: string }>, cause?: unknown }} [options]
   */
  constructor(statusCode, message, { code = 'ERROR', errors, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message = 'Bad request', errors) {
    return new AppError(400, message, { code: 'BAD_REQUEST', errors });
  }

  static validation(errors, message = 'Please check the highlighted fields') {
    return new AppError(400, message, { code: 'VALIDATION_ERROR', errors });
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, message, { code: 'NOT_FOUND' });
  }

  static payloadTooLarge(message = 'Request body is too large') {
    return new AppError(413, message, { code: 'PAYLOAD_TOO_LARGE' });
  }

  static tooManyRequests(message = 'Too many requests. Please try again in a few minutes.') {
    return new AppError(429, message, { code: 'RATE_LIMITED' });
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', cause) {
    return new AppError(503, message, { code: 'SERVICE_UNAVAILABLE', cause });
  }
}
