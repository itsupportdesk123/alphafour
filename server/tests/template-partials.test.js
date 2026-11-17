import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { loadConfig } from '../src/config/env.js';
import { createContainer } from '../src/container.js';
import { TemplateRepository } from '../src/repositories/template.repository.js';
import { addDays, todayInIST } from '../src/utils/time.js';
import { createTestApp, MemoryMailProvider } from './helpers.js';

// Every email in this file is captured by the in-memory provider: nothing can reach a real mailbox.
const { app, provider, whenIdle, container } = createTestApp();
const { mailService } = container.services;

/** Explicit offline configuration. Never process.env: server/.env selects a real SMTP account. */
const TEST_ENV = Object.freeze({
  NODE_ENV: 'test',
  MAIL_PROVIDER: 'console',
  MAIL_FROM_ADDRESS: 'concierge@test.example',
  MAIL_TEAM_TO: 'sales@test.example',
  CLIENT_URL: 'http://localhost:5173',
});

const mailServiceWith = (env) =>
  createContainer(loadConfig({ ...TEST_ENV, ...env }), { mailProvider: new MemoryMailProvider() }).services.mailService;

const PARTIALS_DIR = fileURLToPath(new URL('../src/templates/partials/', import.meta.url));

// Markers that only partials/details.hbs and partials/message.hbs produce.
const DETAILS_TABLE = 'border-collapse:separate;overflow:hidden;';
const DETAILS_ROW = '<tr class="stack">';
const ROW_SEPARATOR = 'border-bottom:1px solid #F0E8D6';
const MUTED_SPAN = '<span style="color:#6B6253;font-style:italic;">';
const MESSAGE_BOX = 'border-left:3px solid #C9A24B';
const captionOf = (caption) => `>${caption}</p>`;

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#x60;': '`',
  '&#x3D;': '=',
};
const decode = (html) => html.replace(/&(?:amp|lt|gt|quot|#x27|#x60|#x3D);/g, (entity) => HTML_ENTITIES[entity]);
const stripTags = (html) => html.replace(/<[^>]+>/g, '');
const count = (haystack, needle) => haystack.split(needle).length - 1;
const linesOf = (text) => text.split('\n').map((line) => line.trim());
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Detail rows as partials/details.hbs renders them: label, decoded value, link target and muted flag. */
function detailRowsOf(html) {
  const rowPattern = /<tr class="stack">\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g;
  return [...html.matchAll(rowPattern)].map(([, labelHtml, valueHtml]) => {
    const link = /<a href="([^"]*)"/.exec(valueHtml);
    return {
      label: decode(stripTags(labelHtml)).trim(),
      value: decode(stripTags(valueHtml)).trim(),
      href: link ? decode(link[1]) : undefined,
      muted: valueHtml.includes(MUTED_SPAN),
    };
  });
}

/** The plain-text line a reader should get for a detail row: web links keep their URL, mailto:/tel: links do not. */
function textLineOf({ label, value, href }) {
  const url = href && !/^(mailto|tel):/i.test(href) && href !== value ? ` (${href})` : '';
  return `${label}: ${value}${url}`.replace(/\s+/g, ' ').trim();
}

function assertPlainText(text, where) {
  assert.doesNotMatch(text, /<\/?[a-z][a-z0-9]*\b[^>]*>/i, `${where}: the text alternative contains an HTML tag`);
  assert.doesNotMatch(text, /&(?:[a-z]+|#x?[0-9a-f]+);/i, `${where}: the text alternative contains an HTML entity`);
}

function assertLines(text, expected, where) {
  const lines = linesOf(text);
  for (const line of expected) assert.ok(lines.includes(line), `${where}: the text has no line "${line}"`);
}

const MESSAGE = 'First line & more\nSecond line';

/** A realistic context per body template, shaped like the ones the services build. */
const SAMPLES = {
  'team-notification': {
    base: {
      eyebrow: 'Website enquiry',
      heading: 'New enquiry',
      intro: 'Aarav Mehta would like to hear from us about Alphafour Altitude.',
      reference: 'AUR-TEST01',
      actions: [],
      submittedAt: '4 Nov 2026, 12:00 pm IST',
      source: 'contact/enquiry',
      requestId: 'req-test-1',
    },
    details: [
      { label: 'Full name', value: 'Aarav Mehta' },
      { label: 'Email', value: 'aarav@example.com', href: 'mailto:aarav@example.com' },
      { label: 'Phone', value: '+919820012345', href: 'tel:+919820012345' },
      { label: 'Budget', value: 'Not provided', muted: true },
    ],
    detailsCaption: 'Submission details',
    messageCaption: 'Message',
  },
  'enquiry-confirmation': {
    base: { heading: 'Thank you, Aarav', reference: 'AUR-TEST01', residence: 'Alphafour Altitude' },
    details: [
      { label: 'Full name', value: 'Aarav Mehta' },
      { label: 'Email', value: 'aarav@example.com' },
      { label: 'Residence', value: 'Alphafour Altitude' },
      { label: 'Budget', value: '₹5 – 10 Cr' },
    ],
    detailsCaption: 'Your submission details',
    messageCaption: 'Your message',
  },
  'site-visit-confirmation': {
    base: {
      heading: 'See you soon, Ishita',
      reference: 'AUR-TEST01',
      residence: 'Alphafour Altitude',
      dateLabel: 'Saturday, 7 November 2026',
      timeLabel: '11:00 AM',
      guests: 2,
      guestsLabel: 'guests',
    },
    details: [
      { label: 'Full name', value: 'Ishita Rao' },
      { label: 'Phone', value: '9820012345' },
      {
        label: 'Venue',
        value: 'Dadha Chambers, 5th & 7th Floor, Royapettah, Chennai 600014',
        href: 'https://maps.google.com/?q=Dadha+Chambers',
      },
      { label: 'Reference', value: 'AUR-TEST01' },
    ],
    detailsCaption: 'Your visit details',
    messageCaption: 'Your notes',
  },
  'callback-confirmation': {
    base: {
      heading: 'We’ll call you shortly, Kabir',
      reference: 'AUR-TEST01',
      phone: '+919820055555',
      windowSentence: 'in the evening, between 4 and 7 pm',
    },
    details: [
      { label: 'Full name', value: 'Kabir Shah' },
      { label: 'Phone', value: '+919820055555' },
      { label: 'Best time to call', value: 'Evening · 4 – 7 pm' },
    ],
    detailsCaption: 'Your submission details',
    messageCaption: 'Your message',
  },
  'feedback-thanks': {
    base: {
      heading: 'Thank you, Meera',
      reference: 'FDB-TEST01',
      rating: 5,
      topicLabel: 'Site visit',
      lowRating: false,
    },
    details: [
      { label: 'Name', value: 'Meera Kapoor' },
      { label: 'Would recommend', value: 'Yes' },
      { label: 'Feature as testimonial', value: 'Yes, first name only' },
    ],
    detailsCaption: 'Your submission details',
    messageCaption: 'Your feedback',
  },
  'newsletter-welcome': {
    base: { heading: 'Welcome, Priya', email: 'priya@example.com' },
    details: [{ label: 'Email', value: 'priya@example.com' }],
    detailsCaption: 'Your subscription details',
    messageCaption: null, // the sign-up form has no message field
  },
};

describe('partials', () => {
  let templatesDir;
  let harness;

  before(async () => {
    // A private templates directory with the real partials and two harnesses that pass every hash
    // parameter explicitly, exactly as the body templates do.
    templatesDir = await mkdtemp(path.join(tmpdir(), 'alphafour-partials-'));
    await mkdir(path.join(templatesDir, 'partials'));
    for (const file of await readdir(PARTIALS_DIR)) {
      await copyFile(path.join(PARTIALS_DIR, file), path.join(templatesDir, 'partials', file));
    }
    await writeFile(path.join(templatesDir, 'details-harness.hbs'), '{{> details rows=rows caption=caption}}');
    await writeFile(path.join(templatesDir, 'message-harness.hbs'), '{{> message text=text caption=caption}}');
    harness = new TemplateRepository({ templatesDir });
  });

  after(() => rm(templatesDir, { recursive: true, force: true }));

  const details = async (context) => (await harness.render('details-harness', context)).trim();
  const message = async (context) => (await harness.render('message-harness', context)).trim();

  describe('details.hbs', () => {
    const rows = [
      { label: 'Full name', value: 'Aarav Mehta' },
      { label: 'Email', value: 'aarav@example.com', href: 'mailto:aarav@example.com' },
      { label: 'Budget', value: 'Not provided', muted: true },
    ];

    it('puts the caption directly above the table, and leaves the caption out when none is given', async () => {
      const captioned = await details({ rows, caption: 'Your submission details' });
      assert.match(captioned, /^<p [^>]*>Your submission details<\/p>\s*<table [^>]*style="margin:0 0 24px;/);

      const uncaptioned = await details({ rows });
      assert.match(uncaptioned, /^<table [^>]*style="margin:24px 0;/);
      assert.doesNotMatch(uncaptioned, /<p\b/);
      assert.equal(count(uncaptioned, DETAILS_ROW), rows.length);
    });

    it('renders every row in order, plain values as text and rows with an href as links', async () => {
      const html = await details({
        rows: [
          { label: 'Full name', value: 'Aarav Mehta' },
          { label: 'Email', value: 'aarav@example.com', href: 'mailto:aarav@example.com' },
          { label: 'Venue', value: 'Dadha Chambers', href: 'https://maps.google.com/?q=Dadha+Chambers' },
        ],
      });
      assert.deepEqual(detailRowsOf(html), [
        { label: 'Full name', value: 'Aarav Mehta', href: undefined, muted: false },
        { label: 'Email', value: 'aarav@example.com', href: 'mailto:aarav@example.com', muted: false },
        { label: 'Venue', value: 'Dadha Chambers', href: 'https://maps.google.com/?q=Dadha+Chambers', muted: false },
      ]);
      assert.match(html, /vertical-align:top;[^"]*">Aarav Mehta<\/td>/, 'a plain value sits directly in its cell');
      assert.match(html, /<a href="mailto:aarav@example\.com" style="color:#1E3A8A;">aarav@example\.com<\/a>/);
    });

    it('shows a blank field as muted italic "Not provided" text, never as a link', async () => {
      const html = await details({
        rows: [
          { label: 'Budget', value: 'Not provided', muted: true },
          // The services build hrefs such as `mailto:${input.email}` even when the field is blank.
          { label: 'Email', value: 'Not provided', muted: true, href: 'mailto:undefined' },
        ],
      });
      assert.equal(count(html, `${MUTED_SPAN}Not provided</span>`), 2);
      assert.doesNotMatch(html, /<a\b|mailto:/);
    });

    it('renders nothing at all for empty or missing rows, even when a caption is given', async () => {
      for (const empty of [[], undefined, null]) {
        assert.equal(await details({ rows: empty, caption: 'Your submission details' }), '', `rows: ${empty}`);
      }
    });

    it('draws a separator under every row except the last, so a single row has none', async () => {
      const html = await details({ rows });
      const separatorsPerRow = html
        .split(DETAILS_ROW)
        .slice(1)
        .map((row) => count(row, ROW_SEPARATOR));
      assert.deepEqual(separatorsPerRow, [2, 2, 0], 'label and value cells of all but the last row');

      const single = await details({ rows: [{ label: 'Email', value: 'priya@example.com' }] });
      assert.equal(count(single, DETAILS_ROW), 1);
      assert.equal(count(single, ROW_SEPARATOR), 0);
    });

    it('escapes labels, values and link targets', async () => {
      const html = await details({
        rows: [
          {
            label: 'Notes <i>',
            value: '<script>alert(1)</script> & "quotes"',
            href: 'https://example.com/?a=1&b="x" onclick="alert(1)',
          },
        ],
      });
      assert.doesNotMatch(html, /<script|<i>|onclick="/);
      assert.match(html, />Notes &lt;i&gt;<\/td>/);
      assert.match(
        html,
        /<a href="https:\/\/example\.com\/\?a&#x3D;1&amp;b&#x3D;&quot;x&quot; onclick&#x3D;&quot;alert\(1\)" /,
      );
      assert.match(html, />&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;quotes&quot;<\/a>/);
    });
  });

  describe('message.hbs', () => {
    it('captions the message "Message" by default, or with the caption it is given', async () => {
      assert.match(await message({ text: 'Hello' }), /^<p [^>]*>Message<\/p>\s*<div /);

      const custom = await message({ text: 'Hello', caption: 'Your notes' });
      assert.match(custom, /^<p [^>]*>Your notes<\/p>\s*<div /);
      assert.doesNotMatch(custom, />Message</);
    });

    it('escapes < > & " \' and turns each newline into <br>, the only markup it adds', async () => {
      const html = await message({ text: 'a < b > c & d "e" \'f\'\nline two\n\n<b>bold</b>' });
      const box = new RegExp(`<div style="[^"]*${MESSAGE_BOX}[^"]*">([\\s\\S]*?)</div>`).exec(html);
      assert.ok(box, 'message box missing');
      assert.equal(
        box[1],
        'a &lt; b &gt; c &amp; d &quot;e&quot; &#x27;f&#x27;<br>line two<br><br>&lt;b&gt;bold&lt;/b&gt;',
      );
    });

    it('renders nothing without text', async () => {
      for (const text of [undefined, null, '']) {
        assert.equal(await message({ text, caption: 'Your message' }), '', `text: ${JSON.stringify(text)}`);
      }
    });
  });
});

describe('body templates', () => {
  for (const [template, { base, details, detailsCaption, messageCaption }] of Object.entries(SAMPLES)) {
    const sections = messageCaption ? 'details and message' : 'details';

    it(`${template} shows its ${sections} when given and leaves no trace of them when absent`, async () => {
      const filled = await mailService.render(template, { ...base, details, message: MESSAGE });
      assert.match(filled.html, new RegExp(`${escapeRegExp(captionOf(detailsCaption))}\\s*<table `), 'details caption');
      assert.deepEqual(
        detailRowsOf(filled.html).map(({ label, value }) => ({ label, value })),
        details.map(({ label, value }) => ({ label, value })),
      );
      if (messageCaption) {
        assert.ok(filled.html.includes(captionOf(messageCaption)), `message caption "${messageCaption}" missing`);
        assert.ok(filled.html.includes('First line &amp; more<br>Second line</div>'), 'message missing');
      } else {
        assert.ok(!filled.html.includes(MESSAGE_BOX), `${template} has no message section`);
      }
      assertPlainText(filled.text, template);
      const messageLines = messageCaption ? [messageCaption, 'First line & more', 'Second line'] : [];
      assertLines(filled.text, [detailsCaption, ...details.map(textLineOf), ...messageLines], template);

      const absent = await mailService.render(template, base);
      const empty = await mailService.render(template, { ...base, details: [], message: '' });
      assert.equal(empty.html, absent.html, 'empty and missing sections render the same');
      assert.equal(empty.text, absent.text);
      const markers = [DETAILS_TABLE, DETAILS_ROW, MESSAGE_BOX, captionOf(detailsCaption)];
      if (messageCaption) markers.push(captionOf(messageCaption));
      for (const marker of markers) {
        assert.ok(!absent.html.includes(marker), `${template} still renders "${marker}" without details/message`);
      }
      assert.ok(!linesOf(absent.text).includes(detailsCaption));
      assert.doesNotMatch(absent.html + absent.text, /\bundefined\b|\bnull\b|\[object Object\]/);
      assert.ok(absent.html.includes(base.heading), 'the rest of the email still renders');
    });
  }

  it('team-notification captions the message with messageLabel when the service sets one', async () => {
    const { base, details } = SAMPLES['team-notification'];
    for (const messageLabel of ['Notes from the visitor', 'Feedback']) {
      const { html, text } = await mailService.render('team-notification', {
        ...base,
        details,
        message: MESSAGE,
        messageLabel,
      });
      assert.ok(html.includes(captionOf(messageLabel)), messageLabel);
      assert.ok(!html.includes(captionOf('Message')), `${messageLabel}: default caption should not render`);
      assertLines(text, [messageLabel, 'First line & more'], messageLabel);
    }
  });
});

describe('parent context leakage', () => {
  // Handlebars hands every partial the parent context merged with its hash parameters, so a top-level key named
  // like a partial parameter would surface in the partial if a template ever forgot to pass that parameter.
  const UNRELATED = Object.freeze({
    caption: 'LEAKED caption',
    text: 'LEAKED text',
    rows: [{ label: 'LEAKED row', value: 'LEAKED value' }],
    title: 'LEAKED title',
    label: 'LEAKED label',
    value: 'LEAKED value',
    href: 'https://leaked.example/',
    muted: true,
  });

  it('unrelated top-level keys never surface in a template that has no details or message', async () => {
    for (const [template, { base }] of Object.entries(SAMPLES)) {
      const clean = await mailService.render(template, base);
      const noisy = await mailService.render(template, { ...base, ...UNRELATED });
      assert.doesNotMatch(noisy.html + noisy.text, /LEAKED|leaked\.example/, template);
      assert.equal(noisy.html, clean.html, template);
      assert.equal(noisy.text, clean.text, template);
    }
  });

  it('unrelated top-level keys change neither the detail rows, the captions nor the <title>', async () => {
    for (const [template, { base, details }] of Object.entries(SAMPLES)) {
      const context = { ...base, details, message: MESSAGE };
      const clean = await mailService.render(template, context);
      const noisy = await mailService.render(template, { ...context, ...UNRELATED });
      assert.doesNotMatch(noisy.html + noisy.text, /LEAKED|leaked\.example/, template);
      assert.ok(noisy.html.includes(`<title>${base.heading}</title>`), `${template}: <title>`);
      assert.equal(noisy.html, clean.html, template);
      assert.equal(noisy.text, clean.text, template);
    }
  });
});

describe('layouts/main.hbs footer', () => {
  const PHONE = '+91 94443 14567';
  const PHONE_ALT = '+91 94442 54567';
  const footerHtmlOf = (html) => html.slice(html.lastIndexOf('bgcolor="#0B1630"'));
  const footerTextOf = (text) => text.slice(text.lastIndexOf('\n—\n') + 3);

  it('shows the second phone number in the html and text footer of every email when BRAND_PHONE_ALT is set', async () => {
    const service = mailServiceWith({ BRAND_PHONE_ALT: PHONE_ALT });
    for (const [template, { base }] of Object.entries(SAMPLES)) {
      const { html, text } = await service.render(template, base);
      assert.match(
        footerHtmlOf(html),
        new RegExp(
          [
            '<a href="tel:\\+919444314567"[^>]*>\\+91 94443 14567</a>',
            '<a href="tel:\\+919444254567"[^>]*>\\+91 94442 54567</a>',
            '<a href="mailto:concierge@test\\.example"',
          ].join('\\s*&nbsp;&middot;&nbsp;\\s*'),
        ),
        template,
      );
      assertLines(footerTextOf(text), [`${PHONE} · ${PHONE_ALT} · concierge@test.example`], template);
    }
  });

  it('leaves the second phone number out when BRAND_PHONE_ALT is unset or blank', async () => {
    const { base } = SAMPLES['enquiry-confirmation'];
    for (const env of [{}, { BRAND_PHONE_ALT: '' }, { BRAND_PHONE_ALT: '   ' }]) {
      const { html, text } = await mailServiceWith(env).render('enquiry-confirmation', base);
      const where = `BRAND_PHONE_ALT=${JSON.stringify(env.BRAND_PHONE_ALT)}`;
      const footer = footerHtmlOf(html);
      assert.equal(count(footer, 'href="tel:'), 1, where);
      assert.match(
        footer,
        /\+91 94443 14567<\/a>\s*&nbsp;&middot;&nbsp;\s*<a href="mailto:concierge@test\.example"/,
        where,
      );
      assert.ok(!html.includes('94442'), where);
      assertLines(footerTextOf(text), [`${PHONE} · concierge@test.example`], where);
      assert.doesNotMatch(footerTextOf(text), /·\s*·/, where);
    }
  });
});

describe('plain-text alternative', () => {
  it('lists each detail row as "Label: Value" (including "Not provided"), keeps message lines and decodes entities', async () => {
    const { text } = await mailService.render('team-notification', {
      ...SAMPLES['team-notification'].base,
      details: [
        { label: 'Full name', value: 'Aarav Mehta' },
        { label: 'Email', value: "o'brien@example.com", href: "mailto:o'brien@example.com" },
        { label: 'Phone', value: '+919820012345', href: 'tel:+919820012345' },
        { label: 'Budget', value: 'Not provided', muted: true },
        { label: 'Topic', value: 'Home ownership & after-sales' },
        { label: 'Venue', value: 'Dadha Chambers, Royapettah', href: 'https://maps.google.com/?q=Dadha+Chambers' },
      ],
      message: 'Is 5 < 10 & "yes" isn\'t it?\nSecond line',
    });
    assertLines(
      text,
      [
        'Submission details',
        'Full name: Aarav Mehta',
        "Email: o'brien@example.com",
        'Phone: +919820012345',
        'Budget: Not provided',
        'Topic: Home ownership & after-sales',
        'Venue: Dadha Chambers, Royapettah (https://maps.google.com/?q=Dadha+Chambers)',
        'Message',
        'Is 5 < 10 & "yes" isn\'t it?',
        'Second line',
      ],
      'team-notification',
    );
    assertPlainText(text, 'team-notification');
  });

  describe('emails sent for the website forms', () => {
    beforeEach(() => provider.reset());

    // Payloads shaped like client/src/components/forms (after compact(): blank optional fields are not sent).
    const submissions = [
      {
        form: 'EnquiryForm on the contact page',
        url: '/api/enquiries',
        body: {
          name: 'Aarav Mehta',
          phone: '+91 98200 12345',
          email: 'Aarav.Mehta@Example.com',
          residence: 'Alphafour Altitude',
          message: 'We are looking for a 4 BHK duplex.\nPlease share floor plans & pricing.',
          consent: true,
          source: 'contact/enquiry',
        },
        visitor: 'aarav.mehta@example.com',
        hasMessage: true,
        messageLines: ['We are looking for a 4 BHK duplex.', 'Please share floor plans & pricing.'],
        notProvided: ['Budget'],
        visitorLines: [
          'Full name: Aarav Mehta',
          'Email: aarav.mehta@example.com',
          'Phone: +919820012345',
          'Residence: Alphafour Altitude',
        ],
      },
      {
        form: 'BrochureForm on a residence page',
        url: '/api/enquiries',
        body: {
          name: 'Rohan Iyer',
          email: 'rohan.iyer@example.com',
          phone: '98400 12345',
          consent: true,
          source: 'residence/alphafour-altitude/brochure',
          residence: 'Alphafour Altitude',
          subject: 'Brochure request',
          message: 'Please share the brochure, price list and floor plans for Alphafour Altitude.',
        },
        visitor: 'rohan.iyer@example.com',
        hasMessage: true,
        messageLines: ['Please share the brochure, price list and floor plans for Alphafour Altitude.'],
        teamLines: ['Subject: Brochure request', 'Residence: Alphafour Altitude'],
        visitorLines: ['Subject: Brochure request', 'Residence: Alphafour Altitude'],
      },
      {
        form: 'SiteVisitForm on the home page',
        url: '/api/enquiries/site-visit',
        body: {
          name: 'Ishita Rao',
          email: 'ishita@example.com',
          phone: '98200 12345',
          residence: 'Alphafour Altitude',
          date: addDays(todayInIST(), 3),
          time: '11:00',
          guests: 2,
          consent: true,
          source: 'home/site-visit',
        },
        visitor: 'ishita@example.com',
        hasMessage: false, // the website's site-visit form has no notes field
        teamLines: ['Time slot: 11:00 AM IST', 'Guests: 2', 'Residence: Alphafour Altitude'],
        visitorLines: ['Full name: Ishita Rao', 'Phone: 9820012345', 'Residence: Alphafour Altitude'],
      },
      {
        form: 'CallbackForm on the contact page',
        url: '/api/enquiries/callback',
        body: {
          name: 'Kabir Shah',
          phone: '+91 98200 55555',
          email: 'kabir@example.com',
          preferredTime: 'evening',
          consent: true,
          source: 'contact/callback',
        },
        visitor: 'kabir@example.com',
        hasMessage: false,
        teamLines: ['Best time to call: Evening · 4 – 7 pm'],
        visitorLines: ['Best time to call: Evening · 4 – 7 pm', 'Phone: +919820055555'],
      },
      {
        form: 'FeedbackForm on the contact page',
        url: '/api/feedback',
        body: {
          rating: 4,
          topic: 'after-sales',
          message: 'Handover was smooth.\nThe snag list was closed within a week.',
          email: 'meera@example.com',
          allowTestimonial: false,
          source: 'contact/feedback',
        },
        visitor: 'meera@example.com',
        hasMessage: true,
        messageLines: ['Handover was smooth.', 'The snag list was closed within a week.'],
        notProvided: ['Name', 'Would recommend'],
        teamLines: ['Topic: Home ownership & after-sales'],
        visitorLines: ['Email: meera@example.com'],
      },
      {
        form: 'NewsletterForm in the footer',
        url: '/api/newsletter/subscribe',
        body: { email: 'Priya@Example.com', source: 'footer/newsletter' },
        visitor: 'priya@example.com',
        hasMessage: false,
        teamLines: ['Email: priya@example.com'],
        visitorLines: ['Email: priya@example.com'],
      },
    ];

    for (const submission of submissions) {
      const { form, url, body, visitor, hasMessage, messageLines = [], notProvided = [] } = submission;

      it(`${form}: the admin and visitor emails mirror every detail row as plain "Label: Value" lines`, async () => {
        await request(app).post(url).send(body).expect(201);
        await whenIdle();
        assert.equal(provider.sent.length, 2, 'both the admin and the visitor receive an email');
        const [team, confirmation] = provider.sent;
        assert.deepEqual(team.to, ['sales@test.example']);
        assert.equal(confirmation.to, visitor);

        for (const [mail, who] of [
          [team, 'admin'],
          [confirmation, 'visitor'],
        ]) {
          const where = `${form} (${who} email)`;
          assertPlainText(mail.text, where);
          const rows = detailRowsOf(mail.html);
          assert.ok(rows.length > 0, `${where}: no details table`);
          assertLines(mail.text, rows.map(textLineOf), where);
          for (const row of rows) {
            assert.equal(row.muted, row.value === 'Not provided', `${where}: "${row.label}" muted styling`);
          }
          assert.equal(mail.html.includes(MESSAGE_BOX), hasMessage, `${where}: message section`);
          assertLines(mail.text, messageLines, where);
        }

        // Admin: every field with blanks shown as "Not provided", plus when it was submitted (IST).
        assertLines(team.text, ['Submission details', ...notProvided.map((label) => `${label}: Not provided`)], form);
        assertLines(team.text, submission.teamLines ?? [], form);
        assert.match(team.text, /^Received \d{1,2} [A-Z][a-z]{2} \d{4}, \d{1,2}:\d{2}\s?[ap]m IST/im);

        // Visitor: only what they filled in.
        assert.doesNotMatch(confirmation.text, /Not provided/);
        assertLines(confirmation.text, submission.visitorLines, form);
      });
    }
  });
});
