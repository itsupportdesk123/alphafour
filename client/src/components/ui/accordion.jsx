import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef(function AccordionItem({ className, ...props }, ref) {
  return <AccordionPrimitive.Item ref={ref} className={cn('border-b border-gold/20', className)} {...props} />;
});

export const AccordionTrigger = forwardRef(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'group flex flex-1 items-center justify-between gap-6 py-5 text-left font-display text-xl transition-colors hover:text-gold-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-gold sm:text-2xl',
          className,
        )}
        {...props}
      >
        {children}
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 transition-transform duration-500 ease-luxe group-data-[state=open]:rotate-45">
          <Plus className="size-4" aria-hidden />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = forwardRef(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-6 pr-12 leading-relaxed', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
