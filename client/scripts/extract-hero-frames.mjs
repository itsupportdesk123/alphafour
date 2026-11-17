/**
 * Builds the scroll-scrubbed hero assets from the film named by SETTINGS.video (public/videos/):
 *
 *   1. takes the three chapter changes between the four clips (SETTINGS.cutTimes, or ffmpeg scene detection),
 *   2. re-joins the clips with xfade so the frame sequence never jumps (.cache/hero/, not shipped),
 *      unless the film already blends its own scenes (SETTINGS.transition = null),
 *   3. extracts lossless frames and encodes WebP sets for desktop and mobile within a payload budget
 *      (sharp, with sharp-YUV subsampling so dark skies and coloured lights don't block or band),
 *   4. writes a poster, a tiny blurred placeholder and optimised ring images,
 *   5. rewrites the generated block of src/features/hero/heroConfig.js.
 *
 * Idempotent: every output folder is cleared and regenerated. Run with `npm run hero:frames`.
 * Uses ffmpeg from PATH when available, otherwise the ffmpeg-static binary.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const CACHE = path.join(ROOT, '.cache', 'hero');
const OUT = path.join(PUBLIC, 'hero-frames');
const CONFIG = path.join(ROOT, 'src', 'features', 'hero', 'heroConfig.js');

const SETTINGS = {
  video: /^1102\.\w+$/i,
  /**
   * Chapter changes (seconds) for a film whose scenes flow into each other, where scene detection
   * finds nothing useful: aerial → street, the push through the entrance curtain, the black dip
   * before the rooftop. null = detect hard cuts instead.
   */
  cutTimes: [10.4, 23.05, 33.1],
  /**
   * Frames darker than this mean luma (16 = black) are dropped: the film flashes to black for a few
   * frames between shots, which a slow scrub would hold on screen. Neighbouring shots then meet and
   * the player's frame blending dissolves between them. null keeps every frame.
   */
  dropDarkBelow: 30,
  sceneThreshold: 0.35,
  /** Candidates below the main threshold are only used when it doesn't yield exactly three cuts. */
  sceneFallbackThreshold: 0.12,
  expectedCuts: 3,
  /** xfade at each cut; null keeps the film as edited (it already transitions between scenes). */
  transition: null,
  transitionDuration: 0.6,
  /**
   * Frame sets: quality before frame count (the player blends neighbouring frames, so a few hundred
   * scrub smoothly). Widths are capped at the source width: a frame is never upscaled.
   * About 16 frames per film second on desktop and 10 on mobile: the film also plays by itself at a
   * fraction of its speed, where fewer frames would show as ghosting between them.
   */
  desktop: {
    budgetBytes: 42 * 1024 * 1024,
    frameCounts: [600, 540, 480],
    ladder: [
      [1920, 84],
      [1920, 80],
      [1600, 82],
      [1600, 78],
      [1280, 80],
      [1280, 76],
    ],
  },
  mobile: {
    budgetBytes: 13.5 * 1024 * 1024,
    frameCounts: [380, 340, 300],
    ladder: [
      [1080, 82],
      [960, 80],
      [960, 76],
      [854, 76],
    ],
  },
  /** Parallel sharp encodes. */
  concurrency: 4,
  ring: {
    max: 12,
    /** Filenames to keep out of the ring (every other image in public/images is used, up to max). */
    exclude: /^hero-poster/i,
    aspect: 3 / 2,
    desktop: { width: 1280, quality: 78 },
    mobile: { width: 800, quality: 72 },
  },
};

const MB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function resolveFfmpeg() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status === 0) return 'ffmpeg';
  const bundled = require('ffmpeg-static');
  if (bundled && existsSync(bundled)) return bundled;
  throw new Error('ffmpeg not found: install it or run `npm i -D ffmpeg-static`.');
}
const FFMPEG = resolveFfmpeg();

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, ['-hide_banner', ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(stderr) : reject(new Error(`ffmpeg exited ${code}\n${stderr.slice(-2000)}`))));
  });
}

async function findVideo() {
  const dir = path.join(PUBLIC, 'videos');
  const file = (await readdir(dir)).find((name) => SETTINGS.video.test(name));
  if (!file) throw new Error(`No ${SETTINGS.video} found in ${dir}`);
  return path.join(dir, file);
}

async function probe(file) {
  // `ffmpeg -i` without an output exits non-zero but prints the stream info we need.
  const { stderr } = spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const duration = stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const video = stderr.match(/Video: .*?, (\d{2,5})x(\d{2,5})[^\n]*?, ([\d.]+) fps/);
  if (!duration || !video) throw new Error(`Could not probe ${file}`);
  return {
    duration: Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]),
    width: Number(video[1]),
    height: Number(video[2]),
    fps: Number(video[3]),
  };
}

/**
 * Re-encodes the film without its flash-to-black frames (.cache/hero/, not shipped). Returns the
 * cleaned film, its duration and a mapper from source time to cleaned time.
 */
async function dropDarkFrames(file, info) {
  const keep = { file, duration: info.duration, toClean: (t) => t, dropped: 0 };
  if (SETTINGS.dropDarkBelow == null) return keep;
  const log = await ffmpeg(['-i', file, '-an', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-']);
  const dark = [];
  let time = null;
  for (const line of log.split(/\r?\n/)) {
    const t = line.match(/pts_time:([\d.]+)/);
    if (t) time = Number(t[1]);
    const y = line.match(/lavfi\.signalstats\.YAVG=([\d.]+)/);
    if (y && time !== null) {
      if (Number(y[1]) < SETTINGS.dropDarkBelow) dark.push(time);
      time = null;
    }
  }
  if (!dark.length) return keep;

  const frame = 1 / info.fps;
  const drop = dark.map((t) => `between(t,${(t - frame / 4).toFixed(4)},${(t + frame / 4).toFixed(4)})`).join('+');
  await mkdir(CACHE, { recursive: true });
  const target = path.join(CACHE, 'alphafourHero.clean.mp4');
  await ffmpeg([
    '-y', '-i', file, '-an',
    '-vf', `select='not(${drop})',setpts=N/${info.fps}/TB`, '-r', String(info.fps),
    '-c:v', 'libx264', '-preset', 'medium', '-qp', '0', '-pix_fmt', 'yuv420p', target, // lossless: no generational loss
  ]);
  return {
    file: target,
    duration: info.duration - dark.length * frame,
    toClean: (t) => t - dark.filter((d) => d < t).length * frame,
    dropped: dark.length,
  };
}

/** Returns the three cut timestamps (seconds) between the four clips. */
async function detectCuts(file, duration) {
  if (SETTINGS.cutTimes) {
    if (SETTINGS.cutTimes.length !== SETTINGS.expectedCuts) throw new Error(`SETTINGS.cutTimes needs ${SETTINGS.expectedCuts} entries`);
    return { cuts: SETTINGS.cutTimes.map((time) => ({ time, score: 1 })), note: 'from SETTINGS.cutTimes', candidates: [] };
  }
  const log = await ffmpeg([
    '-i', file, '-an',
    '-vf', `select='gt(scene,${SETTINGS.sceneFallbackThreshold})',metadata=print`,
    '-f', 'null', '-',
  ]);
  const candidates = [];
  let time = null;
  for (const line of log.split(/\r?\n/)) {
    const t = line.match(/pts_time:([\d.]+)/);
    if (t) time = Number(t[1]);
    const s = line.match(/lavfi\.scene_score=([\d.]+)/);
    if (s && time !== null) {
      candidates.push({ time, score: Number(s[1]) });
      time = null;
    }
  }

  let cuts = candidates.filter((c) => c.score >= SETTINGS.sceneThreshold);
  let note = `${cuts.length} cut(s) above scene threshold ${SETTINGS.sceneThreshold}`;
  if (cuts.length !== SETTINGS.expectedCuts) {
    // Keep the strongest changes, at least a second apart and away from the very ends.
    const ranked = [...candidates].sort((a, b) => b.score - a.score);
    cuts = [];
    for (const c of ranked) {
      if (c.time < 1 || c.time > duration - 1) continue;
      if (cuts.every((k) => Math.abs(k.time - c.time) > 1)) cuts.push(c);
      if (cuts.length === SETTINGS.expectedCuts) break;
    }
    note += `; picked the ${cuts.length} strongest scene changes instead`;
  }
  if (cuts.length !== SETTINGS.expectedCuts) throw new Error(`Expected ${SETTINGS.expectedCuts} cuts, found ${cuts.length}`);
  cuts.sort((a, b) => a.time - b.time);
  return { cuts, note, candidates };
}

/** Splits at the cuts and re-joins the four clips with xfade. Returns transition midpoints in output time. */
async function crossfade(file, info, cutTimes) {
  if (!SETTINGS.transition) return { file, duration: info.duration, midpoints: cutTimes };
  const D = SETTINGS.transitionDuration;
  const bounds = [0, ...cutTimes, info.duration];
  const lengths = bounds.slice(1).map((end, i) => end - bounds[i]);
  if (lengths.some((len) => len <= D * 2)) throw new Error('A clip is too short for the transition duration');

  const clips = lengths.length;
  const parts = [`[0:v]split=${clips}${lengths.map((_, i) => `[s${i}]`).join('')}`];
  lengths.forEach((_, i) => {
    parts.push(`[s${i}]trim=start=${bounds[i]}:end=${bounds[i + 1]},setpts=PTS-STARTPTS,fps=${info.fps},settb=AVTB,format=yuv420p[c${i}]`);
  });
  const offsets = [];
  let offset = 0;
  let previous = 'c0';
  for (let i = 1; i < clips; i += 1) {
    offset += lengths[i - 1] - D;
    offsets.push(offset);
    const label = i === clips - 1 ? 'out' : `x${i}`;
    parts.push(`[${previous}][c${i}]xfade=transition=${SETTINGS.transition}:duration=${D}:offset=${offset.toFixed(3)}[${label}]`);
    previous = label;
  }

  await mkdir(CACHE, { recursive: true });
  const target = path.join(CACHE, 'alphafourHero.xfade.mp4');
  await ffmpeg([
    '-y', '-i', file, '-filter_complex', parts.join(';'), '-map', '[out]', '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', target,
  ]);
  const duration = info.duration - D * (clips - 1);
  return { file: target, duration, midpoints: offsets.map((o) => o + D / 2) };
}

async function folderBytes(dir) {
  let total = 0;
  for (const name of await readdir(dir)) total += (await stat(path.join(dir, name))).size;
  return total;
}

/** Runs `fn` over `items` with at most `limit` in flight; resolves to the results in order. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Extracts lossless PNG frames at a frame rate and width, so each WebP is encoded only once. */
async function extractPngs(source, dir, { fps, width }) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await ffmpeg([
    '-y', '-i', source,
    '-vf', `fps=${fps},scale=${width}:-2:flags=lanczos`,
    '-fps_mode', 'passthrough', '-start_number', '1', path.join(dir, 'frame_%04d.png'),
  ]);
  return (await readdir(dir)).filter((f) => f.endsWith('.png')).sort();
}

/** Sharp-YUV conversion keeps the night sky's gradients and coloured lights from banding and blocking. */
const webp = (file, quality) => sharp(file).webp({ quality, smartSubsample: true, effort: 5 });

/** Encodes one device's frame set, stepping down quality → width → frame count until it fits the budget. */
async function buildFrameSet(device, film, sourceWidth) {
  const spec = SETTINGS[device];
  const dir = path.join(OUT, device);
  const pngDir = path.join(CACHE, `png-${device}`);
  const SAMPLE_EVERY = 8;
  const tried = [];

  for (const target of spec.frameCounts) {
    const fps = target / film.duration;
    let extracted = null;
    for (const [ladderWidth, quality] of spec.ladder) {
      const width = Math.min(ladderWidth, sourceWidth);
      if (extracted?.width !== width) extracted = { width, files: await extractPngs(film.file, pngDir, { fps, width }) };
      const { files } = extracted;

      // Cheap estimate from every 8th frame before paying for the full encode.
      const sample = files.filter((_, i) => i % SAMPLE_EVERY === 0);
      const sizes = await mapLimit(sample, SETTINGS.concurrency, async (f) => (await webp(path.join(pngDir, f), quality).toBuffer()).length);
      const estimate = (sizes.reduce((a, b) => a + b, 0) / sample.length) * files.length;
      tried.push(`${files.length}f ${width}w q${quality} ≈ ${MB(estimate)}`);
      if (estimate > spec.budgetBytes * 0.97) continue;

      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
      await mapLimit(files, SETTINGS.concurrency, (f) => webp(path.join(pngDir, f), quality).toFile(path.join(dir, f.replace(/\.png$/, '.webp'))));
      const bytes = await folderBytes(dir);
      if (bytes <= spec.budgetBytes) {
        await rm(pngDir, { recursive: true, force: true });
        const meta = await sharp(path.join(dir, 'frame_0001.webp')).metadata();
        return { count: files.length, bytes, fps, width: meta.width, height: meta.height, quality, tried };
      }
      tried.push(`  full encode was ${MB(bytes)}: over budget`);
    }
  }
  throw new Error(`${device}: could not fit ${MB(spec.budgetBytes)}. Tried:\n${tried.join('\n')}`);
}

async function buildPosters(xfade, sets) {
  for (const [device, suffix] of [['desktop', ''], ['mobile', '-mobile']]) {
    await ffmpeg([
      '-y', '-i', xfade.file, '-frames:v', '1',
      '-vf', `scale=${sets[device].width}:-2:flags=lanczos`,
      '-c:v', 'libwebp', '-quality', '82', path.join(OUT, `poster${suffix}.webp`),
    ]);
  }
  const tiny = await sharp(path.join(OUT, 'poster.webp')).resize(32).blur(1.2).webp({ quality: 45 }).toBuffer();
  await writeFile(path.join(OUT, 'placeholder.webp'), tiny);
  return `data:image/webp;base64,${tiny.toString('base64')}`;
}

function captionFromFile(file) {
  return path
    .parse(file)
    .name.replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/\bpanorama\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const slugify = (file) =>
  path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Picks the project images for the ring (largest first, at most 12) and writes card-sized WebPs. */
async function buildRing() {
  const spec = SETTINGS.ring;
  const dir = path.join(PUBLIC, 'images');
  const images = [];
  for (const file of await readdir(dir)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file) || spec.exclude?.test(file)) continue;
    const meta = await sharp(path.join(dir, file)).metadata();
    images.push({ file, width: meta.width, height: meta.height, pixels: meta.width * meta.height });
  }
  // Largest first decides who makes the cut; the ring keeps the folder's (alphabetical) order.
  const chosen = images
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, spec.max)
    .sort((a, b) => a.file.localeCompare(b.file, 'en', { sensitivity: 'base' }));

  const ring = [];
  for (const image of chosen) {
    const slug = slugify(image.file);
    const entry = { file: image.file, caption: captionFromFile(image.file), source: `${image.width}x${image.height}` };
    for (const device of ['desktop', 'mobile']) {
      const { width, quality } = spec[device];
      const outDir = path.join(OUT, 'ring', device);
      await mkdir(outDir, { recursive: true });
      await sharp(path.join(dir, image.file))
        .resize(width, Math.round(width / spec.aspect), { fit: 'cover', position: 'attention' })
        .webp({ quality })
        .toFile(path.join(outDir, `${slug}.webp`));
      entry[device] = `/hero-frames/ring/${device}/${slug}.webp`;
    }
    ring.push(entry);
  }
  const bytes = {
    desktop: await folderBytes(path.join(OUT, 'ring', 'desktop')),
    mobile: await folderBytes(path.join(OUT, 'ring', 'mobile')),
  };
  return { ring, bytes, skipped: images.length - chosen.length };
}

const START = '// <generated by scripts/extract-hero-frames.mjs: do not edit by hand, run `npm run hero:frames`>';
const END = '// </generated>';

async function writeConfig(generated) {
  const block = [
    START,
    `export const FRAMES = ${JSON.stringify(generated.frames, null, 2)};`,
    '',
    '/** Kept for convenience: the desktop frame count. */',
    'export const FRAME_COUNT = FRAMES.desktop.count;',
    '/** Frame indices (0-based, desktop set) where each clip hands over to the next: the xfade midpoints. */',
    'export const CUT_FRAMES = FRAMES.desktop.cutFrames;',
    '',
    `export const HERO_MEDIA = ${JSON.stringify(generated.media, null, 2)};`,
    '',
    `export const RING_IMAGES = ${JSON.stringify(generated.ring, null, 2)};`,
    END,
  ].join('\n');

  const current = existsSync(CONFIG) ? await readFile(CONFIG, 'utf8') : '';
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  if (start === -1 || end === -1) throw new Error(`${CONFIG} is missing the generated block markers`);
  await writeFile(CONFIG, current.slice(0, start) + block + current.slice(end + END.length));
}

async function main() {
  const video = await findVideo();
  const info = await probe(video);
  console.log(`video   ${path.relative(ROOT, video)}  ${info.width}x${info.height}  ${info.fps} fps  ${info.duration.toFixed(2)} s  (ffmpeg: ${FFMPEG})`);

  const clean = await dropDarkFrames(video, info);
  console.log(`dark    ${clean.dropped} flash-to-black frame(s) dropped  ${clean.duration.toFixed(2)} s left`);
  const film = { ...info, duration: clean.duration };

  const { cuts, note, candidates } = SETTINGS.cutTimes
    ? await detectCuts(video, info.duration).then((r) => ({ ...r, cuts: r.cuts.map((c) => ({ ...c, time: clean.toClean(c.time) })) }))
    : await detectCuts(clean.file, film.duration);
  console.log(`cuts    ${cuts.map((c) => `${c.time.toFixed(3)}s (score ${c.score.toFixed(3)})`).join(', ')}  [${note}; ${candidates.length} candidates]`);

  const xfade = await crossfade(clean.file, film, cuts.map((c) => c.time));
  console.log(`xfade   ${path.relative(ROOT, xfade.file)}  ${xfade.duration.toFixed(2)} s, ${SETTINGS.transition ? `${SETTINGS.transition} ${SETTINGS.transitionDuration}s` : 'no xfade'} at ${xfade.midpoints.map((m) => m.toFixed(2)).join(', ')} s`);

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const sets = {};
  for (const device of ['desktop', 'mobile']) {
    const set = await buildFrameSet(device, xfade, info.width);
    const cutFrames = xfade.midpoints.map((m) => Math.min(set.count - 1, Math.round(m * set.fps)));
    sets[device] = { ...set, cutFrames };
    console.log(`${device.padEnd(7)} ${set.count} frames  ${set.width}x${set.height}  q${set.quality}  ${set.fps.toFixed(3)} fps  ${MB(set.bytes)}  cuts at frames ${cutFrames.join(', ')}`);
  }

  const placeholder = await buildPosters(xfade, sets);
  const { ring, bytes: ringBytes, skipped } = await buildRing();
  console.log(`ring    ${ring.length} images (${skipped} not used): ${ring.map((r) => r.file).join(', ')}  desktop ${MB(ringBytes.desktop)}, mobile ${MB(ringBytes.mobile)}`);

  const frames = {};
  for (const [device, set] of Object.entries(sets)) {
    frames[device] = {
      count: set.count,
      cutFrames: set.cutFrames,
      /** Frames either side of a cut that belong to its crossfade. */
      transitionHalfFrames: SETTINGS.transition ? Math.ceil((SETTINGS.transitionDuration / 2) * set.fps) : 0,
      width: set.width,
      height: set.height,
      quality: set.quality,
      bytes: set.bytes,
      path: `/hero-frames/${device}/frame_`,
      pad: 4,
      ext: '.webp',
    };
  }

  await writeConfig({
    frames,
    media: {
      poster: '/hero-frames/poster.webp',
      posterMobile: '/hero-frames/poster-mobile.webp',
      placeholder,
      cutTimes: cuts.map((c) => Number(c.time.toFixed(3))),
      transition: SETTINGS.transition ? `${SETTINGS.transition} ${SETTINGS.transitionDuration}s` : 'none (edited into the film)',
      sourceDuration: Number(info.duration.toFixed(3)),
      droppedDarkFrames: clean.dropped,
      sequenceDuration: Number(xfade.duration.toFixed(3)),
    },
    ring: ring.map(({ file, caption, desktop, mobile }) => ({ file, caption, desktop, mobile })),
  });
  console.log(`config  ${path.relative(ROOT, CONFIG)} updated`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
