import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { SocialIcon } from '@/components/common/SocialIcons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { mainNav, site } from '@/config/site';
import { EASE_LUXE } from '@/lib/motion';
import { useUiStore } from '@/store/ui';

export function MobileMenu({ open, onOpenChange, onNavLink }) {
  const openDialog = useUiStore((s) => s.openDialog);

  const go = (event, href) => {
    onNavLink(event, href);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="flex flex-col bg-royal-night text-ivory">
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <DialogDescription className="sr-only">Site navigation and contact options</DialogDescription>
        <Logo className="text-ivory" />
        <nav aria-label="Mobile" className="mt-12 flex-1">
          <ul className="space-y-1">
            {mainNav.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE_LUXE, delay: 0.05 * i }}
              >
                <Link to={item.href} onClick={(e) => go(e, item.href)} className="block py-2 font-display text-4xl transition-colors hover:text-gold">
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="space-y-4 border-t border-gold/20 pt-6">
          <Button
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              openDialog('site-visit', { source: 'mobile-menu' });
            }}
          >
            Book a private viewing
          </Button>
          <div className="flex flex-col gap-2 text-sm text-ivory/80">
            <a href={site.contact.phoneHref} className="inline-flex items-center gap-2 hover:text-gold">
              <Phone className="size-4 text-gold" aria-hidden /> {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Mail className="size-4 text-gold" aria-hidden /> {site.contact.email}
            </a>
          </div>
          <div className="flex gap-3">
            {Object.entries(site.social).map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} className="inline-flex size-10 items-center justify-center rounded-full border border-gold/30 hover:bg-gold/15">
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
