import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { createContainer } from '../src/container.js';
import { addDays, todayInIST } from '../src/utils/time.js';
import { MemoryMailProvider } from './helpers.js';

/*
 * End-to-end content of the emails every website form triggers: one admin notification (MAIL_TEAM_TO) that lists
 * every field the form shows, blanks as "Not provided", and one copy to the visitor with what they entered.
 *
 * Payloads mirror what the React forms post (client/src/components/forms/LeadForms.jsx and the brochure form in
 * client/src/features/residences/DetailParts.jsx): useLeadForm drops empty values and adds `source`.
 * Every app here is built from an explicit config with an in-memory provider, so no email ever leaves the process.
 */

const ADMIN = 'it.support.enexio@gmail.com'; // the testing inbox; production switches to sales@alpha4infra.com (Microsoft 365)
const SALES = 'sales@alpha4infra.com';
const FROM = { name: 'Alphafour Infrastructure Pvt Ltd', address: ADMIN };
const NOT_PROVIDED = 'Not provided';

/** Captures messages like MemoryMailProvider, but every delivery addressed to a `blocked` address bounces. */
class BouncingMailProvider extends MemoryMailProvider {
  constructor(blocked) {
    super();
    this.blocked = blocked;
    this.bounced = [];
  }

  async send(message) {
    if ([].concat(message.to).some((to) => this.blocked.includes(to))) {
      this.bounced.push(message);
      throw new Error('Simulated 550 5.1.1 mailbox unavailable');
    }
    return super.send(message);
  }
}

/** The real Express app with the user's Gmail testing setup: sends as, and notifies, it.support.enexio@gmail.com. */
function createSite(env = {}, provider = new MemoryMailProvider()) {
  const config = loadConfig({
    NODE_ENV: 'test',
    MAIL_PROVIDER: 'console',
    MAIL_FROM_NAME: FROM.name,
    MAIL_FROM_ADDRESS: FROM.address,
    MAIL_TEAM_TO: ADMIN,
    MAIL_REPLY_TO: SALES,
    CLIENT_URL: 'http://localhost:5200',
    ...env,
  });
  const container = createContainer(config, { mailProvider: provider });
  return { app: createApp(container), provider, whenIdle: () => container.services.mailService.whenIdle(5_000) };
}

const site = createSite();

beforeEach(() => site.provider.reset());

// ── What each website form posts ────────────────────────────────────────────────
const contactEnquiry = {
  name: 'Aarav Mehta',
  phone: '+91 98200 12345',
  email: 'aarav.mehta@example.com',
  message: 'We are looking for a 4 BHK with a sea view. Please share availability.',
  consent: true,
  source: 'contact/enquiry',
};
// LeadDialogs opened from a residence page: residence preselected, message prefilled, budget chosen.
const dialogEnquiry = {
  name: 'Nisha Iyer',
  phone: '+91 98400 12345',
  email: 'nisha.iyer@example.com',
  residence: 'Alphafour Bayview',
  budget: '₹10 – 25 Cr',
  message: 'I would like to know more about Alphafour Bayview.',
  consent: true,
  source: 'dialog/enquiry',
};
// <EnquiryForm compact defaultResidence=…>: no Residence or Budget inputs; the residence is sent from the page.
const stickyCardEnquiry = {
  name: 'Rohan Gupta',
  phone: '98400 22222',
  email: 'rohan.gupta@example.com',
  residence: 'Alphafour Altitude',
  message: 'I would like to know more about Alphafour Altitude.',
  consent: true,
  source: 'residence/alphafour-altitude/sticky-card',
};
// BrochureForm: Full name, Email, Phone and consent; residence, subject and message are fixed by the form.
const brochureRequest = {
  name: 'Kavya Menon',
  email: 'kavya.menon@example.com',
  phone: '+91 99400 33333',
  consent: true,
  source: 'residence/alphafour-altitude/brochure',
  residence: 'Alphafour Altitude',
  subject: 'Brochure request',
  message: 'Please share the brochure, price list and floor plans for Alphafour Altitude.',
};
const siteVisit = {
  name: 'Ishita Rao',
  email: 'ishita.rao@example.com',
  phone: '9820012345',
  residence: 'The Gilded Crest',
  date: addDays(todayInIST(), 5),
  time: '11:00',
  guests: 3,
  consent: true,
  source: 'contact/site-visit',
};
const callback = {
  name: 'Kabir Shah',
  phone: '+91 98200 55555',
  email: 'kabir.shah@example.com',
  preferredTime: 'evening',
  consent: true,
  source: 'contact/callback',
};
const callbackNoEmail = {
  name: 'Farah Khan',
  phone: '+91 98410 66666',
  preferredTime: 'asap',
  consent: true,
  source: 'floating-button',
};
const feedback = {
  rating: 4,
  topic: 'site-visit',
  message: 'The private viewing was wonderful and our advisor was very knowledgeable.',
  name: 'Meera Kapoor',
  email: 'meera.kapoor@example.com',
  recommend: true,
  allowTestimonial: true,
  source: 'contact/feedback',
};
const anonymousFeedback = {
  rating: 2,
  topic: 'website',
  message: 'The floor-plan viewer kept resetting while I compared towers.',
  allowTestimonial: false,
  source: 'contact/feedback',
};
const newsletter = { email: 'priya.nair@example.com', source: 'footer/newsletter' };

/** One submission per endpoint, each with a visitor email. */
const ENDPOINTS = [
  ['/api/enquiries', contactEnquiry],
  ['/api/enquiries/site-visit', siteVisit],
  ['/api/enquiries/callback', callback],
  ['/api/feedback', feedback],
  ['/api/newsletter/subscribe', newsletter],
];

const LABEL = {
  name: /^(full )?name$/i,
  email: /^e-?mail( address)?$/i,
  phone: /^phone( number)?$/i,
  residence: /^residence$/i,
  budget: /^budget$/i,
  subject: /^subject$/i,
  consent: /consent/i,
  date: /date/i,
  time: /^time( slot)?\b/i,
  guests: /^guests?$/i,
  callTime: /^(best|preferred) time/i,
  rating: /rating|experience/i,
  topic: /^(topic|about)$/i,
  recommend: /recommend/i,
  testimonial: /testimonial|feature/i,
};

// ── Helpers ──────────────────────────────────────────────────────────────────────
const list = (value) => [].concat(value ?? []);

/** Posts one form the way the website does; returns the response and every email that submission produced. */
async function submit(target, path, body, status = 201) {
  const before = target.provider.sent.length;
  const res = await request(target.app).post(path).send(body).expect(status);
  assert.equal(await target.whenIdle(), true, 'the visitor email queue did not drain');
  return { res, mails: target.provider.sent.slice(before) };
}

/**
 * Splits one submission's emails into the admin notification and the visitor copy, asserting the routing:
 * exactly one admin email (To = MAIL_TEAM_TO, Cc = MAIL_TEAM_CC, Reply-To = the visitor) and, when the visitor gave
 * an address, exactly one copy to them alone (Reply-To = MAIL_REPLY_TO). Both are sent as MAIL_FROM_NAME/ADDRESS.
 */
function splitMails(mails, { visitor, team = [ADMIN], cc = [], replyTo = SALES } = {}) {
  const admins = mails.filter((mail) => list(mail.to).some((to) => team.includes(to)));
  assert.equal(admins.length, 1, `expected one admin email, got ${admins.length}`);
  const [admin] = admins;
  assert.deepEqual(list(admin.to), team);
  assert.deepEqual(list(admin.cc), cc);
  assert.deepEqual(list(admin.bcc), []);
  assert.deepEqual(admin.from, FROM);
  if (visitor) assert.equal(admin.replyTo, visitor, 'replying to the admin email must reach the visitor');

  const copies = mails.filter((mail) => mail !== admin);
  if (!visitor) {
    assert.equal(copies.length, 0, 'an email went out although the visitor gave no address');
    return { admin };
  }
  assert.equal(copies.length, 1, `expected one visitor email, got ${copies.length}`);
  const [copy] = copies;
  assert.deepEqual(list(copy.to), [visitor]);
  assert.deepEqual([...list(copy.cc), ...list(copy.bcc)], [], 'the visitor copy must not be copied to anyone else');
  assert.equal(copy.replyTo, replyTo);
  assert.deepEqual(copy.from, FROM);
  return { admin, copy };
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', rsquo: '’' };
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? entity;
    return String.fromCodePoint(/^#x/i.test(code) ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  });

/** Visible text of HTML: head and tags dropped, entities decoded, whitespace collapsed. */
const plain = (html) =>
  decode(html.replace(/<(head|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

/** { label, value } of the details tables: every innermost table row with exactly two cells. */
function detailRows(html) {
  const rows = [];
  for (const [, row] of html.matchAll(/<tr\b[^>]*>((?:(?!<\/?tr\b)[\s\S])*)<\/tr>/gi)) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(([, cell]) => plain(cell));
    if (cells.length === 2) rows.push({ label: cells[0], value: cells[1] });
  }
  return rows;
}

/** { label, value } of the "Label: value" lines of the plain-text alternative. */
const textRows = (text) =>
  text.split('\n').flatMap((line) => {
    const match = /^([^:]{1,40}): (.+)$/.exec(line.trim());
    return match ? [{ label: match[1], value: match[2].trim() }] : [];
  });

/** Each [label pattern, exact value | pattern] appears once in the HTML details table and once in the plain text. */
function assertDetails(mail, fields) {
  const tables = { html: detailRows(mail.html), text: textRows(mail.text) };
  for (const [label, expected] of fields) {
    for (const [part, rows] of Object.entries(tables)) {
      const found = rows.filter((row) => label.test(row.label));
      assert.equal(found.length, 1, `${part}: expected one ${label} row in ${JSON.stringify(rows)}`);
      if (expected instanceof RegExp) assert.match(found[0].value, expected, `${part}: ${label}`);
      else assert.equal(found[0].value, expected, `${part}: ${label}`);
    }
  }
}

/** Fails on any details row matching none of `labels`, e.g. a field the form never showed, rendered blank. */
function assertOnlyRows(mail, labels) {
  const unexpected = detailRows(mail.html).filter((row) => !labels.some((label) => label.test(row.label)));
  assert.deepEqual(unexpected, [], `unexpected rows in "${mail.subject}"`);
}

const labelsOf = (fields) => fields.map(([label]) => label);

/** The admin table holds exactly these fields. */
function assertAdminTable(admin, fields) {
  assertDetails(admin, fields);
  assertOnlyRows(admin, labelsOf(fields));
}

/** The visitor copy summarises what they entered: no blank rows, nothing from the team-only footer. */
function assertVisitorCopy(copy) {
  for (const part of ['html', 'text']) {
    assert.match(copy[part], /Your [a-z ]*details/i, `${part}: no "Your submission details" section`);
    assert.doesNotMatch(copy[part], /Not provided/i, `${part}: lists a field the visitor left blank`);
    assert.doesNotMatch(copy[part], /Request ID/i, `${part}: shows the team-only footer`);
  }
  const emptyRows = detailRows(copy.html).filter((row) => !row.value);
  assert.deepEqual(emptyRows, [], 'empty rows in the visitor copy');
}

/** What a reader sees in each part of an email: the HTML's visible text and the plain-text alternative. */
const readable = (mail) => [
  ['html', plain(mail.html)],
  ['text', mail.text],
];

/** No template placeholder leaked into the subject, HTML or text. */
function assertClean(mail) {
  for (const part of ['subject', 'html', 'text']) {
    assert.doesNotMatch(mail[part], /\b(undefined|null|NaN)\b|\[object Object\]/, `${part} shows a missing value`);
  }
}

const ENTITY_FORMS = {
  '&': '&amp;|&#0*38;|&#x0*26;',
  '"': '&quot;|&#0*34;|&#x0*22;',
  "'": '&#x0*27;|&#0*39;|&apos;',
  '<': '&lt;|&#0*60;|&#x0*3c;',
  '>': '&gt;|&#0*62;|&#x0*3e;|>',
};
/** Pattern for `raw` as it must appear in HTML: & " ' < escaped (any entity form); > may stay as is. */
const escaped = (raw) =>
  new RegExp(
    [...raw]
      .map((ch) => (ENTITY_FORMS[ch] ? `(?:${ENTITY_FORMS[ch]})` : ch.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')))
      .join(''),
    'i',
  );

/** A free-text message appears in the HTML (escaped) and verbatim in the plain text. */
function assertMessage(mail, message) {
  assert.match(mail.html, escaped(message), 'message missing from the HTML');
  assert.ok(mail.text.includes(message), 'message missing from the plain-text alternative');
}

/** Matches a phone number however it is formatted ("+91 98200 12345" or "+919820012345"). */
const phoneOf = (phone) => new RegExp(`^\\+?${phone.replace(/\D/g, '').split('').join('[\\s().-]*')}$`);

const MONTHS = 'January February March April May June July August September October November December'.split(' ');
/** "2026-11-09" → "9 November 2026" */
const longDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
};

const SUBMITTED_AT = /\b(?:received|submitted)\b[^\n]{0,60}?\b(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?\s*IST\b/i;
/** Minutes between a matched "h:mm am/pm IST" reading and the current time in India (wrapping at midnight). */
function minutesFromNowInIST([, hours, minutes, meridiem]) {
  let hour = Number(hours);
  if (meridiem) hour = (hour % 12) + (/^p/i.test(meridiem) ? 12 : 0);
  const now = new Date(Date.now() + 330 * 60_000);
  const drift = Math.abs(hour * 60 + Number(minutes) - (now.getUTCHours() * 60 + now.getUTCMinutes()));
  return Math.min(drift, 1440 - drift);
}

const CONSENT = [LABEL.consent, /agree|accept|yes/i];

// ── Forms ────────────────────────────────────────────────────────────────────────
describe('enquiry forms (POST /api/enquiries)', () => {
  it('contact page: the admin gets every field (blank Residence and Budget as "Not provided"), the visitor only what they entered', async () => {
    const { res, mails } = await submit(site, '/api/enquiries', contactEnquiry);
    const { admin, copy } = splitMails(mails, { visitor: contactEnquiry.email });
    const { reference } = res.body.data;
    const entered = [
      [LABEL.name, 'Aarav Mehta'],
      [LABEL.phone, phoneOf(contactEnquiry.phone)],
      [LABEL.email, contactEnquiry.email],
    ];

    assertAdminTable(admin, [...entered, [LABEL.residence, NOT_PROVIDED], [LABEL.budget, NOT_PROVIDED], CONSENT]);
    assertMessage(admin, contactEnquiry.message);
    assert.ok(admin.subject.includes(reference) && admin.subject.includes('Aarav Mehta'), admin.subject);

    assertDetails(copy, entered);
    assertOnlyRows(copy, labelsOf(entered));
    assertMessage(copy, contactEnquiry.message);
    assertVisitorCopy(copy);
    assert.ok(copy.subject.includes(reference) && copy.text.includes(reference), 'visitor copy lacks the reference');
    [admin, copy].forEach(assertClean);
  });

  it('dialog opened from a residence page: the preselected residence and chosen budget reach both emails', async () => {
    const { mails } = await submit(site, '/api/enquiries', dialogEnquiry);
    const { admin, copy } = splitMails(mails, { visitor: dialogEnquiry.email });
    const entered = [
      [LABEL.name, 'Nisha Iyer'],
      [LABEL.phone, phoneOf(dialogEnquiry.phone)],
      [LABEL.email, dialogEnquiry.email],
      [LABEL.residence, 'Alphafour Bayview'],
      [LABEL.budget, '₹10 – 25 Cr'],
    ];

    assertAdminTable(admin, [...entered, CONSENT]);
    assertMessage(admin, dialogEnquiry.message);
    assertDetails(copy, entered);
    assertMessage(copy, dialogEnquiry.message);
    assertVisitorCopy(copy);
  });

  it('residence sticky card (compact form): lists the residence sent by the page and omits Budget, which that form does not show', async () => {
    const { mails } = await submit(site, '/api/enquiries', stickyCardEnquiry);
    const { admin, copy } = splitMails(mails, { visitor: stickyCardEnquiry.email });
    const sent = [
      [LABEL.name, 'Rohan Gupta'],
      [LABEL.phone, phoneOf(stickyCardEnquiry.phone)],
      [LABEL.email, stickyCardEnquiry.email],
      [LABEL.residence, 'Alphafour Altitude'],
    ];

    assertDetails(copy, sent);
    assertMessage(copy, stickyCardEnquiry.message);
    assertVisitorCopy(copy);
    assertDetails(admin, [...sent, CONSENT]);
    assertMessage(admin, stickyCardEnquiry.message);
    // The compact form has no Budget input, so a "Budget: Not provided" row is a field the visitor was never asked.
    assertOnlyRows(admin, [...labelsOf(sent), LABEL.consent]);
  });

  it('brochure request: name, email, phone, the residence and "Brochure request" reach both emails; no Budget row (not on that form)', async () => {
    const { res, mails } = await submit(site, '/api/enquiries', brochureRequest);
    const { admin, copy } = splitMails(mails, { visitor: brochureRequest.email });
    const entered = [
      [LABEL.name, 'Kavya Menon'],
      [LABEL.email, brochureRequest.email],
      [LABEL.phone, phoneOf(brochureRequest.phone)],
    ];
    const setByForm = [
      [LABEL.residence, 'Alphafour Altitude'],
      [LABEL.subject, 'Brochure request'],
    ];

    assertDetails(copy, entered);
    assertMessage(copy, brochureRequest.message);
    assert.ok(copy.text.includes('Alphafour Altitude'), 'the visitor copy does not say which brochure');
    assertVisitorCopy(copy);
    assertDetails(admin, [...entered, ...setByForm, CONSENT]);
    assertMessage(admin, brochureRequest.message);
    assert.ok(admin.subject.includes(res.body.data.reference), admin.subject);
    [admin, copy].forEach(assertClean);
    // BrochureForm shows Full name, Email, Phone and consent only: a "Budget: Not provided" row was never asked.
    assertOnlyRows(admin, [...labelsOf(entered), ...labelsOf(setByForm), LABEL.consent]);
  });
});

describe('site visit form (POST /api/enquiries/site-visit)', () => {
  it('admin gets date, slot, guests, residence and contact details; the visitor the slot, their details and a calendar invite', async () => {
    const { res, mails } = await submit(site, '/api/enquiries/site-visit', siteVisit);
    const { admin, copy } = splitMails(mails, { visitor: siteVisit.email });
    const day = longDate(siteVisit.date);
    const contact = [
      [LABEL.residence, 'The Gilded Crest'],
      [LABEL.name, 'Ishita Rao'],
      [LABEL.email, siteVisit.email],
      [LABEL.phone, phoneOf(siteVisit.phone)],
    ];

    assertAdminTable(admin, [
      [LABEL.date, new RegExp(day)],
      [LABEL.time, /^11:00\s*AM\b/i],
      [LABEL.guests, /^3\b/],
      ...contact,
      CONSENT,
    ]);
    assert.ok(admin.subject.includes(res.body.data.reference), admin.subject);

    assertDetails(copy, contact);
    for (const [part, content] of readable(copy)) {
      assert.ok(content.includes(day), `${part}: the requested date is missing`);
      assert.match(content, /11:00\s*AM/i, `${part}: the requested slot is missing`);
      assert.match(content, /\b3 guests\b/i, `${part}: the number of guests is missing`);
    }
    assertVisitorCopy(copy);
    const invite = list(copy.attachments).find((file) => file.filename.endsWith('.ics'));
    assert.ok(invite, 'calendar invite missing');
    assert.match(invite.contentType, /^text\/calendar/);
    assert.match(invite.content, /SUMMARY:[^\r\n]*The Gilded Crest/);
    [admin, copy].forEach(assertClean);
  });
});

describe('call-back form (POST /api/enquiries/callback)', () => {
  it('with an email: the admin gets every field, the visitor a copy with their number and best time to call', async () => {
    const { res, mails } = await submit(site, '/api/enquiries/callback', callback);
    const { admin, copy } = splitMails(mails, { visitor: callback.email });
    const entered = [
      [LABEL.name, 'Kabir Shah'],
      [LABEL.phone, phoneOf(callback.phone)],
      [LABEL.email, callback.email],
      [LABEL.callTime, /evening/i],
    ];

    assertDetails(admin, [...entered, CONSENT]);
    assertDetails(copy, entered);
    assertVisitorCopy(copy);
    assert.ok(copy.text.includes(res.body.data.reference), 'visitor copy lacks the reference');
    [admin, copy].forEach(assertClean);
  });

  it('without an email: only the admin is emailed, with Email "Not provided"', async () => {
    const { mails } = await submit(site, '/api/enquiries/callback', callbackNoEmail);
    const { admin } = splitMails(mails, {});

    assertDetails(admin, [
      [LABEL.name, 'Farah Khan'],
      [LABEL.phone, phoneOf(callbackNoEmail.phone)],
      [LABEL.email, NOT_PROVIDED],
      [LABEL.callTime, /as soon as possible/i],
      CONSENT,
    ]);
    assertClean(admin);
  });

  it('admin email lists only the fields the call-back form shows: no Residence row, as no call-back form asks for one', async () => {
    const { mails } = await submit(site, '/api/enquiries/callback', callback);
    const { admin } = splitMails(mails, { visitor: callback.email });

    assertOnlyRows(admin, [LABEL.name, LABEL.phone, LABEL.email, LABEL.callTime, LABEL.consent]);
  });
});

describe('feedback form (POST /api/feedback)', () => {
  it('with name and email: the admin gets every form field, the visitor their rating, topic, answers and feedback', async () => {
    const { mails } = await submit(site, '/api/feedback', feedback);
    const { admin, copy } = splitMails(mails, { visitor: feedback.email });
    const answers = [
      [LABEL.name, 'Meera Kapoor'],
      [LABEL.email, feedback.email],
      [LABEL.recommend, /^yes/i],
      [LABEL.testimonial, /^yes/i],
    ];

    assertAdminTable(admin, [[LABEL.rating, /\b4 ?\/ ?5\b/], [LABEL.topic, 'Site visit'], ...answers]);
    assertMessage(admin, feedback.message);

    assertDetails(copy, answers);
    for (const [part, content] of readable(copy)) {
      assert.match(content, /\b4 out of 5\b|\b4 ?\/ ?5\b/, `${part}: rating missing`);
      assert.ok(content.includes('Site visit'), `${part}: topic missing`);
    }
    assertMessage(copy, feedback.message);
    assertVisitorCopy(copy);
    [admin, copy].forEach(assertClean);
  });

  it('anonymous: only the admin is emailed; Name, Email and Would recommend read "Not provided"', async () => {
    const { mails } = await submit(site, '/api/feedback', anonymousFeedback);
    const { admin } = splitMails(mails, {});

    assertAdminTable(admin, [
      [LABEL.rating, /\b2 ?\/ ?5\b/],
      [LABEL.topic, /website/i],
      [LABEL.name, NOT_PROVIDED],
      [LABEL.email, NOT_PROVIDED],
      [LABEL.recommend, NOT_PROVIDED],
      [LABEL.testimonial, /^no\b/i],
    ]);
    assertMessage(admin, anonymousFeedback.message);
    assertClean(admin);
  });
});

describe('newsletter form (POST /api/newsletter/subscribe)', () => {
  it('the admin gets the subscriber email (the only field), the subscriber a welcome with their subscription details', async () => {
    const { mails } = await submit(site, '/api/newsletter/subscribe', newsletter);
    const { admin, copy } = splitMails(mails, { visitor: newsletter.email });

    assertAdminTable(admin, [[LABEL.email, newsletter.email]]);
    assertDetails(copy, [[LABEL.email, newsletter.email]]);
    assertVisitorCopy(copy);
    [admin, copy].forEach(assertClean);
  });
});

describe('values the forms do not show, or show as options', () => {
  it('API-only fields (feedback phone and residence, newsletter name, call-back residence) are listed in both emails when sent', async () => {
    const withPhone = await submit(site, '/api/feedback', {
      ...feedback,
      phone: '+91 98200 77777',
      residence: 'Cathedral One',
    });
    for (const mail of Object.values(splitMails(withPhone.mails, { visitor: feedback.email }))) {
      assertDetails(mail, [
        [LABEL.phone, phoneOf('+91 98200 77777')],
        [LABEL.residence, 'Cathedral One'],
      ]);
    }

    const withName = await submit(site, '/api/newsletter/subscribe', { ...newsletter, name: 'Priya Nair' });
    for (const mail of Object.values(splitMails(withName.mails, { visitor: newsletter.email }))) {
      assertDetails(mail, [[LABEL.name, 'Priya Nair']]);
    }

    const withResidence = await submit(site, '/api/enquiries/callback', { ...callback, residence: 'Sapphire Heights' });
    for (const mail of Object.values(splitMails(withResidence.mails, { visitor: callback.email }))) {
      assertDetails(mail, [[LABEL.residence, 'Sapphire Heights']]);
    }
  });

  it('notes sent with a site visit or call-back (neither form has a message box) reach both emails', async () => {
    const notes = 'Please arrange wheelchair access at the lobby.';
    for (const [path, body] of [
      ['/api/enquiries/site-visit', siteVisit],
      ['/api/enquiries/callback', callback],
    ]) {
      const { mails } = await submit(site, path, { ...body, message: notes });
      for (const mail of Object.values(splitMails(mails, { visitor: body.email }))) assertMessage(mail, notes);
    }
  });

  it('residence "Not sure yet" (an option of the website residence selects) is not written into sentences as a residence name', async () => {
    const enquiry = await submit(site, '/api/enquiries', { ...contactEnquiry, residence: 'Not sure yet' });
    const visit = await submit(site, '/api/enquiries/site-visit', { ...siteVisit, residence: 'Not sure yet' });

    for (const mail of [...enquiry.mails, ...visit.mails]) {
      assertDetails(mail, [[LABEL.residence, 'Not sure yet']]);
      const prose = mail.text.replace(/^[^:\n]{1,40}: .*$/gm, ''); // sentences only, not the "Residence: …" row
      assert.doesNotMatch(
        prose,
        /\b(?:about|of|visit) Not sure yet\b/i,
        `"${mail.subject}" reads "Not sure yet" as a residence`,
      );
    }
  });
});

// ── Routing ──────────────────────────────────────────────────────────────────────
describe('admin notification', () => {
  it('goes once per submission to every MAIL_TEAM_TO address (comma-separated list) and MAIL_TEAM_CC', async () => {
    const team = [ADMIN, SALES];
    const cc = ['director@alpha4infra.com'];
    const multi = createSite({ MAIL_TEAM_TO: ` ${ADMIN} , ${SALES} `, MAIL_TEAM_CC: cc.join(',') });

    for (const [path, body] of ENDPOINTS) {
      const { mails } = await submit(multi, path, body);
      splitMails(mails, { visitor: body.email, team, cc });
    }
  });

  it('falls back to MAIL_FROM_ADDRESS for the admin inbox (no MAIL_TEAM_TO) and the visitor Reply-To (no MAIL_REPLY_TO)', async () => {
    const noReplyTo = createSite({ MAIL_REPLY_TO: undefined, MAIL_TEAM_TO: SALES });
    const first = await submit(noReplyTo, '/api/enquiries', contactEnquiry);
    splitMails(first.mails, { visitor: contactEnquiry.email, team: [SALES], replyTo: FROM.address });

    const noTeam = createSite({ MAIL_TEAM_TO: undefined });
    const second = await submit(noTeam, '/api/enquiries', contactEnquiry);
    splitMails(second.mails, { visitor: contactEnquiry.email, team: [FROM.address] });
  });

  it('reaches the testing inbox alongside the visitor copy when a tester submits with that same address', async () => {
    const { mails } = await submit(site, '/api/enquiries', { ...contactEnquiry, email: ADMIN });

    assert.equal(mails.length, 2);
    for (const mail of mails) assert.deepEqual(list(mail.to), [ADMIN]);
    const notifications = mails.filter((mail) => detailRows(mail.html).some((row) => row.value === NOT_PROVIDED));
    assert.equal(notifications.length, 1, 'expected one admin notification (the one with blank "Not provided" rows)');
    assertVisitorCopy(mails.find((mail) => mail !== notifications[0]));
  });

  it('records in every admin email when the form was submitted, in IST', async () => {
    for (const [path, body] of ENDPOINTS) {
      const { mails } = await submit(site, path, body);
      const { admin } = splitMails(mails, { visitor: body.email });
      for (const [part, content] of readable(admin)) {
        const stamp = SUBMITTED_AT.exec(content);
        assert.ok(stamp, `${path} ${part}: no "submitted … IST" timestamp`);
        assert.ok(minutesFromNowInIST(stamp) <= 2, `${path} ${part}: "${stamp[0]}" is not the current time in IST`);
      }
    }
  });
});

// ── Escaping ─────────────────────────────────────────────────────────────────────
const HOSTILE_NAME = `Tom & "Jerry" O'Brien`;

describe('user input in emails', () => {
  it('enquiry: & " \' and tag-like text are escaped in both HTML bodies and read naturally in the text and subject', async () => {
    const body = {
      ...contactEnquiry,
      name: HOSTILE_NAME,
      email: 'tom.obrien@example.com',
      residence: 'Villa "Sea & Sky"\r\nBcc: spy@example.com',
      message: `Hi <b>team</b> & "friends", it's 5 > 3 <3\n<script>alert('x')</script><img src=x onerror=alert(1)>Second line`,
    };
    const { mails } = await submit(site, '/api/enquiries', body);
    const { admin, copy } = splitMails(mails, { visitor: body.email });

    for (const mail of [admin, copy]) {
      const who = list(mail.to).join(', ');
      assert.match(mail.html, escaped(HOSTILE_NAME), `${who}: name not escaped`);
      assert.ok(!mail.html.includes(HOSTILE_NAME), `${who}: raw name in the HTML`);
      assert.match(mail.html, escaped('Villa "Sea & Sky"'), `${who}: residence not escaped`);
      assert.match(mail.html, escaped(`& "friends", it's 5 > 3 <3`), `${who}: message not escaped`);
      assert.match(mail.html, new RegExp(`${escaped('<3').source}\\s*<br\\s*/?>`, 'i'), `${who}: line break lost`);
      assert.doesNotMatch(mail.html, /<script|<img|<b>/i, `${who}: raw user HTML`);

      assert.ok(mail.text.includes(HOSTILE_NAME), `${who}: name garbled in the plain text`);
      assert.ok(mail.text.includes(`& "friends", it's 5 > 3 <3\n`), `${who}: message garbled in the plain text`);
      assert.doesNotMatch(
        mail.text,
        /&(?:amp|quot|apos|lt|gt|#x?[0-9a-f]+);/i,
        `${who}: HTML entities in the plain text`,
      );
      assert.doesNotMatch(
        mail.subject,
        /[\r\n]|&(?:amp|quot|apos|#x?[0-9a-f]+);/i,
        `${who}: subject "${mail.subject}"`,
      );
    }
    assert.ok(admin.subject.includes(HOSTILE_NAME), admin.subject);
  });

  it('site visit, call-back, feedback and newsletter input is escaped the same way in both emails', async () => {
    const notes = 'Bring "plans" & <b>prices</b> <3';
    const cases = [
      ['/api/enquiries/site-visit', { ...siteVisit, name: HOSTILE_NAME, message: notes }],
      ['/api/enquiries/callback', { ...callback, name: HOSTILE_NAME, message: notes }],
      ['/api/feedback', { ...feedback, name: HOSTILE_NAME, message: `Lovely visit. ${notes}` }],
      ['/api/newsletter/subscribe', { ...newsletter, name: HOSTILE_NAME }],
    ];

    for (const [path, body] of cases) {
      const { mails } = await submit(site, path, body);
      for (const mail of Object.values(splitMails(mails, { visitor: body.email }))) {
        const where = `${path} → ${list(mail.to).join(', ')}`;
        assert.match(mail.html, escaped(HOSTILE_NAME), `${where}: name not escaped`);
        assert.ok(!mail.html.includes(HOSTILE_NAME), `${where}: raw name in the HTML`);
        assert.doesNotMatch(mail.html, /<b>|<script|<img/i, `${where}: raw user HTML`);
        assert.ok(mail.text.includes(HOSTILE_NAME), `${where}: name garbled in the plain text`);
        if (body.message) {
          assert.match(mail.html, escaped('Bring "plans" &'), `${where}: notes not escaped`);
          assert.match(mail.html, escaped('<3'), `${where}: "<3" lost`);
          assert.ok(mail.text.includes('Bring "plans" & '), `${where}: notes garbled in the plain text`);
        }
      }
    }
  });
});

// ── Delivery ─────────────────────────────────────────────────────────────────────
describe('delivery guarantees', () => {
  it('honeypot submissions (hidden "company" field filled in) send no email from any form', async () => {
    for (const [path, body] of ENDPOINTS) {
      const { mails } = await submit(site, path, { ...body, company: 'Acme Lead Bots' });
      assert.equal(mails.length, 0, `${path} emailed a bot submission`);
    }
  });

  it('returns 503 and sends no visitor copy when the admin notification cannot be delivered', async () => {
    const down = createSite({}, new BouncingMailProvider([ADMIN]));

    for (const [path, body] of ENDPOINTS) {
      const { res } = await submit(down, path, body, 503);
      assert.equal(res.body.code, 'SERVICE_UNAVAILABLE', path);
    }
    assert.equal(down.provider.sent.length, 0, 'a visitor was thanked for a lead the team never received');
    assert.ok(down.provider.bounced.length >= ENDPOINTS.length, 'the admin notification was never attempted');
  });

  it('a bouncing visitor copy does not fail the request, and the admin notification is still delivered', async () => {
    const bouncing = createSite({}, new BouncingMailProvider(ENDPOINTS.map(([, body]) => body.email)));

    for (const [path, body] of ENDPOINTS) {
      const { mails } = await submit(bouncing, path, body, 201);
      assert.equal(mails.length, 1, `${path}: expected only the admin email to be delivered`);
      assert.deepEqual(list(mails[0].to), [ADMIN], path);
      const attempted = bouncing.provider.bounced.some((mail) => list(mail.to).includes(body.email));
      assert.ok(attempted, `${path}: the visitor copy was never attempted`);
    }
  });
});
