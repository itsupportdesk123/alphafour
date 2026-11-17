import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ value, max = 5, size = 'sm', className }) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-5';
  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`Rated ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(iconSize, i < value ? 'fill-gold text-gold' : 'fill-transparent text-gold/40')}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
