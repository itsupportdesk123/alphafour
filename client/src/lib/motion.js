/** Motion language: slow, confident, never bouncy. */
export const EASE_LUXE = [0.22, 1, 0.36, 1];
export const EASE_SILK = [0.65, 0, 0.35, 1];

export const viewportOnce = { once: true, margin: '0px 0px -12% 0px' };

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_LUXE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE_LUXE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE_LUXE } },
};

export const maskReveal = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.2, ease: EASE_LUXE } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});
