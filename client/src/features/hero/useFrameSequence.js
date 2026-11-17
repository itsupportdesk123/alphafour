import { useCallback, useEffect, useRef, useState } from 'react';
import { LOADING } from '@/features/hero/heroConfig';

export const frameUrl = (set, index) => `${set.path}${String(index + 1).padStart(set.pad, '0')}${set.ext}`;

/** Blend levels between two neighbouring frames: fine enough to be invisible, coarse enough to skip redundant repaints. */
const BLEND_STEPS = 32;

/**
 * Download order: first and last frame, then coarse to fine (every 128th, 64th, … frame), so a
 * frame close to any scroll position is available early and the gaps fill in behind it. The worker
 * takes the frames right after the playhead ahead of this order (LOADING.lookahead).
 */
function loadOrder(count) {
  const seen = new Uint8Array(count);
  const order = [];
  const push = (i) => {
    if (!seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  for (let step = 2 ** Math.floor(Math.log2(count)); step >= 1; step /= 2) {
    for (let i = 0; i < count; i += step) push(i);
  }
  return order;
}

/**
 * Streams a frame sequence and paints a (fractional) position in it to a canvas with cover-fit and
 * capped DPR. With `blend`, position 41.25 draws frame 41 with frame 42 dissolved in at 25%, so the
 * picture glides between frames instead of stepping, however slowly the page scrolls.
 *
 * With createImageBitmap, every frame is kept as a compressed Blob and only a small window around
 * the playhead is decoded (decoding off the main thread); otherwise frames are <img> elements and
 * the browser manages their decoded memory. A frame that isn't in yet is stood in for by the
 * nearest one that is, so scrubbing never blanks or blocks.
 *
 * Returns { ready, progress, render(position), isBuffered(position) }. `ready` turns true once
 * LOADING.readyFraction of the frames are loaded and the first paint has happened. render() is cheap
 * and safe to call every tick. isBuffered() says whether the next frame has arrived, so autoplay can
 * wait for it the way a video buffers instead of stepping across stand-in frames.
 */
export function useFrameSequence(canvasRef, set, { enabled = true, cacheSize = 28, blend = true } = {}) {
  const [status, setStatus] = useState({ ready: false, progress: 0 });
  const controller = useRef(null);
  const requested = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !set || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: false });
    const count = set.count;
    const useBitmaps = typeof createImageBitmap === 'function';
    const blobs = new Array(count).fill(null);
    const images = new Array(count).fill(null);
    const loaded = new Uint8Array(count);
    const finished = new Uint8Array(count); // loaded or failed: nothing more is coming for this frame
    const bitmaps = new Map(); // index → ImageBitmap, oldest first (LRU)
    const decoding = new Map(); // index → Promise
    const abort = new AbortController();
    let disposed = false;
    let done = 0;
    let bytes = 0;
    let painted = -1; // the frame on screen, or base + blend for a blended pair
    let shown = [-1, -1]; // frames the current picture is drawn from: never evicted
    let ready = false;
    let lastReported = -1;
    let direction = 1;
    let previousRequest = 0;
    let cover = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, LOADING.maxDpr);
      let width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      let height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      // Never draw more pixels than a frame has. Past its own resolution the browser's upscale of the
      // canvas looks the same, and every draw costs a fraction (on a 2x screen, about a third).
      const over = Math.max(width / set.width, height / set.height);
      if (over > 1) {
        width = Math.max(1, Math.round(width / over));
        height = Math.max(1, Math.round(height / over));
      }
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const scale = Math.max(width / set.width, height / set.height);
      const w = set.width * scale;
      const h = set.height * scale;
      cover = { x: (width - w) / 2, y: (height - h) / 2, w, h };
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const repaint = painted >= 0;
      painted = -1;
      if (repaint) draw(requested.current);
    };

    /** A frame ready to draw now, or null (not loaded, or not decoded yet). */
    function source(index) {
      if (!loaded[index]) return null;
      return useBitmaps ? (bitmaps.get(index) ?? null) : images[index];
    }

    function nearestLoaded(index) {
      if (loaded[index]) return index;
      for (let d = 1; d < count; d += 1) {
        if (index - d >= 0 && loaded[index - d]) return index - d;
        if (index + d < count && loaded[index + d]) return index + d;
      }
      return -1;
    }

    function remember(index, bitmap) {
      bitmaps.delete(index);
      bitmaps.set(index, bitmap);
      while (bitmaps.size > cacheSize) {
        // Evict the least recently used frame, but never the one on screen (resize repaints it).
        let victim = -1;
        for (const key of bitmaps.keys()) {
          if (key !== shown[0] && key !== shown[1]) {
            victim = key;
            break;
          }
        }
        if (victim < 0) break;
        bitmaps.get(victim).close?.();
        bitmaps.delete(victim);
      }
    }

    function decode(index) {
      if (!useBitmaps || bitmaps.has(index) || decoding.has(index) || !blobs[index]) return decoding.get(index);
      const job = createImageBitmap(blobs[index])
        .then((bitmap) => {
          decoding.delete(index);
          if (disposed) {
            bitmap.close?.();
            return;
          }
          remember(index, bitmap);
          draw(requested.current); // a no-op unless this frame is part of what should be on screen
        })
        .catch(() => decoding.delete(index));
      decoding.set(index, job);
      return job;
    }

    /** Paints a fractional position: its frame, with the next one dissolved in by the fraction. */
    function draw(position) {
      const base = Math.floor(position);
      const a = nearestLoaded(base);
      if (a < 0) return;
      const first = source(a);
      if (!first) {
        decode(a); // keeps the previous picture on screen until this frame is ready
        return;
      }
      let second = null;
      let alpha = 0;
      const t = position - base;
      if (blend && a === base && a + 1 < count && t >= 1 / BLEND_STEPS) {
        second = source(a + 1);
        if (second) alpha = Math.round(t * BLEND_STEPS) / BLEND_STEPS;
        else if (loaded[a + 1]) decode(a + 1);
      }
      const key = second ? a + alpha : a;
      if (key === painted) return;

      if (!cover) resize();
      ctx.globalAlpha = 1;
      ctx.drawImage(first, cover.x, cover.y, cover.w, cover.h);
      if (second) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(second, cover.x, cover.y, cover.w, cover.h);
        ctx.globalAlpha = 1;
      }
      shown = [a, second ? a + 1 : -1];
      if (useBitmaps) {
        remember(a, first);
        if (second) remember(a + 1, second);
      }
      painted = key;
      if (!ready) report();
    }

    function prefetch(index) {
      if (!useBitmaps) return;
      for (let step = 1; step <= 10; step += 1) {
        const ahead = index + step * direction;
        if (ahead >= 0 && ahead < count) decode(ahead);
      }
      if (index - direction >= 0 && index - direction < count) decode(index - direction);
    }

    const render = (position) => {
      const p = Math.max(0, Math.min(count - 1, position));
      const base = Math.floor(p);
      if (base !== previousRequest) direction = base > previousRequest ? 1 : -1;
      previousRequest = base;
      requested.current = p;
      draw(p);
      prefetch(base);
    };

    const report = () => {
      const progress = Math.round((done / count) * 20) * 5; // 5% steps: few React renders
      const nowReady = ready || (done >= Math.ceil(count * LOADING.readyFraction) && painted >= 0);
      if (progress === lastReported && nowReady === ready) return;
      lastReported = progress;
      ready = nowReady;
      setStatus({ ready: nowReady, progress });
    };

    const isBuffered = (position) => finished[Math.min(count - 1, Math.floor(position) + 1)] === 1;

    const onLoaded = (index) => {
      loaded[index] = 1;
      finished[index] = 1;
      done += 1;
      if (index === 0 || Math.abs(index - requested.current) < 3) render(requested.current);
      report();
      if (done === count && import.meta.env.DEV) {
        const total = useBitmaps ? bytes : set.bytes;
        // eslint-disable-next-line no-console -- dev-only load report
        console.info(`[hero] ${loaded.reduce((a, b) => a + b, 0)}/${count} frames loaded, ${(total / 1024 / 1024).toFixed(2)} MB`);
      }
    };

    const onFailed = (index) => {
      finished[index] = 1;
      done += 1;
      report();
    };

    const loadBlob = async (index) => {
      const response = await fetch(frameUrl(set, index), { signal: abort.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      bytes += blob.size;
      blobs[index] = blob;
    };

    const loadImage = (index) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
        img.onerror = reject;
        abort.signal.addEventListener('abort', () => {
          img.src = '';
          reject(new DOMException('Aborted', 'AbortError'));
        });
        img.src = frameUrl(set, index);
        images[index] = img;
      });

    const queue = loadOrder(count);
    const taken = new Uint8Array(count);
    /** The next frame to fetch: those just ahead of the playhead first, then coarse to fine across the film. */
    const nextFrame = () => {
      const from = Math.max(0, Math.floor(requested.current));
      for (let i = from; i < Math.min(count, from + LOADING.lookahead); i += 1) {
        if (!taken[i]) {
          taken[i] = 1;
          return i;
        }
      }
      while (queue.length) {
        const i = queue.shift();
        if (!taken[i]) {
          taken[i] = 1;
          return i;
        }
      }
      return -1;
    };
    const worker = async () => {
      for (let index = nextFrame(); index >= 0 && !disposed; index = nextFrame()) {
        try {
          if (useBitmaps) await loadBlob(index);
          else await loadImage(index);
          if (!disposed) onLoaded(index);
        } catch (error) {
          if (disposed || error.name === 'AbortError') return;
          onFailed(index);
        }
      }
    };
    for (let i = 0; i < LOADING.concurrency; i += 1) worker();

    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    observer.observe(canvas);
    resize();

    controller.current = { render, isBuffered };
    return () => {
      disposed = true;
      abort.abort();
      observer.disconnect();
      clearTimeout(resizeTimer);
      bitmaps.forEach((bitmap) => bitmap.close?.());
      bitmaps.clear();
      decoding.clear();
      controller.current = null;
    };
  }, [canvasRef, set, enabled, cacheSize, blend]);

  const render = useCallback((position) => {
    requested.current = position;
    controller.current?.render(position);
  }, []);

  const isBuffered = useCallback((position) => controller.current?.isBuffered(position) ?? false, []);

  return { ...status, render, isBuffered };
}
