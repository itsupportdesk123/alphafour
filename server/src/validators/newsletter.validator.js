import { z } from 'zod';
import { emailField, honeypotField, nameField, optional, sourceField } from './common.validator.js';

/** POST /api/newsletter/subscribe */
export const newsletterSchema = z.object({
  email: emailField,
  name: optional(nameField),
  source: sourceField,
  company: honeypotField,
});
