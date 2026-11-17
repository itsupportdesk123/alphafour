#!/usr/bin/env node
/**
 * Downloads the free CC0 assets used by the website and optimises them for the web.
 *
 *   npm run assets:fetch            # download what is missing
 *   npm run assets:fetch -- --force # re-download everything
 *
 * Sources
 *   • Poly Haven (https://polyhaven.com), CC0: 360° panoramas, sky domes, HDR lighting
 *   • pmndrs/drei-assets: soft cloud sprite for the 3D hero
 *
 * Output → client/public/{panoramas,skies,hdri,textures}
 */
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'client', 'public');
const FORCE = process.argv.includes('--force');
const POLY_HAVEN_API = 'https://api.polyhaven.com/files/';

/** Interior & exterior 360° scenes for the virtual tour and the hero. */
const PANORAMAS = [
  { id: 'royal_esplanade', name: 'grand-atrium' },
  { id: 'cayley_interior', name: 'living-room' },
  { id: 'hotel_room', name: 'master-suite' },
  { id: 'modern_bathroom', name: 'spa-bath' },
  { id: 'wooden_lounge', name: 'clubhouse' },
  { id: 'aft_lounge', name: 'sky-lounge' },
  { id: 'the_sky_is_on_fire', name: 'sea-promenade' },
];

/** Sky domes used as the visible background of the 3D hero. */
const SKIES = [
  { id: 'belfast_sunset_puresky', name: 'golden-hour' },
  { id: 'qwantani_dusk_2_puresky', name: 'dusk' },
];

/** Real HDR lighting (image-based lighting and reflections). */
const HDRIS = [{ id: 'belfast_sunset_puresky', name: 'golden-hour', resolution: '1k' }];

const CLOUD_URL =
  'https://rawcdn.githack.com/pmndrs/drei-assets/9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png';

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function polyHavenFiles(id) {
  const res = await fetch(`${POLY_HAVEN_API}${id}`);
  if (!res.ok) throw new Error(`Poly Haven API returned ${res.status} for ${id}`);
  return res.json();
}

async function writeEquirect(buffer, file, { width, quality }) {
  await sharp(buffer, { limitInputPixels: false })
    .resize(width, width / 2, { fit: 'fill', kernel: 'lanczos3' })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(file);
}

async function fetchPanorama({ id, name }, folder, { width, quality, thumb }) {
  const target = path.join(PUBLIC_DIR, folder, `${name}.webp`);
  const thumbTarget = path.join(PUBLIC_DIR, folder, 'thumbs', `${name}.webp`);
  if (!FORCE && (await exists(target)) && (!thumb || (await exists(thumbTarget)))) {
    console.log(`  ✓ ${folder}/${name}.webp (cached)`);
    return;
  }
  const files = await polyHavenFiles(id);
  const source = await download(files.tonemapped.url);
  await mkdir(path.dirname(target), { recursive: true });
  await writeEquirect(source, target, { width, quality });
  if (thumb) {
    await mkdir(path.dirname(thumbTarget), { recursive: true });
    await writeEquirect(source, thumbTarget, { width: 640, quality: 70 });
  }
  console.log(`  ↓ ${folder}/${name}.webp  ← ${id} (${(source.length / 1e6).toFixed(1)} MB source)`);
}

async function fetchHdri({ id, name, resolution }) {
  const target = path.join(PUBLIC_DIR, 'hdri', `${name}_${resolution}.hdr`);
  if (!FORCE && (await exists(target))) {
    console.log(`  ✓ hdri/${path.basename(target)} (cached)`);
    return;
  }
  const files = await polyHavenFiles(id);
  const data = await download(files.hdri[resolution].hdr.url);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  console.log(`  ↓ hdri/${path.basename(target)}  ← ${id}`);
}

/** The sprite's fully transparent texels are black; mipmapping bleeds that into grey, smoky edges. */
async function whiteMatte(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) data[i] = data[i + 1] = data[i + 2] = 255;
  }
  return sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer();
}

async function fetchCloud() {
  const target = path.join(PUBLIC_DIR, 'textures', 'cloud.png');
  if (!FORCE && (await exists(target))) {
    console.log('  ✓ textures/cloud.png (cached)');
    return;
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await whiteMatte(await download(CLOUD_URL)));
  console.log('  ↓ textures/cloud.png');
}

async function main() {
  console.log('Aurelia assets: fetching CC0 media…');
  console.log('\nPanoramas');
  for (const panorama of PANORAMAS) await fetchPanorama(panorama, 'panoramas', { width: 4096, quality: 78, thumb: true });
  console.log('\nSky domes');
  for (const sky of SKIES) await fetchPanorama(sky, 'skies', { width: 4096, quality: 82, thumb: false });
  console.log('\nHDR lighting');
  for (const hdri of HDRIS) await fetchHdri(hdri);
  console.log('\nTextures');
  await fetchCloud();
  console.log('\nDone. Assets are CC0 (Poly Haven) / MIT (drei-assets).');
}

main().catch((error) => {
  console.error(`\nAsset download failed: ${error.message}`);
  process.exit(1);
});
