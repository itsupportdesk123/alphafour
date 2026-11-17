import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-500 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        gold: 'bg-gold-foil bg-[length:200%_100%] bg-left text-navy shadow-[0_10px_30px_-12px_rgba(201,162,75,.8)] hover:bg-right hover:shadow-gold-glow',
        royal: 'bg-royal text-ivory shadow-luxe hover:bg-sapphire',
        navy: 'bg-navy text-ivory shadow-luxe hover:bg-navy-700 dark:bg-ivory dark:text-navy dark:hover:bg-cream',
        outline:
          'border border-gold/60 bg-transparent text-current hover:border-gold hover:bg-gold/10 dark:border-gold/50',
        'outline-light': 'border border-ivory/40 bg-white/5 text-ivory backdrop-blur-md hover:border-gold hover:bg-white/10',
        glass: 'glass text-current hover:border-gold/50',
        ghost: 'text-current hover:bg-gold/10',
        link: 'h-auto rounded-none px-0 text-gold-ink underline-offset-8 hover:underline dark:text-gold [[data-tone=dark]_&]:text-gold',
      },
      size: {
        sm: 'h-9 px-4 text-[0.7rem] uppercase tracking-[0.16em]',
        md: 'h-11 px-6 text-[0.72rem] uppercase tracking-[0.18em]',
        lg: 'h-[3.25rem] px-8 text-[0.75rem] uppercase tracking-[0.2em]',
        xl: 'h-14 px-10 text-[0.78rem] uppercase tracking-[0.22em]',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: { variant: 'gold', size: 'md' },
  },
);

export const Button = forwardRef(function Button({ className, variant, size, asChild = false, ...props }, ref) {
  const Component = asChild ? Slot : 'button';
  return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
