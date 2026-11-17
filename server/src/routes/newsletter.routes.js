import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { newsletterSchema } from '../validators/newsletter.validator.js';

export function createNewsletterRoutes(controller, limiters) {
  const router = Router();
  router.post('/subscribe', limiters.forms, validate(newsletterSchema), controller.subscribe);
  return router;
}
