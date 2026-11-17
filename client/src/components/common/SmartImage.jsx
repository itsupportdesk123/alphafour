import { useState } from 'react';
import { unsplash, unsplashBlur, unsplashSrcSet } from '@/lib/media';
import { cn } from '@/lib/utils';

/**
 * Responsive, lazy image with a blurred placeholder that fades into the sharp photo.
 * Pass `photo` (Unsplash id) for automatic AVIF/WebP srcset, or `src` for local files.
 */
export function SmartImage({
  photo,
  src,
  alt,
  ratio,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  widths,
  priority = false,
  className,
  imgClassName,
  crop,
  quality,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = photo ? unsplash(photo, { w: 1600, h: ratio ? Math.round(1600 / ratio) : undefined, crop, q: quality }) : src;
  const srcSet = photo ? unsplashSrcSet(photo, { widths, ratio, crop, q: quality }) : undefined;
  const blur = photo ? unsplashBlur(photo, ratio) : undefined;

  return (
    <div
      className={cn('relative overflow-hidden bg-sand/60 dark:bg-navy-800', className)}
      style={ratio ? { aspectRatio: String(ratio) } : undefined}
    >
      {blur && (
        <img
          src={blur}
          alt=""
          aria-hidden
          className={cn(
            'absolute inset-0 size-full scale-110 object-cover blur-xl transition-opacity duration-700',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}
      <img
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        className={cn(
          'relative size-full object-cover transition-[opacity,transform] duration-1000 ease-luxe',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
        {...props}
      />
    </div>
  );
}
