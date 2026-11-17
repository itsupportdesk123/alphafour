const CRORE = 10_000_000;
const LAKH = 100_000;

const trim = (value) => value.toFixed(2).replace(/\.?0+$/, '');

/**
 * Indian rupee formatting.
 *   formatINR(125000000)                 → "₹12.5 Cr"
 *   formatINR(8500000)                   → "₹85 L"
 *   formatINR(125000000, { compact: false }) → "₹12,50,00,000"
 */
export function formatINR(amount, { compact = true } = {}) {
  if (!Number.isFinite(amount)) return '—';
  if (compact) {
    if (amount >= CRORE) return `₹${trim(amount / CRORE)} Cr`;
    if (amount >= LAKH) return `₹${trim(amount / LAKH)} L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatPriceRange(min, max) {
  if (!Number.isFinite(min)) return 'Price on request';
  if (!max || max <= min) return `${formatINR(min)} onwards`;
  return `${formatINR(min)} – ${formatINR(max)}`;
}

export const formatNumber = (value) => Math.round(value).toLocaleString('en-IN');

export const formatArea = (sqft) => `${formatNumber(sqft)} sq.ft`;

export function formatAreaRange(min, max) {
  if (!max || max <= min) return formatArea(min);
  return `${formatNumber(min)} – ${formatNumber(max)} sq.ft`;
}

/** [3, 4] → "3 & 4 BHK" · [2, 3, 4] → "2, 3 & 4 BHK" */
export function formatBhk(options) {
  if (!options?.length) return '';
  if (options.length === 1) return `${options[0]} BHK`;
  return `${options.slice(0, -1).join(', ')} & ${options[options.length - 1]} BHK`;
}

/** "2027-12" → "Dec 2027" */
export function formatPossession(value) {
  if (!value) return 'Ready to move';
  const [year, month = '1'] = value.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
