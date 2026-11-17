import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom font sizes from tailwind.config.js; otherwise it reads
// `text-micro` as a colour and drops it whenever a colour class such as `text-gold` follows.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: { 'font-size': [{ text: ['micro', 'display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm'] }] },
  },
});

/** Merges Tailwind class names, resolving conflicts (shadcn convention). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Maps `value` from [inMin, inMax] to [0, 1] (clamped). */
export const progressBetween = (value, inMin, inMax) => clamp((value - inMin) / (inMax - inMin), 0, 1);

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
