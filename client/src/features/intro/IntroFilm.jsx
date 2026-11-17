import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { INTRO, pickIntroSource } from '@/features/intro/introConfig';
import { useIntroStore } from '@/features/intro/introStore';
import { EASE_SILK } from '@/lib/motion';

/**
 * Full-screen AlphaFour intro film. On entry it takes over from the splash painted by index.html
 * (same first frame, same layout), plays once and fades into the site. "Skip intro" or Escape
 * enters the site at any time; the footer's "Play intro film" shows it again.
 */
export function IntroFilm() {
  const open = useIntroStore((s) => s.open);
  return createPortal(<AnimatePresence>{open && <IntroOverlay key="intro" />}</AnimatePresence>, document.body);
}

/** Runs `callback` after `ms` of visible time, so a background tab doesn't use up the wait. */
function visibleTimeout(callback, ms) {
  let id;
  const arm = (delay) => {
    id = setTimeout(() => (document.hidden ? arm(1000) : callback()), delay);
  };
  arm(ms);
  return () => clearTimeout(id);
}

function IntroOverlay() {
  const replay = useIntroStore((s) => s.replay);
  const close = useIntroStore((s) => s.close);
  const isPresent = useIsPresent();
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const barRef = useRef(null);
  const [src] = useState(pickIntroSource);
  const [status, setStatus] = useState('loading'); // loading | playing | blocked

  // While the film is up, the page underneath is inert and can't scroll. Both are released as soon
  // as the fade-out starts, so the site is usable while the film fades away.
  useEffect(() => {
    if (!isPresent) return undefined;
    const html = document.documentElement;
    const root = document.getElementById('root');
    document.getElementById('intro-splash')?.remove();
    html.setAttribute('data-intro', 'play');
    if (root) root.inert = true;
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      html.removeAttribute('data-intro');
      if (root) root.inert = false;
    };
  }, [isPresent]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    const video = videoRef.current;
    let frame = 0;
    let stopStall = () => {};
    let hold = 0;

    // React sets `muted` as a property only; some mobile browsers check the attribute for autoplay.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');

    const track = () => {
      if (video.duration && barRef.current) barRef.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
      frame = requestAnimationFrame(track);
    };
    // Never hold the visitor on a film that won't start or keeps buffering.
    const stall = () => {
      stopStall();
      stopStall = visibleTimeout(close, INTRO.startTimeoutMs);
    };
    const onPlaying = () => {
      stopStall();
      setStatus('playing');
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(track);
    };
    const onWaiting = () => {
      setStatus('loading');
      stall();
    };
    const onEnded = () => {
      cancelAnimationFrame(frame);
      if (barRef.current) barRef.current.style.transform = 'scaleX(1)';
      hold = setTimeout(close, INTRO.holdLastFrameMs);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', close);
    stall();
    video.play().catch((error) => {
      if (error.name === 'NotAllowedError') {
        // Autoplay refused (e.g. iOS Low Power Mode): wait for the visitor to press Play or Skip.
        stopStall();
        setStatus('blocked');
      } else if (error.name !== 'AbortError') {
        close();
      }
    });

    return () => {
      stopStall();
      clearTimeout(hold);
      cancelAnimationFrame(frame);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', close);
    };
  }, [close]);

  const playWithTap = () => {
    setStatus('loading');
    videoRef.current.play().catch(close);
  };

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={INTRO.title}
      aria-describedby="intro-film-note"
      tabIndex={-1}
      // 100vw rather than inset-x-0: it must also cover the scrollbar gutter reserved while the page is locked.
      className="fixed inset-y-0 left-0 z-[210] w-screen touch-none overflow-hidden overscroll-none bg-[#05070d] text-ivory outline-none print:hidden"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      initial={replay ? { opacity: 0 } : false}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_SILK } }}
      exit={{ opacity: 0, scale: 1.035, transition: { duration: 1.1, ease: EASE_SILK } }}
    >
      {/* .intro-media and .intro-spinner are defined in index.html, shared with the splash. */}
      <video
        ref={videoRef}
        className="intro-media"
        src={src}
        poster={INTRO.poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
      />

      <p id="intro-film-note" className="sr-only">
        A seven-second film introducing Alphafour Infrastructure Pvt Ltd. Press Skip intro or Escape to go straight to the site.
      </p>

      <AnimatePresence>
        {status === 'loading' && (
          <motion.span
            key="spinner"
            aria-hidden
            className="intro-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        )}
      </AnimatePresence>

      {status === 'blocked' && (
        <div className="absolute inset-0 grid place-items-center">
          <button
            type="button"
            onClick={playWithTap}
            className="group flex flex-col items-center gap-4 rounded-3xl p-4 text-[0.7rem] font-semibold uppercase tracking-[0.3em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="grid size-20 place-items-center rounded-full border border-gold/60 bg-navy/60 backdrop-blur-md transition-colors duration-300 group-hover:bg-gold group-hover:text-navy">
              <Play className="ml-1 size-7" aria-hidden />
            </span>
            Play intro
          </button>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex justify-end p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-navy/60 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ivory backdrop-blur-md transition-colors duration-300 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Skip intro <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-ivory/10">
        <div ref={barRef} className="h-full origin-left bg-gold-foil" style={{ transform: 'scaleX(0)' }} />
      </div>
    </motion.div>
  );
}
