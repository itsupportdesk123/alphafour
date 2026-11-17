import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { createContainer } from '../src/container.js';

/** In-memory provider: captures messages and can simulate transport failures. */
export class MemoryMailProvider {
  constructor() {
    this.name = 'memory';
    this.sent = [];
    this.failuresLeft = 0;
  }

  async verify() {
    return true;
  }

  async send(message) {
    if (this.failuresLeft > 0) {
      this.failuresLeft -= 1;
      throw new Error('Simulated SMTP outage');
    }
    this.sent.push(message);
    return { messageId: `memory-${this.sent.length}`, accepted: [].concat(message.to), provider: this.name };
  }

  reset() {
    this.sent = [];
    this.failuresLeft = 0;
  }
}

export function createTestApp() {
  const config = loadConfig({
    NODE_ENV: 'test',
    MAIL_PROVIDER: 'console',
    MAIL_FROM_ADDRESS: 'concierge@test.example',
    MAIL_TEAM_TO: 'sales@test.example',
    MAIL_TEAM_CC: 'director@test.example',
    CLIENT_URL: 'http://localhost:5173',
  });
  const provider = new MemoryMailProvider();
  const container = createContainer(config, { mailProvider: provider });
  const app = createApp(container);
  const whenIdle = () => container.services.mailService.whenIdle(5_000);
  return { app, provider, container, whenIdle };
}
