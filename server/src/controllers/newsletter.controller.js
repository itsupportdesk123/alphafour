import { sendSuccess } from '../utils/api-response.js';
import { requestMeta } from '../utils/request-meta.js';

export class NewsletterController {
  constructor({ newsletterService }) {
    this.newsletterService = newsletterService;
  }

  /** POST /api/newsletter/subscribe */
  subscribe = async (req, res) => {
    const data = await this.newsletterService.subscribe(req.body, requestMeta(req));
    return sendSuccess(res, {
      status: 201,
      message: 'Welcome to the Alphafour Infrastructure Pvt Ltd private list. Please check your inbox.',
      data,
    });
  };
}
