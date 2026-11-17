import { z } from 'zod';
import { addDays, isValidDateString, todayInIST } from '../utils/time.js';
import {
  consentField,
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

export const SITE_VISIT_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
export const CALLBACK_TIME_KEYS = ['asap', 'morning', 'afternoon', 'evening'];
export const SITE_VISIT_WINDOW_DAYS = 60;

const residenceField = optional(shortText(120, 'Residence'));

/** POST /api/enquiries */
export const enquirySchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: optional(shortText(120, 'Subject')),
  residence: residenceField,
  budget: optional(shortText(60, 'Budget')),
  message: messageField({ min: 10, max: 2000 }),
  consent: consentField,
  source: sourceField,
  company: honeypotField,
});

/** POST /api/enquiries/site-visit */
export const siteVisitSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  residence: residenceField,
  date: z
    .string({ required_error: 'Please choose a date', invalid_type_error: 'Please choose a date' })
    .trim()
    .superRefine((value, ctx) => {
      if (!isValidDateString(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please choose a valid date' });
        return;
      }
      const today = todayInIST();
      if (value < addDays(today, 1) || value > addDays(today, SITE_VISIT_WINDOW_DAYS)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Please choose a date between tomorrow and the next ${SITE_VISIT_WINDOW_DAYS} days`,
        });
      }
    }),
  time: z.enum(SITE_VISIT_SLOTS, { errorMap: () => ({ message: 'Please choose an available time slot' }) }),
  guests: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ invalid_type_error: 'Guests must be a number' })
      .int('Guests must be a whole number')
      .min(1, 'At least one guest')
      .max(10, 'Up to 10 guests per visit')
      .default(2),
  ),
  message: optional(messageField({ min: 0, max: 1000 })),
  consent: consentField,
  source: sourceField,
  company: honeypotField,
});

/** POST /api/enquiries/callback */
export const callbackSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: optional(emailField),
  preferredTime: z.preprocess(
    emptyToUndefined,
    z.enum(CALLBACK_TIME_KEYS, { errorMap: () => ({ message: 'Please choose a preferred time' }) }).default('asap'),
  ),
  residence: residenceField,
  message: optional(messageField({ min: 0, max: 1000 })),
  consent: consentField,
  source: sourceField,
  company: honeypotField,
});
