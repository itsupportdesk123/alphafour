import { sendSuccess } from '../utils/api-response.js';

export class HealthController {
  constructor({ mailService, config }) {
    this.mailService = mailService;
    this.config = config;
  }

  /** GET /api/health */
  check = (_req, res) =>
    sendSuccess(res, {
      message: 'OK',
      data: {
        status: 'ok',
        environment: this.config.env,
        uptimeSec: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        mail: this.mailService.getStatus(),
      },
    });

  /** GET /api: a small index of what this API offers */
  index = (_req, res) =>
    sendSuccess(res, {
      message: 'Alphafour Infrastructure Pvt Ltd API',
      data: {
        version: '1.0.0',
        endpoints: [
          { method: 'GET', path: '/api/health', description: 'Service and mail transport status' },
          { method: 'POST', path: '/api/enquiries', description: 'Contact / sales enquiry' },
          { method: 'POST', path: '/api/enquiries/site-visit', description: 'Book a private site visit' },
          { method: 'POST', path: '/api/enquiries/callback', description: 'Request a call-back' },
          { method: 'POST', path: '/api/feedback', description: 'Share feedback' },
          { method: 'POST', path: '/api/newsletter/subscribe', description: 'Join the private list' },
        ],
      },
    });
}
