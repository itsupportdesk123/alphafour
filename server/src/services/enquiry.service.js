import { buildIcsEvent } from '../utils/ics.js';
import { generateReference } from '../utils/reference.js';
import { formatLongDate, formatTimeSlot, istToUtc } from '../utils/time.js';
import {
  CONSENT_ROW,
  contactActions,
  firstNameOf,
  isSpam,
  receipt,
  spamReceipt,
  submissionContext,
  teamRows,
  visitorRows,
} from './lead.helpers.js';

export const CALLBACK_WINDOWS = Object.freeze({
  asap: { label: 'As soon as possible', sentence: 'as soon as possible during our working hours (10:00–19:00 IST)' },
  morning: { label: 'Morning · 10 am – 12 pm', sentence: 'in the morning, between 10 am and 12 pm' },
  afternoon: { label: 'Afternoon · 12 – 4 pm', sentence: 'in the afternoon, between 12 and 4 pm' },
  evening: { label: 'Evening · 4 – 7 pm', sentence: 'in the evening, between 4 and 7 pm' },
});

// The website's residence selects offer "Not sure yet, please advise" (value "Not sure yet"), which is not a residence.
const UNDECIDED_RESIDENCE = 'Not sure yet';
/** The residence to name in sentences, subjects and calendar invites, when the visitor chose one. */
const chosenResidence = (residence) => (residence && residence !== UNDECIDED_RESIDENCE ? residence : undefined);

// The short enquiry card on residence pages and the brochure form do not ask for a budget.
const FORMS_WITHOUT_BUDGET = /\/(sticky-card|brochure)$/;

/**
 * Business logic for sales enquiries: contact form, private site visits and call-backs.
 * Each lead sends (1) a notification to the sales team (admin) listing every form field and
 * (2) a confirmation to the visitor with the details they submitted.
 */
export class EnquiryService {
  constructor({ mailService, config, logger }) {
    this.mailService = mailService;
    this.brand = config.brand;
    this.logger = logger.child({ layer: 'service', service: 'enquiry' });
  }

  async submitEnquiry(input, meta) {
    if (isSpam(input)) return spamReceipt('enquiry');
    const reference = generateReference();
    const residence = chosenResidence(input.residence);
    const about = residence ? ` about ${residence}` : '';
    const fields = [
      { label: 'Full name', value: input.name },
      { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      { label: 'Phone', value: input.phone, href: `tel:${input.phone}` },
      { label: 'Residence', value: input.residence },
      { label: 'Budget', value: input.budget, hideIfEmpty: FORMS_WITHOUT_BUDGET.test(input.source ?? '') },
      // Set by the brochure form only.
      { label: 'Subject', value: input.subject, hideIfEmpty: true },
    ];

    await this.mailService.notifyTeam({
      subject: `New enquiry · ${input.name}${residence ? ` · ${residence}` : ''} [${reference}]`,
      replyTo: input.email,
      preheader: `${input.name} sent an enquiry${about}.`,
      context: {
        eyebrow: 'Website enquiry',
        heading: input.subject || 'New enquiry',
        intro: `${input.name} would like to hear from us${about}. Please respond within one business day.`,
        reference,
        details: [...teamRows(fields), CONSENT_ROW],
        message: input.message,
        actions: contactActions(input, reference),
        ...submissionContext(input, meta),
      },
    });

    this.mailService.enqueue({
      template: 'enquiry-confirmation',
      to: input.email,
      subject: `Thank you for your enquiry · ${reference}`,
      preheader: 'Your advisor from Alphafour Infrastructure Pvt Ltd will be in touch within one business day.',
      context: {
        heading: `Thank you, ${firstNameOf(input.name)}`,
        reference,
        residence,
        details: visitorRows(fields),
        message: input.message,
      },
    });

    this.logger.info({ reference, requestId: meta.requestId }, 'Enquiry received');
    return receipt('enquiry', reference);
  }

  async requestSiteVisit(input, meta) {
    if (isSpam(input)) return spamReceipt('site-visit');
    const reference = generateReference();
    const dateLabel = formatLongDate(input.date);
    const timeLabel = formatTimeSlot(input.time);
    const guestsLabel = input.guests === 1 ? 'guest' : 'guests';
    const residence = chosenResidence(input.residence);
    const place = residence ?? 'the Alphafour Infrastructure Pvt Ltd office in Royapettah, Chennai';
    // The visitor's email shows the slot in its own panel, so it is kept apart from the other fields.
    const slotFields = [
      { label: 'Preferred date', value: dateLabel },
      { label: 'Time slot', value: `${timeLabel} IST` },
      { label: 'Guests', value: input.guests },
    ];
    const fields = [
      { label: 'Residence', value: input.residence },
      { label: 'Full name', value: input.name },
      { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      { label: 'Phone', value: input.phone, href: `tel:${input.phone}` },
    ];

    await this.mailService.notifyTeam({
      subject: `Site visit · ${dateLabel}, ${timeLabel} · ${input.name} [${reference}]`,
      replyTo: input.email,
      preheader: `${input.name} requested a private viewing on ${dateLabel} at ${timeLabel}.`,
      context: {
        eyebrow: 'Private viewing',
        heading: 'New site visit request',
        intro: `${input.name} would like to visit ${place} on ${dateLabel} at ${timeLabel} IST. Please call to confirm the slot.`,
        reference,
        details: [...teamRows([...slotFields, ...fields]), CONSENT_ROW],
        message: input.message,
        messageLabel: 'Notes from the visitor',
        actions: contactActions(input, reference),
        ...submissionContext(input, meta),
      },
    });

    const calendarInvite = buildIcsEvent({
      uid: `${reference}@alpha4infra.com`,
      start: istToUtc(input.date, input.time),
      durationMinutes: 60,
      summary: `Private viewing · ${residence ?? this.brand.name}`,
      description: `Your private viewing with ${this.brand.name} (ref ${reference}). Your advisor will call to confirm. Questions: ${this.brand.phone}`,
      location: this.brand.address,
      url: this.brand.siteUrl,
      organizer: { name: this.brand.name, email: this.brand.email },
    });

    this.mailService.enqueue({
      template: 'site-visit-confirmation',
      to: input.email,
      subject: `Your private viewing request · ${dateLabel} · ${reference}`,
      preheader: `${dateLabel} at ${timeLabel} IST. We’ll call to confirm.`,
      context: {
        heading: `See you soon, ${firstNameOf(input.name)}`,
        reference,
        residence,
        dateLabel,
        timeLabel,
        guests: input.guests,
        guestsLabel,
        details: [
          ...visitorRows(fields),
          { label: 'Venue', value: this.brand.address, href: this.brand.mapsUrl },
          { label: 'Reference', value: reference },
        ],
        message: input.message,
      },
      attachments: [
        {
          filename: 'alphafour-private-viewing.ics',
          content: calendarInvite,
          contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
        },
      ],
    });

    this.logger.info({ reference, requestId: meta.requestId, date: input.date, slot: input.time }, 'Site visit requested');
    return receipt('site-visit', reference, { date: input.date, time: input.time });
  }

  async requestCallback(input, meta) {
    if (isSpam(input)) return spamReceipt('callback');
    const reference = generateReference();
    const window = CALLBACK_WINDOWS[input.preferredTime];
    const fields = [
      { label: 'Full name', value: input.name },
      { label: 'Phone', value: input.phone, href: `tel:${input.phone}` },
      { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      { label: 'Best time to call', value: window.label },
      // The call-back form has no residence field; one is listed only when it is sent.
      { label: 'Residence', value: input.residence, hideIfEmpty: true },
    ];

    await this.mailService.notifyTeam({
      subject: `Call-back · ${window.label} · ${input.name} [${reference}]`,
      replyTo: input.email,
      preheader: `${input.name} asked for a call ${window.sentence}.`,
      context: {
        eyebrow: 'Call-back request',
        heading: 'Please call this visitor',
        intro: `${input.name} would like a call ${window.sentence}.`,
        reference,
        details: [...teamRows(fields), CONSENT_ROW],
        message: input.message,
        actions: contactActions(input, reference),
        ...submissionContext(input, meta),
      },
    });

    if (input.email) {
      this.mailService.enqueue({
        template: 'callback-confirmation',
        to: input.email,
        subject: `We’ll call you shortly · ${reference}`,
        preheader: `An advisor from Alphafour Infrastructure Pvt Ltd will call you ${window.sentence}.`,
        context: {
          heading: `We’ll call you shortly, ${firstNameOf(input.name)}`,
          reference,
          phone: input.phone,
          windowSentence: window.sentence,
          details: visitorRows(fields),
          message: input.message,
        },
      });
    }

    this.logger.info({ reference, requestId: meta.requestId }, 'Call-back requested');
    return receipt('callback', reference);
  }
}
