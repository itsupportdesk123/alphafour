import { Router } from 'express';
import { createEnquiryRoutes } from './enquiry.routes.js';
import { createFeedbackRoutes } from './feedback.routes.js';
import { createNewsletterRoutes } from './newsletter.routes.js';

/** Mounts every API route under /api. */
export function createApiRouter({ controllers, limiters }) {
  const router = Router();
  router.get('/', controllers.health.index);
  router.get('/health', controllers.health.check);
  router.use('/enquiries', createEnquiryRoutes(controllers.enquiry, limiters));
  router.use('/feedback', createFeedbackRoutes(controllers.feedback, limiters));
  router.use('/newsletter', createNewsletterRoutes(controllers.newsletter, limiters));
  return router;
}
