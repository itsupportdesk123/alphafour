import { AppError } from '../utils/AppError.js';

/** Converts zod issues to [{ field, message }] keeping the first message per field. */
export function formatZodIssues(error) {
  const seen = new Map();
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'form';
    if (!seen.has(field)) seen.set(field, issue.message);
  }
  return [...seen].map(([field, message]) => ({ field, message }));
}

/**
 * Validates and normalises `req[source]` with a zod schema.
 * The parsed (sanitised, coerced) value replaces req.body and is exposed as req.validated.
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body' | 'query' | 'params'} [source]
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      next(AppError.validation(formatZodIssues(result.error)));
      return;
    }
    req.validated = result.data;
    if (source === 'body') req.body = result.data;
    next();
  };
}
