import { randomInt } from 'node:crypto';

// No 0/O/1/I to keep references easy to read over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Human-friendly reference such as "AUR-7K3F9Q". */
export function generateReference(prefix = 'AUR', length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) code += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${code}`;
}
