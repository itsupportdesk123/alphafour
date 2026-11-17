/**
 * Mail provider contract (the strategy used by MailRepository).
 *
 * @typedef {Object} MailAttachment
 * @property {string} filename
 * @property {string | Buffer} content
 * @property {string} [contentType]
 *
 * @typedef {Object} MailMessage
 * @property {{ name: string, address: string } | string} from
 * @property {string | string[]} to
 * @property {string | string[]} [cc]
 * @property {string | string[]} [bcc]
 * @property {string} [replyTo]
 * @property {string} subject
 * @property {string} html
 * @property {string} text
 * @property {MailAttachment[]} [attachments]
 *
 * @typedef {Object} MailSendResult
 * @property {string} [messageId]
 * @property {string[]} [accepted]
 * @property {string} provider
 *
 * @typedef {Object} MailProvider
 * @property {string} name
 * @property {(message: MailMessage) => Promise<MailSendResult>} send
 * @property {() => Promise<boolean>} verify
 * @property {() => Promise<void>} [close]
 */

/**
 * Throws early (at startup) when an injected provider does not honour the contract.
 * @param {unknown} provider
 * @returns {asserts provider is MailProvider}
 */
export function assertMailProvider(provider) {
  const candidate = /** @type {Record<string, unknown>} */ (provider ?? {});
  if (typeof candidate.name !== 'string' || typeof candidate.send !== 'function' || typeof candidate.verify !== 'function') {
    throw new TypeError('Mail provider must expose { name: string, send(message), verify() }');
  }
}
