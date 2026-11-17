import { Link2, Mail, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SocialIcon } from '@/components/common/SocialIcons';
import { cn } from '@/lib/utils';

const button =
  'inline-flex size-10 items-center justify-center rounded-full border border-gold/30 text-foreground/80 transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-navy';

/** Native share sheet where the device has one, plus copy link, WhatsApp, LinkedIn, Facebook and email. */
export function ShareArticle({ title, url, vertical = false, className }) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);

  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const targets = [
    { name: 'WhatsApp', icon: <SocialIcon name="whatsapp" />, href: `https://wa.me/?text=${text}%20${link}` },
    { name: 'LinkedIn', icon: <SocialIcon name="linkedin" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}` },
    { name: 'Facebook', icon: <SocialIcon name="facebook" />, href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { name: 'email', icon: <Mail className="size-4" aria-hidden />, href: `mailto:?subject=${text}&body=${text}%0A${link}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied', { description: 'Paste it anywhere to share this article.' });
    } catch {
      toast.error('Could not copy the link', { description: url });
    }
  };
  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <div className={cn('flex items-center gap-2', vertical ? 'flex-col' : 'flex-wrap', className)}>
      <span className={cn('text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground', vertical ? 'mb-1' : 'mr-2')}>Share</span>
      {canShare && (
        <button type="button" onClick={nativeShare} aria-label="Share this article" className={button}>
          <Share2 className="size-4" aria-hidden />
        </button>
      )}
      <button type="button" onClick={copy} aria-label="Copy link to this article" className={button}>
        <Link2 className="size-4" aria-hidden />
      </button>
      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target={target.name === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          aria-label={target.name === 'email' ? 'Share this article by email' : `Share this article on ${target.name}`}
          className={button}
        >
          {target.icon}
        </a>
      ))}
    </div>
  );
}
