import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/**
 * Development provider: never sends anything. It logs a summary and writes
 * HTML / text / attachment previews to `previewDir` so templates can be opened in a browser.
 * @implements {import('./mail-provider.interface.js').MailProvider}
 */
export class ConsoleMailProvider {
  constructor({ previewDir, writeToDisk = true, logger }) {
    this.name = 'console';
    this.previewDir = path.resolve(previewDir);
    this.writeToDisk = writeToDisk;
    this.logger = logger.child({ provider: 'console' });
  }

  async verify() {
    return true;
  }

  async send(message) {
    const messageId = `console-${randomUUID()}`;
    const to = [].concat(message.to ?? []);
    const attachments = (message.attachments ?? []).map((a) => a.filename);

    this.logger.info({ messageId, to, subject: message.subject, attachments }, 'Email captured by console provider');

    if (this.writeToDisk) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const base = path.join(this.previewDir, `${stamp}-${slugify(message.subject)}`);
      await mkdir(this.previewDir, { recursive: true });
      await writeFile(`${base}.html`, message.html, 'utf8');
      await writeFile(`${base}.txt`, `To: ${to.join(', ')}\nSubject: ${message.subject}\n\n${message.text}`, 'utf8');
      for (const attachment of message.attachments ?? []) {
        await writeFile(`${base}--${attachment.filename}`, attachment.content);
      }
    }

    return { messageId, accepted: to, provider: this.name };
  }

  async close() {}
}
