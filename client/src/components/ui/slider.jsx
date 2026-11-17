import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/** Gold range slider. Pass `thumbLabels` for accessible names (one per thumb). */
export const Slider = forwardRef(function Slider({ className, tone = 'light', thumbLabels = [], ...props }, ref) {
  const thumbs = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center py-3', className)}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn('relative h-[3px] w-full grow overflow-hidden rounded-full', tone === 'dark' ? 'bg-white/15' : 'bg-sand dark:bg-navy-700')}
      >
        <SliderPrimitive.Range className="absolute h-full bg-gold-foil" />
      </SliderPrimitive.Track>
      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={thumbLabels[index]}
          className="block size-5 cursor-grab rounded-full border-2 border-gold bg-ivory shadow-gold-glow transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/30 active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
