import { Heart, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Magnetic } from '@/components/effects/Magnetic';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { mainNav, site } from '@/config/site';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';
import { useUiStore } from '@/store/ui';

/** Tracks scroll state and whether the bar sits over a dark hero ([data-nav-dark]). */
function useNavState(threshold = 24) {
  const [state, setState] = useState({ scrolled: false, overDark: true });
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY > threshold;
      const overDark = [...document.querySelectorAll('[data-nav-dark]')].some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= 40 && rect.bottom >= 40;
      });
      setState((prev) => (prev.scrolled === scrolled && prev.overDark === overDark ? prev : { scrolled, overDark }));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const interval = setInterval(update, 800);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, [threshold]);
  return state;
}

export function Navbar() {
  const { scrolled, overDark } = useNavState();
  const { pathname } = useLocation();
  const lenis = useLenis();
  const { count } = useFavorites();
  const openDialog = useUiStore((s) => s.openDialog);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Links to the page already on screen scroll instead of navigating: Home goes back to the top.
  const onNavLink = (event, href) => {
    if (pathname !== '/') return;
    const [path, hash] = href.split('#');
    if (hash && (path === '' || path === '/')) {
      event.preventDefault();
      scrollToTarget(lenis, `#${hash}`, { offset: -80 });
      window.history.replaceState(null, '', `/#${hash}`);
    } else if (href === '/') {
      event.preventDefault();
      scrollToTarget(lenis, 0, { offset: 0 });
    }
  };

  const darkGlass = scrolled && overDark;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[80] transition-[background-color,color,box-shadow,backdrop-filter] duration-700 ease-luxe print:hidden',
        !scrolled && 'bg-gradient-to-b from-navy/55 to-transparent text-ivory',
        darkGlass && 'border-b border-gold/15 bg-navy/45 text-ivory backdrop-blur-xl',
        scrolled &&
          !darkGlass &&
          'border-b border-gold/15 bg-ivory/75 text-charcoal shadow-[0_8px_30px_-18px_rgba(11,22,48,.35)] backdrop-blur-xl dark:bg-navy/75 dark:text-ivory',
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8 xl:gap-6">
        <Link to="/" aria-label={`${site.name}, home`} className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop shows every page as a link; below lg the menu button opens MobileMenu. */}
        <ul className="hidden items-center lg:flex xl:gap-1">
          {mainNav.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                onClick={(e) => onNavLink(e, item.href)}
                className={({ isActive }) =>
                  cn(
                    // Tighter between 1024 and 1279px so all seven links and the buttons fit; the full spacing returns at xl.
                    'inline-flex h-10 items-center whitespace-nowrap rounded-full px-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-gold xl:px-4 xl:text-[0.72rem] xl:tracking-[0.18em]',
                    isActive && !item.href.includes('#') && 'text-gold',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/residences?saved=1"
            aria-label={`Saved projects (${count})`}
            className="relative hidden size-10 items-center justify-center rounded-full transition-colors hover:text-gold sm:inline-flex"
          >
            <Heart className="size-[1.1rem]" aria-hidden />
            {count > 0 && (
              <span className="absolute right-1 top-1 inline-flex size-4 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <Magnetic className="hidden sm:inline-block">
            <Button size="sm" onClick={() => openDialog('enquiry', { source: 'navbar' })}>
              Enquire
            </Button>
          </Magnetic>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-full border border-current/20 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} onNavLink={onNavLink} />
    </header>
  );
}
