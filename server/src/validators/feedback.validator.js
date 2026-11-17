import { z } from 'zod';
import {
  emailField,
  emptyToUndefined,
  honeypotField,
  messageField,
  nameField,
  optional,
  phoneField,
  shortText,
  sourceField,
} from './common.validator.js';

export const FEEDBACK_TOPIC_KEYS = ['overall', 'website', 'site-visit', 'sales', 'after-sales'];

/** POST /api/feedback */
export const feedbackSchema = z.object({
  name: optional(nameField),
  email: optional(emailField),
  phone: optional(phoneField),
  rating: z.coerce
    .number({ required_error: 'Please choose a rating', invalid_type_error: 'Please choose a rating' })
    .int('Please choose a rating between 1 and 5')
    .min(1, 'Please choose a rating between 1 and 5')
    .max(5, 'Please choose a rating between 1 and 5'),
  topic: z.preprocess(
    emptyToUndefined,
    z.enum(FEEDBACK_TOPIC_KEYS, { errorMap: () => ({ message: 'Please choose a topic' }) }).default('overall'),
  ),
  message: messageField({ min: 10, max: 2000 }),
  recommend: z.boolean({ invalid_type_error: 'Please answer yes or no' }).optional(),
  allowTestimonial: z.boolean().default(false),
  residence: optional(shortText(120, 'Residence')),
  source: sourceField,
  company: honeypotField,
});
