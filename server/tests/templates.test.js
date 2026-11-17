import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestApp } from './helpers.js';
import { buildIcsEvent } from '../src/utils/ics.js';
import { htmlToText } from '../src/utils/html-to-text.js';
import { formatTimeSlot, istToUtc, isValidDateString } from '../src/utils/time.js';

const { container } = createTestApp();
const { mailService } = container.services;

describe('email templates', () => {
  const samples = {
    'team-notification': {
      eyebrow: 'Website enquiry',
      heading: 'New enquiry',
      intro: 'Test intro',
      reference: 'AUR-TEST01',
      details: [{ label: 'Name', value: 'Test' }],
      message: 'Line one\nLine two',
      actions: [{ label: 'Reply', href: 'mailto:test@example.com' }],
      submittedAt: 'now',
      requestId: 'req-1',
    },
    'enquiry-confirmation': { heading: 'Thank you, Test', reference: 'AUR-TEST01', residence: 'Aurelia Sky Residences' },
    'site-visit-confirmation': {
      heading: 'See you soon, Test',
      reference: 'AUR-TEST01',
      dateLabel: 'Sunday, 15 November 2026',
      timeLabel: '3:00 PM',
      guests: 2,
      guestsLabel: 'guests',
      details: [{ label: 'Venue', value: 'MRC Nagar' }],
    },
    'callback-confirmation': {
      heading: 'We’ll call you shortly, Test',
      reference: 'AUR-TEST01',
      phone: '+919820012345',
      windowSentence: 'in the evening',
      details: [],
    },
    'feedback-thanks': { heading: 'Thank you, Test', reference: 'FDB-TEST01', rating: 4, topicLabel: 'Website' },
    'newsletter-welcome': { heading: 'Welcome, Test', email: 'test@example.com' },
  };

  for (const [template, context] of Object.entries(samples)) {
    it(`renders ${template} inside the branded layout`, async () => {
      const { html, text } = await mailService.render(template, context, { preheader: 'Preview' });
      assert.match(html, /<!doctype html>/i);
      assert.match(html, /ALPHAFOUR/);
      assert.match(html, new RegExp(context.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.ok(text.length > 40, 'text alternative should not be empty');
      assert.doesNotMatch(text, /<[a-z]/i, 'text alternative must not contain HTML');
    });
  }

  it('escapes user content and converts newlines', async () => {
    const { html } = await mailService.render('team-notification', { ...samples['team-notification'], message: '<img src=x>\nNext' });
    assert.doesNotMatch(html, /<img src=x>/);
    assert.match(html, /&lt;img src&#x3D;x&gt;<br>Next/);
  });
});

describe('utilities', () => {
  it('builds a valid calendar event', () => {
    const ics = buildIcsEvent({
      uid: 'x@aurelia',
      start: istToUtc('2026-11-15', '15:00'),
      summary: 'Private viewing, MRC Nagar',
      organizer: { name: 'Aurelia', email: 'a@example.com' },
    });
    assert.match(ics, /DTSTART:20261115T093000Z/);
    assert.match(ics, /DTEND:20261115T103000Z/);
    assert.match(ics, /SUMMARY:Private viewing\\, MRC Nagar/);
    assert.ok(ics.endsWith('\r\n'));
  });

  it('validates calendar dates', () => {
    assert.equal(isValidDateString('2026-02-29'), false);
    assert.equal(isValidDateString('2028-02-29'), true);
    assert.equal(isValidDateString('15/11/2026'), false);
  });

  it('formats time slots', () => {
    assert.equal(formatTimeSlot('10:00'), '10:00 AM');
    assert.equal(formatTimeSlot('12:00'), '12:00 PM');
    assert.equal(formatTimeSlot('17:00'), '5:00 PM');
  });

  it('converts HTML to readable text', () => {
    const text = htmlToText('<p>Hello <a href="https://aurelia.example">site</a></p><table><tr><td>Name</td><td>Asha</td></tr></table>');
    assert.match(text, /Hello site \(https:\/\/aurelia\.example\)/);
    assert.match(text, /Name: Asha/);
  });
});
