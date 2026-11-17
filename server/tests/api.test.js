import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { addDays, todayInIST } from '../src/utils/time.js';
import { createTestApp } from './helpers.js';

const { app, provider, whenIdle } = createTestApp();

const enquiry = {
  name: 'Aarav Mehta',
  email: 'Aarav.Mehta@Example.com',
  phone: '+91 98200 12345',
  residence: 'Aurelia Sky Residences',
  message: 'We are interested in a 4 BHK with a sea view. Please share availability.',
  consent: true,
  source: 'tests/contact',
};

const fieldsOf = (res) => res.body.errors.map((e) => e.field);

beforeEach(() => provider.reset());

describe('GET /api/health', () => {
  it('reports service and mail status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.equal(res.body.data.mail.provider, 'memory');
    assert.ok(res.headers['x-request-id']);
  });

  it('echoes a well-formed X-Request-Id', async () => {
    const res = await request(app).get('/api/health').set('X-Request-Id', 'req-12345678').expect(200);
    assert.equal(res.headers['x-request-id'], 'req-12345678');
    assert.equal(res.body.requestId, 'req-12345678');
  });
});

describe('POST /api/enquiries', () => {
  it('rejects an empty submission with field errors', async () => {
    const res = await request(app).post('/api/enquiries').send({}).expect(400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    for (const field of ['name', 'email', 'phone', 'message', 'consent']) {
      assert.ok(fieldsOf(res).includes(field), `missing error for ${field}`);
    }
  });

  it('notifies the sales team and confirms to the visitor', async () => {
    const res = await request(app).post('/api/enquiries').send(enquiry).expect(201);
    assert.match(res.body.data.reference, /^AUR-[A-HJ-NP-Z2-9]{6}$/);
    await whenIdle();

    assert.equal(provider.sent.length, 2);
    const [team, visitor] = provider.sent;
    assert.deepEqual(team.to, ['sales@test.example']);
    assert.deepEqual(team.cc, ['director@test.example']);
    assert.equal(team.replyTo, 'aarav.mehta@example.com');
    assert.match(team.subject, new RegExp(res.body.data.reference));
    assert.match(team.html, /Aurelia Sky Residences/);
    assert.match(team.text, /We are interested in a 4 BHK/);
    assert.equal(team.from.address, 'concierge@test.example');

    assert.equal(visitor.to, 'aarav.mehta@example.com');
    assert.match(visitor.subject, /Thank you for your enquiry/);
    assert.match(visitor.html, /Thank you, Aarav/);
  });

  it('strips HTML from user input', async () => {
    await request(app)
      .post('/api/enquiries')
      .send({ ...enquiry, name: '<b>Aarav</b> Mehta', message: '<script>alert(1)</script>Please call me back about pricing.' })
      .expect(201);
    await whenIdle();
    const [team] = provider.sent;
    assert.doesNotMatch(team.html, /<script>/);
    assert.doesNotMatch(team.html, /<b>Aarav/);
  });

  it('silently accepts honeypot submissions without sending email', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...enquiry, company: 'Spam Corp' }).expect(201);
    assert.ok(res.body.data.reference);
    await whenIdle();
    assert.equal(provider.sent.length, 0);
  });

  it('returns 503 when the team notification cannot be delivered', async () => {
    provider.failuresLeft = 3;
    const res = await request(app).post('/api/enquiries').send(enquiry).expect(503);
    assert.equal(res.body.code, 'SERVICE_UNAVAILABLE');
    assert.match(res.body.message, /try again/i);
  });

  it('retries transient failures before succeeding', async () => {
    provider.failuresLeft = 2;
    await request(app).post('/api/enquiries').send(enquiry).expect(201);
    await whenIdle();
    assert.equal(provider.sent.length, 2);
  });
});

describe('POST /api/enquiries/site-visit', () => {
  const visit = {
    name: 'Ishita Rao',
    email: 'ishita@example.com',
    phone: '9820012345',
    residence: 'Aurelia Sky Residences',
    date: addDays(todayInIST(), 3),
    time: '15:00',
    guests: 3,
    consent: true,
  };

  it('rejects dates in the past and unknown time slots', async () => {
    const res = await request(app)
      .post('/api/enquiries/site-visit')
      .send({ ...visit, date: addDays(todayInIST(), -1), time: '23:00' })
      .expect(400);
    assert.ok(fieldsOf(res).includes('date'));
    assert.ok(fieldsOf(res).includes('time'));
  });

  it('rejects dates beyond the booking window', async () => {
    const res = await request(app)
      .post('/api/enquiries/site-visit')
      .send({ ...visit, date: addDays(todayInIST(), 90) })
      .expect(400);
    assert.ok(fieldsOf(res).includes('date'));
  });

  it('confirms the visit with a calendar invite (IST → UTC)', async () => {
    const res = await request(app).post('/api/enquiries/site-visit').send(visit).expect(201);
    assert.equal(res.body.data.type, 'site-visit');
    await whenIdle();
    assert.equal(provider.sent.length, 2);
    const confirmation = provider.sent[1];
    const ics = confirmation.attachments.find((a) => a.filename.endsWith('.ics'));
    assert.ok(ics, 'calendar attachment missing');
    assert.match(ics.content, /BEGIN:VCALENDAR/);
    const utcDate = visit.date.replace(/-/g, '');
    assert.match(ics.content, new RegExp(`DTSTART:${utcDate}T093000Z`));
  });
});

describe('POST /api/enquiries/callback', () => {
  const callback = { name: 'Kabir Shah', phone: '+91 98200 55555', preferredTime: 'evening', consent: true };

  it('notifies only the team when no email is given', async () => {
    await request(app).post('/api/enquiries/callback').send(callback).expect(201);
    await whenIdle();
    assert.equal(provider.sent.length, 1);
    assert.match(provider.sent[0].subject, /Evening/);
  });

  it('also confirms by email when an email is given', async () => {
    await request(app)
      .post('/api/enquiries/callback')
      .send({ ...callback, email: 'kabir@example.com' })
      .expect(201);
    await whenIdle();
    assert.equal(provider.sent.length, 2);
    assert.equal(provider.sent[1].to, 'kabir@example.com');
  });

  it('rejects an unknown preferred time', async () => {
    const res = await request(app)
      .post('/api/enquiries/callback')
      .send({ ...callback, preferredTime: 'midnight' })
      .expect(400);
    assert.ok(fieldsOf(res).includes('preferredTime'));
  });
});

describe('POST /api/feedback', () => {
  const feedback = {
    name: 'Meera Kapoor',
    email: 'meera@example.com',
    rating: 5,
    topic: 'site-visit',
    message: 'The private viewing was wonderful and our advisor was very knowledgeable.',
    recommend: true,
    allowTestimonial: true,
  };

  it('validates the rating', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({ ...feedback, rating: 9 })
      .expect(400);
    assert.ok(fieldsOf(res).includes('rating'));
  });

  it('sends feedback to the team and thanks the guest', async () => {
    const res = await request(app).post('/api/feedback').send(feedback).expect(201);
    assert.match(res.body.data.reference, /^FDB-/);
    await whenIdle();
    assert.equal(provider.sent.length, 2);
    assert.match(provider.sent[0].subject, /5\/5/);
    assert.match(provider.sent[1].html, /Thank you, Meera/);
  });

  it('flags low ratings for follow-up and accepts anonymous feedback', async () => {
    await request(app)
      .post('/api/feedback')
      .send({ rating: 2, message: 'The parking situation during my visit was confusing.' })
      .expect(201);
    await whenIdle();
    assert.equal(provider.sent.length, 1);
    assert.match(provider.sent[0].subject, /^⚠/);
  });
});

describe('POST /api/newsletter/subscribe', () => {
  it('rejects invalid emails', async () => {
    const res = await request(app).post('/api/newsletter/subscribe').send({ email: 'not-an-email' }).expect(400);
    assert.ok(fieldsOf(res).includes('email'));
  });

  it('notifies the team and welcomes the subscriber', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: 'Priya@Example.com', name: 'Priya Nair' })
      .expect(201);
    assert.equal(res.body.data.email, 'priya@example.com');
    await whenIdle();
    assert.equal(provider.sent.length, 2);
    assert.match(provider.sent[1].html, /Welcome, Priya/);
  });
});

describe('errors', () => {
  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    assert.equal(res.body.code, 'NOT_FOUND');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .set('Content-Type', 'application/json')
      .send('{"name": "broken"')
      .expect(400);
    assert.equal(res.body.code, 'BAD_REQUEST');
  });

  it('returns 413 for oversized bodies', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .send({ ...enquiry, message: 'x'.repeat(30_000) })
      .expect(413);
    assert.equal(res.body.code, 'PAYLOAD_TOO_LARGE');
  });
});
