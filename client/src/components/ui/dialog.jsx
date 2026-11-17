import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = forwardRef(function Overlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-[100] bg-navy/60 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
});

/** Centered glass dialog. `side="right"` turns it into a full-height sheet. */
export const DialogContent = forwardRef(function DialogContent(
  { className, children, side = 'center', hideClose = false, ...props },
  ref,
) {
  const placement =
    side === 'right'
      ? 'inset-y-0 right-0 h-full w-full max-w-md rounded-l-3xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right'
      : side === 'left'
        ? 'inset-y-0 left-0 h-full w-full max-w-sm rounded-r-3xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left'
        : 'left-1/2 top-1/2 max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95';

  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        data-lenis-prevent
        className={cn(
          'fixed z-[110] overflow-y-auto border border-gold/25 bg-background/95 p-6 text-foreground shadow-luxe backdrop-blur-2xl duration-500 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:p-8',
          placement,
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-gold/30 transition-colors hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-6 space-y-2 pr-10', className)} {...props} />;
}

export const DialogTitle = forwardRef(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn('font-display text-display-sm', className)} {...props} />;
});

export const DialogDescription = forwardRef(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
});
