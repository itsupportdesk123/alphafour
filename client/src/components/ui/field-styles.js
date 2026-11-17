/** Shared field styling for inputs, selects and pickers. */
export const fieldBase =
  'w-full rounded-xl border px-4 text-[0.95rem] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-current placeholder:opacity-50 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20';

export const fieldTone = {
  light: 'border-input bg-white/80 text-foreground dark:bg-navy-800/60',
  dark: 'border-white/15 bg-white/[0.06] text-ivory focus-visible:bg-white/[0.09]',
};
