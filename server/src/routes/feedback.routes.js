import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { feedbackSchema } from '../validators/feedback.validator.js';

export function createFeedbackRoutes(controller, limiters) {
  const router = Router();
  router.post('/', limiters.forms, validate(feedbackSchema), controller.create);
  return router;
}
