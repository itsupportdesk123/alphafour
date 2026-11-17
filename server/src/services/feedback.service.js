import { generateReference } from '../utils/reference.js';
import {
  contactActions,
  firstNameOf,
  isSpam,
  receipt,
  spamReceipt,
  submissionContext,
  teamRows,
  visitorRows,
} from './lead.helpers.js';

export const FEEDBACK_TOPICS = Object.freeze({
  overall: 'Overall experience',
  website: 'Website',
  'site-visit': 'Site visit',
  sales: 'Sales advisor',
  'after-sales': 'Home ownership & after-sales',
});

// Worded like the website's answers.
const recommendAnswer = (value) => (value === undefined ? undefined : value ? 'Yes, gladly' : 'Not yet');

/** Business logic for visitor and homeowner feedback. */
export class FeedbackService {
  constructor({ mailService, logger }) {
    this.mailService = mailService;
    this.logger = logger.child({ layer: 'service', service: 'feedback' });
  }

  async submitFeedback(input, meta) {
    if (isSpam(input)) return spamReceipt('feedback');
    const reference = generateReference('FDB');
    const topicLabel = FEEDBACK_TOPICS[input.topic];
    const who = input.name ?? 'A visitor';
    const stars = '★'.repeat(input.rating) + '☆'.repeat(5 - input.rating);
    const lowRating = input.rating <= 2;
    // The visitor's email shows the rating and topic in its own panel, so they are kept apart from the other fields.
    const ratingFields = [
      { label: 'Rating', value: `${stars}  (${input.rating}/5)` },
      { label: 'Topic', value: topicLabel },
    ];
    const fields = [
      { label: 'Name', value: input.name },
      { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      // Accepted by the API, but the website's feedback form does not ask for them.
      { label: 'Phone', value: input.phone, href: `tel:${input.phone}`, hideIfEmpty: true },
      { label: 'Residence', value: input.residence, hideIfEmpty: true },
      { label: 'Would recommend', value: recommendAnswer(input.recommend) },
      { label: 'Feature as testimonial', value: input.allowTestimonial ? 'Yes, first name only' : 'No, keep private' },
    ];

    await this.mailService.notifyTeam({
      subject: `${lowRating ? '⚠ ' : ''}Feedback ${input.rating}/5 · ${topicLabel} · ${who} [${reference}]`,
      replyTo: input.email,
      preheader: `${who} rated ${topicLabel.toLowerCase()} ${input.rating} out of 5.`,
      context: {
        eyebrow: 'Guest feedback',
        heading: `${input.rating} / 5 · ${topicLabel}`,
        intro: lowRating
          ? `${who} had a disappointing experience. Please follow up personally within 24 hours.`
          : `${who} shared feedback about ${topicLabel.toLowerCase()}.`,
        reference,
        details: teamRows([...ratingFields, ...fields]),
        message: input.message,
        messageLabel: 'Feedback',
        actions: contactActions(input, reference),
        ...submissionContext(input, meta),
      },
    });

    if (input.email) {
      this.mailService.enqueue({
        template: 'feedback-thanks',
        to: input.email,
        subject: `Thank you for your feedback · ${reference}`,
        preheader: 'Your note has been shared with our leadership team.',
        context: {
          heading: input.name ? `Thank you, ${firstNameOf(input.name)}` : 'Thank you for your feedback',
          reference,
          rating: input.rating,
          topicLabel,
          lowRating,
          details: visitorRows(fields),
          message: input.message,
        },
      });
    }

    this.logger.info({ reference, rating: input.rating, topic: input.topic, requestId: meta.requestId }, 'Feedback received');
    return receipt('feedback', reference);
  }
}
