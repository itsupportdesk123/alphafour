import { sendSuccess } from '../utils/api-response.js';
import { requestMeta } from '../utils/request-meta.js';

export class FeedbackController {
  constructor({ feedbackService }) {
    this.feedbackService = feedbackService;
  }

  /** POST /api/feedback */
  create = async (req, res) => {
    const data = await this.feedbackService.submitFeedback(req.body, requestMeta(req));
    return sendSuccess(res, {
      status: 201,
      message: 'Thank you for your feedback. It has been shared with our leadership team.',
      data,
    });
  };
}
