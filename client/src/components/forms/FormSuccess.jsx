import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EASE_LUXE } from '@/lib/motion';

export function FormSuccess({ title = 'Thank you', message, reference, onReset, resetLabel = 'Send another' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_LUXE }}
      role="status"
      className="flex flex-col items-center py-6 text-center"
    >
      <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-gold-foil text-navy shadow-gold-glow">
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-gold" />
        <Check className="size-7" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-6 font-display text-display-sm">{title}</h3>
      <p className="mt-3 max-w-sm text-sm opacity-80">{message}</p>
      {reference && (
        <p className="mt-5 rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold tracking-[0.2em]">
          REF&nbsp;&nbsp;{reference}
        </p>
      )}
      {onReset && (
        <Button type="button" variant="link" className="mt-6" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </motion.div>
  );
}
