import { forwardRef } from 'react';
import { fieldBase, fieldTone } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input({ className, tone = 'light', type = 'text', ...props }, ref) {
  return <input ref={ref} type={type} className={cn(fieldBase, fieldTone[tone], 'h-12', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, tone = 'light', rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, fieldTone[tone], 'min-h-[7rem] resize-y py-3 leading-relaxed', className)}
      {...props}
    />
  );
});
