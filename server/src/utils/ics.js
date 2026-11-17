/**
 * Minimal RFC 5545 calendar file for a single event (used as an email attachment
 * so visitors can add their requested site visit to any calendar app).
 */

const escapeText = (value = '') =>
  String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const formatUtc = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Folds lines longer than 75 octets as required by RFC 5545 §3.1. */
function foldLine(line) {
  if (line.length <= 73) return line;
  const parts = [];
  for (let i = 0; i < line.length; i += 73) parts.push((i === 0 ? '' : ' ') + line.slice(i, i + 73));
  return parts.join('\r\n');
}

/**
 * @param {{
 *   uid: string, start: Date, durationMinutes?: number, summary: string, description?: string,
 *   location?: string, url?: string, organizer: { name: string, email: string }
 * }} event
 * @returns {string}
 */
export function buildIcsEvent({ uid, start, durationMinutes = 60, summary, description, location, url, organizer }) {
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alphafour Infrastructure Pvt Ltd//Private Viewing//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    location ? `LOCATION:${escapeText(location)}` : null,
    url ? `URL:${url}` : null,
    `ORGANIZER;CN=${escapeText(organizer.name)}:mailto:${organizer.email}`,
    'STATUS:TENTATIVE',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
