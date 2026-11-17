import { randomUUID } from 'node:crypto';

const VALID_ID = /^[A-Za-z0-9._-]{8,64}$/;

/** Reuses a well-formed incoming X-Request-Id or creates one, and echoes it back. */
export function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.set('X-Request-Id', req.id);
  next();
}
