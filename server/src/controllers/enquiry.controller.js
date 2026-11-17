import { sendSuccess } from '../utils/api-response.js';
import { requestMeta } from '../utils/request-meta.js';

/** HTTP layer for enquiries: reads the validated body, calls the service, responds. */
export class EnquiryController {
  constructor({ enquiryService }) {
    this.enquiryService = enquiryService;
  }

  /** POST /api/enquiries */
  create = async (req, res) => {
    const data = await this.enquiryService.submitEnquiry(req.body, requestMeta(req));
    return sendSuccess(res, {
      status: 201,
      message: 'Thank you. An advisor from Alphafour Infrastructure Pvt Ltd will be in touch within one business day.',
      data,
    });
  };

  /** POST /api/enquiries/site-visit */
  siteVisit = async (req, res) => {
    const data = await this.enquiryService.requestSiteVisit(req.body, requestMeta(req));
    return sendSuccess(res, {
      status: 201,
      message: 'Your private viewing is requested. We’ll call to confirm the slot shortly.',
      data,
    });
  };

  /** POST /api/enquiries/callback */
  callback = async (req, res) => {
    const data = await this.enquiryService.requestCallback(req.body, requestMeta(req));
    return sendSuccess(res, {
      status: 201,
      message: 'Thank you. An advisor will call you at your preferred time.',
      data,
    });
  };
}
