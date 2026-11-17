/**
 * Consistent JSON envelope for every response.
 *   success → { success: true,  message, data, requestId }
 *   failure → { success: false, message, code, errors?, requestId }
 */
export function sendSuccess(res, { status = 200, message = 'OK', data = null } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
    requestId: res.req?.id,
  });
}

export function sendError(res, { status = 500, message, code = 'INTERNAL_ERROR', errors } = {}) {
  const body = {
    success: false,
    message: message ?? 'Something went wrong',
    code,
    requestId: res.req?.id,
  };
  if (errors && errors.length > 0) body.errors = errors;
  return res.status(status).json(body);
}
