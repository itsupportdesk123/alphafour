// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<\/?[a-z][^>]*>/gi;

/** Single-line text: strips tags and control characters, collapses whitespace. */
export function cleanText(value) {
  return String(value).replace(CONTROL_CHARS, '').replace(HTML_TAGS, '').replace(/\s+/g, ' ').trim();
}

/** Multi-line text (messages): keeps paragraphs, strips tags and control characters. */
export function cleanMultiline(value) {
  return String(value)
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAGS, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Keeps a leading "+" and digits only: "+91 98200-12345" → "+919820012345". */
export function normalizePhone(value) {
  const trimmed = String(value).trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}
