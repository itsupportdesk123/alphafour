import { firstNameOf, isSpam, submissionContext, teamRows, visitorRows } from './lead.helpers.js';

/**
 * Newsletter sign-ups. Without a database the sales team receives each new
 * subscriber by email (to add to their mailing tool) and the subscriber gets a welcome email.
 */
export class NewsletterService {
  constructor({ mailService, logger }) {
    this.mailService = mailService;
    this.logger = logger.child({ layer: 'service', service: 'newsletter' });
  }

  async subscribe(input, meta) {
    const result = { email: input.email, status: 'subscribed', receivedAt: new Date().toISOString() };
    if (isSpam(input)) return result;
    const fields = [
      { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      // Accepted by the API, but the website's sign-up form only asks for an email.
      { label: 'Name', value: input.name, hideIfEmpty: true },
    ];

    await this.mailService.notifyTeam({
      subject: `New newsletter subscriber · ${input.email}`,
      replyTo: input.email,
      preheader: `${input.name ?? input.email} joined the Alphafour Infrastructure Pvt Ltd private list.`,
      context: {
        eyebrow: 'Newsletter',
        heading: 'New subscriber',
        intro: `${input.name ?? input.email} joined the Alphafour Infrastructure Pvt Ltd private list. Please add them to the mailing list.`,
        details: teamRows(fields),
        actions: [{ label: 'Email subscriber', href: `mailto:${input.email}` }],
        ...submissionContext(input, meta),
      },
    });

    const firstName = input.name ? firstNameOf(input.name) : '';
    this.mailService.enqueue({
      template: 'newsletter-welcome',
      to: input.email,
      subject: 'Welcome to the Alphafour Infrastructure Pvt Ltd private list',
      preheader: 'First access to launches, private previews and market notes.',
      context: {
        heading: firstName ? `Welcome, ${firstName}` : 'Welcome to Alphafour Infrastructure Pvt Ltd',
        email: input.email,
        details: visitorRows(fields),
      },
    });

    this.logger.info({ requestId: meta.requestId }, 'Newsletter subscription received');
    return result;
  }
}
