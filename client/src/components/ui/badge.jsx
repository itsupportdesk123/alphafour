import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em]',
  {
    variants: {
      variant: {
        gold: 'bg-gold-foil text-navy',
        royal: 'bg-royal text-ivory',
        teal: 'bg-[#0F766E] text-ivory',
        charcoal: 'bg-charcoal/85 text-ivory',
        glass: 'border border-white/25 bg-navy/45 text-ivory backdrop-blur-md',
        outline: 'border border-gold/50 text-gold-ink dark:text-gold',
      },
    },
    defaultVariants: { variant: 'gold' },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
