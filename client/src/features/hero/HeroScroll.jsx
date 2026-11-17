import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoldRing } from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import {
  AUTOPLAY,
  BACKDROP,
  FRAMES,
  HEADLINES,
  HERO_MEDIA,
  LOADING,
  MOBILE_QUERY,
  PARALLAX,
  RING,
  RING_COPY,
  RING_IMAGES,
  SCROLL_FEEL,
  SCRUB_SMOOTHING,
  TRANSITION,
} from '@/features/hero/heroConfig';
import { buildStoryline } from '@/features/hero/storyline';
import { frameUrl, useFrameSequence } from '@/features/hero/useFrameSequence';
import { useIntroStore } from '@/features/intro/introStore';
import { prefersReducedMotion } from '@/lib/device';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { scrollToTarget, useLenis } from '@/providers/SmoothScrollProvider';
import { useUiStore } from '@/store/ui';

const HeroScene3D = lazy(() => import('@/features/hero/HeroScene3D'));

const ringCaption = (image) => RING.captions[image.file] ?? image.caption;
const pad2 = (n) => String(n).padStart(2, '0');
const clamp01 = gsap.utils.clamp(0, 1);

/** Keys the browser scrolls the page with. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
/** Scroll distance (fraction of the pinned scroll, a few pixels) that counts as the page having moved. */
const NUDGE = 0.0005;

/** Ring images in RING.order; anything not listed follows alphabetically. */
const ORDERED_RING = (() => {
  const rank = (file) => {
    const i = RING.order.indexOf(file);
    return i < 0 ? RING.order.length : i;
  };
  return [...RING_IMAGES].sort((a, b) => rank(a.file) - rank(b.file) || a.file.localeCompare(b.file));
})();

/** Renders a headline title with its `emphasis` word in gold italics. */
function Title({ headline }) {
  const { title, emphasis } = headline;
  const at = emphasis ? title.indexOf(emphasis) : -1;
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <em className="text-gold-foil animate-shimmer pr-2 italic">{emphasis}</em>
      {title.slice(at + emphasis.length)}
    </>
  );
}

function HeadlineCopy({ headline, index }) {
  const Heading = index === 0 ? 'h1' : 'h2';
  return (
    <>
      <p className="flex items-center gap-3 text-micro uppercase text-gold">
        <span aria-hidden className="h-px w-8 bg-gold/80" />
        {headline.kicker}
      </p>
      <Heading
        className={cn(
          'mt-4 text-balance font-display font-light leading-[0.95] tracking-[-0.02em] drop-shadow-[0_4px_30px_rgba(11,22,48,.55)]',
          index === 0 ? 'text-display-2xl' : 'text-display-xl',
        )}
      >
        <Title headline={headline} />
      </Heading>
      <p className="mt-5 max-w-md text-base text-ivory/80 sm:text-lg">{headline.body}</p>
    </>
  );
}

function RingActions({ source }) {
  const openDialog = useUiStore((s) => s.openDialog);
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button size="lg" onClick={() => openDialog('site-visit', { residence: 'Alphafour Infrastructure', source })}>
        Book a site visit
      </Button>
      <Button asChild size="lg" variant="outline-light">
        <Link to="/residences">Explore projects</Link>
      </Button>
    </div>
  );
}

/**
 * Home hero: one pinned scroll story. The AlphaFour film scrubs on a canvas, blending neighbouring
 * frames so it glides at any scroll speed, with a soft push-in, light leak and headline dissolve
 * at each scene change; then the project images turn once around a ring in the sky.
 * While nobody is scrolling, the film plays by itself in slow motion.
 * Reduced motion gets a still version.
 */
export function HeroScroll() {
  const [still] = useState(prefersReducedMotion);
  return still ? <HeroStill /> : <HeroScrub />;
}

function HeroScrub() {
  const [device] = useState(() => (window.matchMedia(MOBILE_QUERY).matches ? 'mobile' : 'desktop'));
  const isMobile = device === 'mobile';
  const set = FRAMES[device];
  const [ringImages] = useState(() => (isMobile ? ORDERED_RING.slice(0, RING.mobileCount) : ORDERED_RING));
  const story = useMemo(() => buildStoryline(set), [set]);

  const introOpen = useIntroStore((s) => s.open);
  const lenis = useLenis();

  const sectionRef = useRef(null);
  const driftRef = useRef(null);
  const zoomRef = useRef(null);
  const canvasRef = useRef(null);
  const backdropRef = useRef(null);
  const dimRef = useRef(null);
  const glowRef = useRef(null);
  const vignetteRef = useRef(null);
  const dipRef = useRef(null);
  const copyRef = useRef(null);
  const headRefs = useRef([]);
  const sceneLayerRef = useRef(null);
  const ringLayerRef = useRef(null);
  const ringCopyRef = useRef(null);
  const barRef = useRef(null);
  const pillRef = useRef(null);
  const cueRef = useRef(null);

  // Mutable state the timeline writes and the 3D layer reads every frame (no React renders while scrolling).
  const scene = useRef({ ring: { turn: 0, visible: 0 } }).current;

  const [sceneMounted, setSceneMounted] = useState(false);
  const [sceneLive, setSceneLive] = useState(false);
  const [focus, setFocus] = useState(0);

  // The film's frames start loading once the entry intro film is gone, so the film keeps the bandwidth.
  const frames = useFrameSequence(canvasRef, set, { enabled: !introOpen, cacheSize: LOADING.decodedCache[device], blend: LOADING.blendFrames });
  const { render, isBuffered } = frames;

  // Once the film has faded in over them, the poster and its blurred placeholder are hidden, so the
  // browser stops compositing two full-screen layers nobody can see under every frame of the film.
  const [posterHidden, setPosterHidden] = useState(false);
  useEffect(() => {
    if (!frames.ready) return undefined;
    const timer = setTimeout(() => setPosterHidden(true), 900);
    return () => clearTimeout(timer);
  }, [frames.ready]);

  // What the playhead reads every tick from outside the timeline, without rebuilding it.
  const latest = useRef({ lenis: null, ready: false });
  useEffect(() => {
    latest.current = { lenis, ready: frames.ready };
  }, [lenis, frames.ready]);

  useGSAP(
    () => {
      const S = story;
      const heads = headRefs.current;
      const frameState = { frame: 0 };
      const blurred = `blur(${TRANSITION.textBlur}px)`;
      let drawn = -1;
      let chapter = '';
      let live = false;
      let mounted = false;
      // The ring is only ever reached by scrolling (autoplay loops before it), so its 3D layer is set up
      // once the visitor starts scrolling: never while the film plays by itself, where it made it stutter.
      const mountScene = () => {
        if (mounted) return;
        mounted = true;
        setSceneMounted(true);
      };
      // Blending between frames reads as motion while scrolling; at rest, ease onto the nearest whole frame so the picture is crisp.
      const settle = { amount: 0 };
      let settleTween = null;
      let idleTimer = 0;

      // Sought by the playhead below, which follows the scroll or plays the film by itself.
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: tick });
      // Exactly 1 unit long, so timeline time === pinned scroll progress.
      timeline.to({}, { duration: 1 }, 0);

      // ── Film: one continuous scrub, a slow parallax drift under the copy ──
      timeline.to(frameState, { frame: S.last, duration: S.filmEnd }, 0);
      timeline.fromTo(driftRef.current, { scale: 1 }, { scale: PARALLAX.canvasScale, duration: S.filmEnd }, 0);
      timeline.fromTo(copyRef.current, { yPercent: 0 }, { yPercent: PARALLAX.copyVh, duration: S.filmEnd }, 0);
      gsap.set(heads.slice(1), { opacity: 0, y: 40, filter: blurred });

      // ── Scene changes: push in and settle, a vignette closes and opens, a warm light leak drifts across,
      //    and the headlines dissolve through a blur. All transform/opacity, so the picture stays sharp. ──
      const bounds = [0, ...set.cutFrames, S.last];
      set.cutFrames.forEach((cut, k) => {
        const at = S.pOfFrame(cut);
        const half = TRANSITION.window * Math.min(at - S.pOfFrame(bounds[k]), S.pOfFrame(bounds[k + 2]) - at);
        const side = k % 2 === 0 ? 1 : -1;
        timeline
          .to(zoomRef.current, { scale: TRANSITION.zoom, duration: half, ease: 'sine.inOut' }, at - half)
          .to(zoomRef.current, { scale: 1, duration: half, ease: 'sine.inOut' }, at)
          .to(vignetteRef.current, { opacity: TRANSITION.vignette, duration: half, ease: 'sine.inOut' }, at - half)
          .to(vignetteRef.current, { opacity: 0, duration: half, ease: 'sine.inOut' }, at)
          .fromTo(glowRef.current, { xPercent: -18 * side }, { xPercent: 18 * side, duration: half * 2, immediateRender: false }, at - half)
          .to(glowRef.current, { opacity: TRANSITION.glow, duration: half, ease: 'sine.in' }, at - half)
          .to(glowRef.current, { opacity: 0, duration: half, ease: 'sine.out' }, at)
          .to(heads[k], { opacity: 0, y: -40, filter: blurred, duration: half, ease: 'power2.in' }, at - half)
          .fromTo(
            heads[k + 1],
            { opacity: 0, y: 40, filter: blurred },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: half * 1.1, ease: 'power3.out', immediateRender: false },
            at + half * 0.1,
          );
      });
      const outro = 30 / S.totalVh;
      timeline.to(heads[heads.length - 1], { opacity: 0, y: -40, filter: blurred, duration: outro, ease: 'power2.in' }, S.ringStart - outro);

      // ── Ring: dissolve the last frame into a pre-blurred copy (no live blur), bring the sky in, turn exactly once ──
      const intro = 40 / S.totalVh;
      timeline
        .to(backdropRef.current, { opacity: 1, duration: intro, ease: 'power1.inOut' }, S.ringStart)
        .to(dimRef.current, { opacity: 1 - BACKDROP.brightness, duration: intro, ease: 'power1.inOut' }, S.ringStart)
        .fromTo(scene.ring, { visible: 0 }, { visible: 1, duration: intro, ease: 'power1.out', immediateRender: false }, S.ringStart + intro * 0.1)
        .fromTo(ringCopyRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: intro, ease: 'power2.out' }, S.ringStart + intro * 0.4)
        // sine.inOut eases in while the ring appears and settles onto the first image at the unpin.
        .fromTo(scene.ring, { turn: 0 }, { turn: 1, duration: 1 - S.ringStart, ease: 'sine.inOut', immediateRender: false }, S.ringStart);

      function tick() {
        const progress = timeline.progress();
        const frame = frameState.frame;
        if (Math.abs(frame - drawn) > 0.005) {
          drawn = frame;
          settleTween?.kill();
          render(frame);
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            const whole = Math.round(frame);
            if (whole === frame) return;
            settle.amount = 0;
            settleTween = gsap.to(settle, {
              amount: 1,
              duration: 0.35,
              ease: 'sine.out',
              onUpdate: () => render(frame + (whole - frame) * settle.amount),
            });
          }, 120);
        }
        barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;

        const visible = scene.ring.visible;
        sceneLayerRef.current.style.opacity = visible.toFixed(3);
        sceneLayerRef.current.style.visibility = visible > 0.001 ? 'visible' : 'hidden';
        ringLayerRef.current.style.opacity = visible.toFixed(3);
        ringLayerRef.current.style.visibility = visible > 0.001 ? 'visible' : 'hidden';

        const nextChapter =
          progress >= S.ringStart ? 'Projects' : `${pad2(set.cutFrames.filter((cut) => frame >= cut).length + 1)} / ${pad2(HEADLINES.length)}`;
        if (nextChapter !== chapter) {
          chapter = nextChapter;
          pillRef.current.textContent = chapter;
        }

        // Safety net for a jump straight to the ring; run its render loop only while the ring is near.
        if (progress >= S.ringStart - 0.08) mountScene();
        const nextLive = progress > S.ringStart - 0.01;
        if (nextLive !== live) {
          live = nextLive;
          setSceneLive(live);
        }
      }
      tick();

      // ── Playhead: where the story is. It follows the scroll, smoothed; once the page has been still
      //    for a moment it runs ahead by itself, leaving the page where it is (the nav and the rest of
      //    the site see no scrolling). When the visitor scrolls again the page first moves to the frame
      //    on screen, invisibly behind the sticky hero, so the film carries on from there. ──
      const pin = ScrollTrigger.create({ trigger: sectionRef.current, start: 'top top', end: 'bottom bottom' });
      const scrolled = () => clamp01((window.scrollY - pin.start) / (pin.end - pin.start));
      const blocked = () => document.hidden || latest.current.lenis?.isStopped || document.body.hasAttribute('data-scroll-locked');

      const pace = (AUTOPLAY.speed * S.filmEnd) / HERO_MEDIA.sequenceDuration; // timeline progress per second
      const dipSpan = AUTOPLAY.loopFade * pace;
      const catchUp = SCRUB_SMOOTHING / 4.6; // time constant: 99% of the way there in SCRUB_SMOOTHING seconds
      const cueSpan = S.filmEnd * 0.05;
      // Autoplay ends where the last headline starts to leave, so it stays up over the closing shot.
      const playEnd = S.ringStart - outro;

      let position = scrolled();
      let shown = 0;
      let lastScroll = position;
      let lastInput = -Infinity;
      let touching = false;
      let playing = false;
      let anchor = 0; // scroll position autoplay started from: the page moving away from it ends autoplay
      let speed = 0;
      let looped = false;
      let dip = 0;
      let cue = '';

      const handBack = () => {
        playing = false;
        if (dip > 0) gsap.to(dipRef.current, { opacity: 0, duration: 0.35, ease: 'sine.out' });
        dip = 0;
      };

      const onInput = () => {
        if (blocked()) return;
        mountScene();
        lastInput = performance.now();
        if (!playing) return;
        handBack();
        scrollToTarget(latest.current.lenis, pin.start + position * (pin.end - pin.start), { offset: 0, immediate: true });
      };
      const onKey = (event) => {
        if (SCROLL_KEYS.has(event.key)) onInput();
      };
      const onTouchStart = () => {
        touching = true;
        onInput();
      };
      const onTouchEnd = () => {
        touching = false;
        lastInput = performance.now();
      };

      function play(dt) {
        const running = !blocked() && isBuffered((position / S.filmEnd) * S.last);
        speed += ((running ? 1 : 0) - speed) * (1 - Math.exp((-dt * 3) / AUTOPLAY.easeIn));
        position += pace * speed * dt;

        // At the top of the page the film loops, through a dip to dark. Further down it holds its
        // closing shot: looping there would send the next scroll back up through what was just passed.
        const loops = anchor < NUDGE;
        if (position >= playEnd) {
          position = loops ? 0 : playEnd;
          looped = loops;
        }
        if (!loops) return;
        const nextDip = Math.max(clamp01((position - (playEnd - dipSpan)) / dipSpan), looped ? 1 - clamp01(position / dipSpan) : 0);
        if (nextDip !== dip) {
          dip = nextDip;
          dipRef.current.style.opacity = dip.toFixed(3);
        }
      }

      function advance(_time, deltaMs) {
        const dt = Math.min(deltaMs, 100) / 1000; // no leap after the tab was in the background
        const now = performance.now();
        const scroll = scrolled();

        // Scrollbar drags, Skip intro and anchor links move the page without passing through onInput.
        if (playing && Math.abs(scroll - anchor) > NUDGE) handBack();

        if (!playing) {
          if (scroll !== lastScroll) lastInput = now;
          // Scrollbar drags and pages restored mid-hero scroll without passing through onInput.
          if (scroll > NUDGE) mountScene();
          const gap = scroll - position;
          position = Math.abs(gap) < 1e-5 ? scroll : position + gap * (1 - Math.exp(-dt / catchUp));
          const rested = !touching && Math.abs(gap) < NUDGE && now - lastInput > AUTOPLAY.resumeDelay * 1000;
          if (rested && latest.current.ready && position < playEnd && !blocked()) {
            playing = true;
            anchor = scroll;
            speed = 0;
            looped = false;
          }
        }
        lastScroll = scroll;

        if (playing) play(dt);

        if (position !== shown) {
          shown = position;
          timeline.progress(position);
        }

        // The scroll cue answers to the real scroll: it stays up while the film plays by itself.
        const nextCue = (1 - clamp01(scroll / cueSpan)).toFixed(2);
        if (nextCue !== cue) {
          cue = nextCue;
          cueRef.current.style.opacity = cue;
        }
      }

      gsap.ticker.add(advance);
      // Capture phase: the page must be on the film's frame before Lenis adds this wheel's distance to it.
      window.addEventListener('wheel', onInput, { capture: true, passive: true });
      window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
      window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });
      window.addEventListener('keydown', onKey, { capture: true });

      return () => {
        gsap.ticker.remove(advance);
        window.removeEventListener('wheel', onInput, { capture: true });
        window.removeEventListener('touchstart', onTouchStart, { capture: true });
        window.removeEventListener('touchend', onTouchEnd, { capture: true });
        window.removeEventListener('touchcancel', onTouchEnd, { capture: true });
        window.removeEventListener('keydown', onKey, { capture: true });
        clearTimeout(idleTimer);
        settleTween?.kill();
      };
    },
    { scope: sectionRef, dependencies: [set, render, isBuffered, story] },
  );

  // Slower, heavier scrolling while the hero is on screen; the site's normal feel everywhere else.
  useEffect(() => {
    if (!lenis) return undefined;
    const virtual = lenis.virtualScroll?.options;
    const base = { wheel: virtual?.wheelMultiplier, touch: virtual?.touchMultiplier, lerp: lenis.options.lerp };
    const apply = (inHero) => {
      if (virtual) {
        virtual.wheelMultiplier = inHero ? SCROLL_FEEL.wheelMultiplier : base.wheel;
        virtual.touchMultiplier = inHero ? SCROLL_FEEL.touchMultiplier : base.touch;
      }
      lenis.options.lerp = inHero ? SCROLL_FEEL.lerp : base.lerp;
    };
    const trigger = ScrollTrigger.create({ trigger: sectionRef.current, start: 'top bottom', end: 'bottom 40%', onToggle: (self) => apply(self.isActive) });
    apply(trigger.isActive);
    return () => {
      trigger.kill();
      apply(false);
    };
  }, [lenis]);

  // Pause the 3D render loop while the hero is fully scrolled past.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const onFocus = useCallback((index) => setFocus(index), []);

  const skip = () => {
    const el = sectionRef.current;
    const end = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight;
    scrollToTarget(lenis, end, { offset: 0 });
  };

  const poster = isMobile ? HERO_MEDIA.posterMobile : HERO_MEDIA.poster;

  return (
    <section
      ref={sectionRef}
      id="top"
      data-tone="dark"
      data-nav-dark
      aria-label="Alphafour Infrastructure film and projects"
      className="relative bg-navy"
      style={{ height: `${story.totalVh}vh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden text-ivory">
        {/* Film layer: only ever scaled up, so it needs no overscan and is drawn at screen resolution */}
        <div ref={driftRef} aria-hidden className="absolute inset-0 will-change-transform">
          <div ref={zoomRef} className="absolute inset-0 will-change-transform">
            <div className={cn('absolute inset-0 scale-110 bg-cover bg-center blur-2xl', posterHidden && 'invisible')} style={{ backgroundImage: `url("${HERO_MEDIA.placeholder}")` }} />
            <img src={poster} alt="" fetchpriority="high" decoding="async" className={cn('absolute inset-0 size-full object-cover', posterHidden && 'invisible')} />
            <canvas
              ref={canvasRef}
              className={cn('absolute inset-0 size-full transition-opacity duration-700', frames.ready ? 'opacity-100' : 'opacity-0')}
            />
            {/* The last frame, blurred once by the browser: the ring's backdrop fades to it instead of blurring the canvas live */}
            <img
              ref={backdropRef}
              src={frameUrl(set, set.count - 1)}
              alt=""
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0"
              style={{ filter: `blur(${BACKDROP.blur}px)`, transform: `scale(${BACKDROP.scale})` }}
            />
            <div ref={dimRef} className="absolute inset-0 bg-[#05070d] opacity-0" />
          </div>
        </div>

        {/* Scene-change light leak and vignette */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[-25%] z-[2] w-[150%] opacity-0 mix-blend-screen will-change-transform"
          style={{
            background:
              'radial-gradient(45% 60% at 50% 55%, rgba(255,214,160,.55) 0%, rgba(255,176,96,.22) 40%, transparent 72%), linear-gradient(100deg, transparent 30%, rgba(255,236,200,.18) 50%, transparent 70%)',
          }}
        />
        <div
          ref={vignetteRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] opacity-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(5,7,13,.9) 100%)' }}
        />

        {/* 3D layer: the project ring in the sky */}
        <div ref={sceneLayerRef} className="invisible absolute inset-0 z-[1] opacity-0">
          {sceneMounted && (
            <Suspense fallback={null}>
              <HeroScene3D state={scene} live={sceneLive && inView} isMobile={isMobile} ringImages={ringImages} onFocus={onFocus} />
            </Suspense>
          )}
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-40 bg-gradient-to-b from-navy/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-80 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent" />

        {/* Per-scene headlines (real text), stacked and crossfaded by the timeline */}
        <div ref={copyRef} className="pointer-events-none absolute inset-0 z-[4] will-change-transform">
          <div className="absolute bottom-28 left-0 grid max-w-[min(44rem,92vw)] px-5 sm:bottom-32 sm:px-10 lg:px-16">
            {HEADLINES.map((headline, index) => (
              <div
                key={headline.title}
                ref={(el) => {
                  headRefs.current[index] = el;
                }}
                className="[grid-area:1/1] will-change-transform"
              >
                <HeadlineCopy headline={headline} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* The dip to dark as autoplay loops: over the film and its headline, under the controls */}
        <div ref={dipRef} aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[#05070d] opacity-0" />

        {/* Ring copy and actions */}
        <div ref={ringLayerRef} className="invisible absolute inset-0 z-[4] opacity-0">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_40%,rgba(5,8,18,.7)_100%)]" />
          <div ref={ringCopyRef} className="pointer-events-none absolute inset-x-0 top-24 px-5 text-center sm:top-28">
            <p className="flex items-center justify-center gap-3 text-micro uppercase text-gold">
              <span aria-hidden className="h-px w-8 bg-gold/80" /> {RING_COPY.kicker} <span aria-hidden className="h-px w-8 bg-gold/80" />
            </p>
            <h2 className="mt-4 text-balance font-display text-display-lg font-light drop-shadow-[0_4px_30px_rgba(11,22,48,.6)]">{RING_COPY.title}</h2>
          </div>
          <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-6 px-5 text-center sm:bottom-28">
            <p aria-live="polite" className="pointer-events-none min-h-[1.75rem] font-display text-2xl italic text-ivory drop-shadow-[0_2px_16px_rgba(5,7,13,.9)] sm:text-3xl">
              {ringCaption(ringImages[focus] ?? ringImages[0])}
            </p>
            <RingActions source="hero/ring" />
          </div>
          {/* Captions as text for screen readers and search engines */}
          <ul className="sr-only">
            {ringImages.map((image) => (
              <li key={image.file}>{ringCaption(image)}</li>
            ))}
          </ul>
        </div>

        {/* Scroll cue */}
        <div ref={cueRef} aria-hidden className="pointer-events-none absolute bottom-28 right-6 z-[4] hidden flex-col items-center gap-3 transition-opacity duration-500 sm:flex lg:right-1/2 lg:translate-x-1/2">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-ivory/80">Scroll to explore</span>
          <span className="relative h-12 w-px overflow-hidden bg-ivory/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gold" />
          </span>
        </div>

        {/* Bottom bar: chapter, skip, progress */}
        <div className="absolute inset-x-0 bottom-0 z-[5] px-5 pb-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 pr-16 sm:pr-20">
            <p ref={pillRef} aria-hidden className="glass-dark rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] tabular-nums">
              01 / {pad2(HEADLINES.length)}
            </p>
            <button
              type="button"
              onClick={skip}
              className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-gold hover:text-gold"
            >
              Skip intro <ArrowDown className="size-3.5" aria-hidden />
            </button>
          </div>
          <div aria-hidden className="mt-4 h-px w-full bg-ivory/15">
            <div ref={barRef} className="h-px origin-left bg-gold-foil" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>

        {!introOpen && !frames.ready && (
          <div className="absolute right-5 top-24 z-[5] sm:right-10 lg:right-16">
            <GoldRing progress={Math.max(8, frames.progress)} size={48} label="Loading film" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Reduced motion: no pin, no scrub. The poster fades in, the story reads as text, the ring is a row. */
function HeroStill() {
  const [isMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [first, ...rest] = HEADLINES;
  return (
    <section id="top" data-tone="dark" data-nav-dark className="relative isolate overflow-hidden bg-navy text-ivory">
      <div className="relative flex min-h-[100svh] items-end">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl" style={{ backgroundImage: `url("${HERO_MEDIA.placeholder}")` }} />
          <img
            src={isMobile ? HERO_MEDIA.posterMobile : HERO_MEDIA.poster}
            alt=""
            fetchpriority="high"
            className="absolute inset-0 size-full object-cover duration-1000 animate-in fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/25" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-40 sm:px-6 lg:px-8">
          <HeadlineCopy headline={first} index={0} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-gold/20 bg-gold/20 sm:grid-cols-3">
            {rest.map((headline) => (
              <li key={headline.title} className="bg-navy/80 p-5 backdrop-blur">
                <p className="text-micro uppercase text-gold">{headline.kicker}</p>
                <h2 className="mt-2 font-display text-2xl">{headline.title}</h2>
                <p className="mt-2 text-sm text-ivory/75">{headline.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <p className="text-micro uppercase text-gold">{RING_COPY.kicker}</p>
        <h2 className="mt-3 font-display text-display-lg font-light">{RING_COPY.title}</h2>
        <ul className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {ORDERED_RING.map((image) => (
            <li key={image.file} className="w-72 shrink-0 snap-start sm:w-80">
              <img
                src={image.mobile}
                srcSet={`${image.mobile} 800w, ${image.desktop} 1280w`}
                sizes="20rem"
                alt={ringCaption(image)}
                loading="lazy"
                decoding="async"
                width={800}
                height={533}
                className="aspect-[3/2] w-full rounded-2xl object-cover"
              />
              <p className="mt-3 font-display text-xl italic">{ringCaption(image)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <RingActions source="hero/still" />
        </div>
      </div>
    </section>
  );
}
