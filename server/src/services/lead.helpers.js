import { formatTimestampIST } from '../utils/time.js';
import { generateReference } from '../utils/reference.js';

/** "Aarav Mehta" → "Aarav" */
export function firstNameOf(name) {
  return String(name ?? '').trim().split(/\s+/)[0] ?? '';
}

/** Honeypot: real visitors never fill the hidden "company" field. */
export function isSpam(input) {
  return typeof input.company === 'string' && input.company.trim().length > 0;
}

/** Receipt returned to the browser. */
export function receipt(type, reference, extra = {}) {
  return { reference, type, receivedAt: new Date().toISOString(), ...extra };
}

/** A believable receipt for bots, so they learn nothing from the response. */
export function spamReceipt(type) {
  return receipt(type, generateReference(type === 'feedback' ? 'FDB' : 'AUR'));
}

/** WhatsApp links need the full international number; numbers typed without a country code are Indian. */
function whatsappNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

/** Quick-reply buttons for the sales team email. */
export function contactActions({ name, email, phone }, reference) {
  const actions = [];
  if (email) {
    const subject = encodeURIComponent(`Re: your Alphafour Infrastructure Pvt Ltd enquiry ${reference}`);
    actions.push({ label: 'Reply by email', href: `mailto:${email}?subject=${subject}` });
  }
  if (phone) {
    actions.push({ label: 'Call now', href: `tel:${phone}`, secondary: true });
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      const text = encodeURIComponent(`Hello ${firstNameOf(name)}, this is the Alphafour Infrastructure Pvt Ltd team regarding ${reference}.`);
      actions.push({ label: 'WhatsApp', href: `https://wa.me/${whatsappNumber(phone)}?text=${text}`, secondary: true });
    }
  }
  return actions;
}

export const NOT_PROVIDED = 'Not provided';

/** Every lead form requires consent. There is no database, so the team email is the record of it. */
export const CONSENT_ROW = Object.freeze({ label: 'Consent', value: 'Agreed to be contacted and accepted the privacy policy' });

const isFilled = (value) => value !== undefined && value !== null && String(value).trim() !== '';

/**
 * Detail rows for the team (admin) email: every field the website form shows, so each lead
 * reads the same and the team can see what was left blank ("Not provided").
 * Fields marked `hideIfEmpty` are accepted by the API but not shown on the form; they appear only when sent.
 * @param {Array<{ label: string, value?: unknown, href?: string, hideIfEmpty?: boolean }>} fields
 */
export function teamRows(fields) {
  return fields
    .filter((field) => !field.hideIfEmpty || isFilled(field.value))
    .map(({ label, value, href }) =>
      isFilled(value) ? { label, value: String(value), href } : { label, value: NOT_PROVIDED, muted: true },
    );
}

/** Detail rows for the visitor's copy ("Your submission details"): only what they filled in, without the team's links. */
export function visitorRows(fields) {
  return fields.filter((field) => isFilled(field.value)).map(({ label, value }) => ({ label, value: String(value) }));
}

/** Footer context for team notifications. */
export function submissionContext(input, meta) {
  return {
    submittedAt: formatTimestampIST(),
    source: input.source,
    requestId: meta.requestId,
  };
}
