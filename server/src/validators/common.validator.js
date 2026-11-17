import { z } from 'zod';
import { cleanMultiline, cleanText, normalizePhone } from '../utils/sanitize.js';

const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

/** Optional field that also treats "" and null as "not provided". */
export const optional = (schema) => z.preprocess(emptyToUndefined, schema.optional());

export const nameField = z
  .string({ required_error: 'Please enter your name', invalid_type_error: 'Please enter your name' })
  .transform(cleanText)
  .pipe(z.string().min(2, 'Please enter your full name').max(80, 'Name is too long'));

export const emailField = z
  .string({ required_error: 'Please enter your email address', invalid_type_error: 'Please enter your email address' })
  .trim()
  .toLowerCase()
  .max(120, 'Email address is too long')
  .email('Please enter a valid email address');

export const phoneField = z
  .string({ required_error: 'Please enter your phone number', invalid_type_error: 'Please enter your phone number' })
  .trim()
  .regex(/^\+?[0-9\s\-().]{7,20}$/, 'Please enter a valid phone number')
  .transform(normalizePhone)
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 8 && digits <= 15;
  }, 'Please enter a valid phone number');

export const shortText = (max, label) =>
  z
    .string({ invalid_type_error: `${label} must be text` })
    .transform(cleanText)
    .pipe(z.string().max(max, `${label} is too long`));

export const messageField = ({ min = 10, max = 2000 } = {}) =>
  z
    .string({ required_error: 'Please write a short message', invalid_type_error: 'Please write a short message' })
    .transform(cleanMultiline)
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `Please write at least ${min} characters` : 'Message is required')
        .max(max, `Please keep your message under ${max} characters`),
    );

export const consentField = z.literal(true, {
  errorMap: () => ({ message: 'Please accept the privacy policy to continue' }),
});

/** Honeypot. Visible to bots only; humans leave it empty. */
export const honeypotField = optional(z.string().max(500));

/** Page or component that produced the lead, e.g. "home/site-visit". */
export const sourceField = optional(shortText(120, 'Source'));

export { emptyToUndefined };
