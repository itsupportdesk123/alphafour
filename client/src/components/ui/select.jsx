import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';
import { fieldBase, fieldTone } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

/**
 * Luxury select built on Radix (keyboard + screen-reader friendly).
 * <Select value onValueChange options={[{ value, label }]} placeholder tone="light|dark" />
 */
export const Select = forwardRef(function Select(
  { value, onValueChange, options, placeholder = 'Select', tone = 'light', className, id, name, 'aria-invalid': invalid, 'aria-describedby': describedBy, 'aria-label': ariaLabel, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} name={name} {...props}>
      <SelectPrimitive.Trigger
        ref={ref}
        id={id}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        className={cn(fieldBase, fieldTone[tone], 'flex h-12 items-center justify-between gap-3 text-left', className)}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[120] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-gold/25 bg-popover text-popover-foreground shadow-luxe data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none transition-colors data-[highlighted]:bg-gold/15 data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-3 inline-flex">
                  <Check className="size-4 text-gold" aria-hidden />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});
