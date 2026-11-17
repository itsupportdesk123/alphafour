import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to navy & gold dark theme'}
      aria-pressed={dark}
      className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-full transition-colors hover:text-gold"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.35 }}
        >
          {dark ? <Sun className="size-[1.1rem]" aria-hidden /> : <Moon className="size-[1.1rem]" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
