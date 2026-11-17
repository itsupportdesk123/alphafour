import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;

/** <Tooltip content="Label">{trigger}</Tooltip> */
export function Tooltip({ content, children, side = 'top' }) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className="z-[130] rounded-full border border-gold/30 bg-navy px-3.5 py-1.5 text-xs font-medium text-ivory shadow-luxe data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
