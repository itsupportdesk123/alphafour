import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import nodemailer from 'nodemailer';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { createContainer } from '../src/container.js';
import { MailRepository } from '../src/repositories/mail.repository.js';
import { addDays, todayInIST } from '../src/utils/time.js';

/**
 * The in-memory provider used by the other tests never runs nodemailer, which hid a crash: nodemailer
 * normalises address objects in place and the configured sender is frozen. These tests build every email
 * with nodemailer's stream transport, which produces the full MIME message and sends nothing.
 */
class NodemailerStreamProvider {
  constructor() {
    this.name = 'nodemailer-stream';
    this.transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
    this.raw = [];
  }

  async verify() {
    return true;
  }

  async send(message) {
    const info = await this.transport.sendMail(message);
    this.raw.push(info.message.toString());
    return { messageId: info.messageId, accepted: [].concat(message.to), provider: this.name };
  }
}

const config = loadConfig({
  NODE_ENV: 'test',
  MAIL_PROVIDER: 'console',
  MAIL_FROM_NAME: 'Alphafour Infrastructure Pvt Ltd',
  MAIL_FROM_ADDRESS: 'it.support.enexio@gmail.com',
  MAIL_TEAM_TO: 'it.support.enexio@gmail.com',
  CLIENT_URL: 'http://localhost:5200',
});
const provider = new NodemailerStreamProvider();
const container = createContainer(config, { mailProvider: provider });
const app = createApp(container);
const whenIdle = () => container.services.mailService.whenIdle(5_000);

/** Reads a top-level header from a raw MIME message. */
const header = (raw, name) => raw.split(/\r?\n\r?\n/)[0].match(new RegExp(`^${name}: (.*)$`, 'mi'))?.[1];

const visitor = { name: 'Aarav Mehta', email: 'aarav@example.com', phone: '+91 98200 12345', consent: true };
const FORMS = [
  [
    'enquiry',
    '/api/enquiries',
    { ...visitor, residence: 'Alphafour Altitude', message: 'Please share pricing and availability.' },
  ],
  ['site visit', '/api/enquiries/site-visit', { ...visitor, date: addDays(todayInIST(), 3), time: '15:00', guests: 2 }],
  ['call-back', '/api/enquiries/callback', { ...visitor, preferredTime: 'evening' }],
  [
    'feedback',
    '/api/feedback',
    { name: visitor.name, email: visitor.email, rating: 5, message: 'Wonderful visit, thank you.' },
  ],
  ['newsletter', '/api/newsletter/subscribe', { email: visitor.email }],
];

beforeEach(() => {
  provider.raw = [];
});

describe('emails built by nodemailer', () => {
  for (const [form, path, body] of FORMS) {
    it(`builds the admin and visitor emails for the ${form} form`, async () => {
      await request(app).post(path).send(body).expect(201);
      await whenIdle();

      assert.equal(provider.raw.length, 2);
      const [admin, copy] = provider.raw;
      assert.equal(header(admin, 'To'), 'it.support.enexio@gmail.com');
      assert.equal(header(admin, 'Reply-To'), 'aarav@example.com');
      assert.equal(header(copy, 'To'), 'aarav@example.com');
      for (const raw of provider.raw) {
        assert.equal(header(raw, 'From'), 'Alphafour Infrastructure Pvt Ltd <it.support.enexio@gmail.com>');
        assert.match(raw, /Content-Type: text\/plain/);
        assert.match(raw, /Content-Type: text\/html/);
      }
    });
  }

  it('attaches the calendar invite to the site-visit confirmation', async () => {
    await request(app).post('/api/enquiries/site-visit').send(FORMS[1][2]).expect(201);
    await whenIdle();
    const copy = provider.raw[1];
    assert.match(copy, /Content-Type: text\/calendar/);
    assert.match(copy, /alphafour-private-viewing\.ics/);
  });

  it('leaves the frozen sender from the config untouched', async () => {
    assert.ok(Object.isFrozen(config.mail.from));
    const repository = new MailRepository({ provider, from: config.mail.from, logger: container.logger });
    await repository.deliver({ to: 'one@example.com', subject: 'One', html: '<p>One</p>', text: 'One' });
    await repository.deliver({ to: 'two@example.com', subject: 'Two', html: '<p>Two</p>', text: 'Two' });
    assert.equal(provider.raw.length, 2);
    assert.deepEqual(config.mail.from, {
      name: 'Alphafour Infrastructure Pvt Ltd',
      address: 'it.support.enexio@gmail.com',
    });
  });
});
