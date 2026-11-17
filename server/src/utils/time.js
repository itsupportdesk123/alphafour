/**
 * Date helpers pinned to India Standard Time (UTC+05:30, no daylight saving).
 * Calendar dates are plain 'YYYY-MM-DD' strings; times are 'HH:mm' (24h).
 */
const IST_OFFSET_MS = 330 * 60 * 1000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Today's calendar date in IST, e.g. "2026-10-23". */
export function todayInIST(now = new Date()) {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** True when the string is a real calendar date in YYYY-MM-DD form. */
export function isValidDateString(value) {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Adds whole days to a YYYY-MM-DD string. */
export function addDays(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "2026-11-15" → "Sunday, 15 November 2026" */
export function formatLongDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "15:00" → "3:00 PM" */
export function formatTimeSlot(time) {
  const match = TIME_RE.exec(time);
  if (!match) return time;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${match[2]} ${suffix}`;
}

/** Converts an IST calendar date + time to a UTC Date instance. */
export function istToUtc(dateString, time) {
  const [y, m, d] = dateString.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MS);
}

/** "23 Oct 2026, 2:45 pm IST" */
export function formatTimestampIST(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);
  return `${formatted} IST`;
}
