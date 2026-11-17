import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { callbackSchema, enquirySchema, siteVisitSchema } from '../validators/enquiry.validator.js';

/**
 * @param {import('../controllers/enquiry.controller.js').EnquiryController} controller
 * @param {{ forms: import('express').RequestHandler }} limiters
 */
export function createEnquiryRoutes(controller, limiters) {
  const router = Router();
  router.post('/', limiters.forms, validate(enquirySchema), controller.create);
  router.post('/site-visit', limiters.forms, validate(siteVisitSchema), controller.siteVisit);
  router.post('/callback', limiters.forms, validate(callbackSchema), controller.callback);
  return router;
}
