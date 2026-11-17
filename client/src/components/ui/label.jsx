import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn('text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-80', className)}
      {...props}
    />
  );
});
