import { z } from 'zod';

const PHONE = /^\+?[0-9\s\-().]{7,20}$/;
const digitsBetween = (value, min, max) => {
  const n = value.replace(/\D/g, '').length;
  return n >= min && n <= max;
};

export const SITE_VISIT_SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

export const CALLBACK_TIMES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'morning', label: 'Morning · 10 am – 12 pm' },
  { value: 'afternoon', label: 'Afternoon · 12 – 4 pm' },
  { value: 'evening', label: 'Evening · 4 – 7 pm' },
];

export const FEEDBACK_TOPICS = [
  { value: 'overall', label: 'Overall experience' },
  { value: 'website', label: 'This website' },
  { value: 'site-visit', label: 'Site visit' },
  { value: 'sales', label: 'Sales advisor' },
  { value: 'after-sales', label: 'Home ownership & after-sales' },
];

export const BUDGETS = [
  { value: 'Under ₹5 Cr', label: 'Under ₹5 Cr' },
  { value: '₹5 – 10 Cr', label: '₹5 – 10 Cr' },
  { value: '₹10 – 25 Cr', label: '₹10 – 25 Cr' },
  { value: '₹25 Cr +', label: '₹25 Cr +' },
];

const name = z.string().trim().min(2, 'Please enter your full name').max(80, 'Name is too long');
const email = z.string().trim().min(1, 'Please enter your email address').email('Please enter a valid email address');
const phone = z
  .string()
  .trim()
  .min(1, 'Please enter your phone number')
  .regex(PHONE, 'Please enter a valid phone number')
  .refine((v) => digitsBetween(v, 8, 15), 'Please enter a valid phone number');
const optionalEmail = z.union([z.literal(''), email]).optional();
const consent = z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy to continue' }) });
const honeypot = z.string().optional();

export const enquirySchema = z.object({
  name,
  email,
  phone,
  residence: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000, 'Please keep it under 2,000 characters'),
  consent,
  company: honeypot,
});

export const siteVisitSchema = z.object({
  name,
  email,
  phone,
  residence: z.string().optional(),
  date: z.string().min(1, 'Please choose a date'),
  time: z.string().min(1, 'Please choose a time slot'),
  guests: z.coerce.number().int().min(1).max(10),
  message: z.string().max(1000, 'Please keep it under 1,000 characters').optional(),
  consent,
  company: honeypot,
});

export const callbackSchema = z.object({
  name,
  phone,
  email: optionalEmail,
  preferredTime: z.string().min(1),
  residence: z.string().optional(),
  consent,
  company: honeypot,
});

export const feedbackSchema = z.object({
  name: z.union([z.literal(''), name]).optional(),
  email: optionalEmail,
  rating: z.number({ invalid_type_error: 'Please choose a rating' }).int().min(1, 'Please choose a rating').max(5),
  topic: z.string().min(1),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000, 'Please keep it under 2,000 characters'),
  recommend: z.enum(['yes', 'no', '']).optional(),
  allowTestimonial: z.boolean().optional(),
  company: honeypot,
});

export const newsletterSchema = z.object({
  email,
  company: honeypot,
});

/** Removes empty optional strings so the API receives clean payloads. */
export function compact(values) {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v !== undefined && v !== null));
}
