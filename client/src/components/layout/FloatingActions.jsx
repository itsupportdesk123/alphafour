import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, PhoneCall } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SocialIcon } from '@/components/common/SocialIcons';
import { Tooltip } from '@/components/ui/tooltip';
import { whatsappUrl } from '@/config/site';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';
import { useUiStore } from '@/store/ui';

const fab =
  'inline-flex size-11 items-center sm:size-12 justify-center rounded-full border border-gold/40 bg-navy/90 text-champagne shadow-luxe backdrop-blur-md transition-all duration-500 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold';

/** WhatsApp, call-back and back-to-top, stacked bottom-right. */
export function FloatingActions() {
  const lenis = useLenis();
  const openDialog = useUiStore((s) => s.openDialog);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <aside aria-label="Quick contact" className="fixed bottom-5 right-4 z-[75] flex flex-col items-center gap-3 print:hidden sm:bottom-8 sm:right-6">
      <AnimatePresence>
        {showTop && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <Tooltip content="Back to top" side="left">
              <button type="button" aria-label="Back to top" className={fab} onClick={() => scrollToTarget(lenis, 0, { offset: 0 })}>
                <ArrowUp className="size-5" aria-hidden />
              </button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip content="Request a call-back" side="left">
        <button type="button" aria-label="Request a call-back" className={fab} onClick={() => openDialog('callback', { source: 'floating-button' })}>
          <PhoneCall className="size-5" aria-hidden />
        </button>
      </Tooltip>
      <Tooltip content="Chat on WhatsApp" side="left">
        <a href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="Chat with our concierge on WhatsApp" className={`${fab} relative`}>
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-gold/60" />
          <SocialIcon name="whatsapp" className="size-5" />
        </a>
      </Tooltip>
    </aside>
  );
}
