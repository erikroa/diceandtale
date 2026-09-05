#!/usr/bin/env node
/**
 * Turn raw photographs into the responsive derivatives the site serves.
 *
 *   1. Drop full-size photos into  photos-raw/  named however you like.
 *   2. npm run photos
 *   3. A stub appears in src/content/photos/ for anything new — fill in the alt
 *      text (required) and the caption/venue/when (yours to write).
 *
 * Re-running is safe: existing derivatives and existing markdown are left alone.
 */
import sharp from 'sharp';
import { readdir, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const RAW = 'photos-raw';
const OUT = 'public/images/photos';
const CONTENT = 'src/content/photos';
const MANIFEST = 'src/photo-manifest.json';
const WIDTHS = [400, 800, 1600];

const exists = p => access(p).then(() => true, () => false);
const slugify = f =>
  path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

if (!(await exists(RAW))) {
  console.error(`No ${RAW}/ directory. Create it and put the original photos in it.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
await mkdir(CONTENT, { recursive: true });

const files = (await readdir(RAW)).filter(f => /\.(jpe?g|png|heic|webp)$/i.test(f));
const manifest = [];
let created = 0;

for (const file of files) {
  const slug = slugify(file);
  const img = sharp(path.join(RAW, file)).rotate();       // honour EXIF orientation
  const { width, height } = await img.metadata();
  const orientation =
    width > height * 1.15 ? 'landscape' : height > width * 1.05 ? 'portrait' : 'square';

  const widths = WIDTHS.filter(w => w <= width);
  if (widths.length === 0) widths.push(width);

  for (const w of widths) {
    const base = `${OUT}/${slug}-${w}`;
    if (await exists(`${base}.avif`)) continue;
    const resized = img.clone().resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52 }).toFile(`${base}.avif`);
    await resized.clone().webp({ quality: 76, effort: 6 }).toFile(`${base}.webp`);
    await resized.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`${base}.jpg`);
  }

  manifest.push({ slug, w: width, h: height, orientation, widths });

  const md = `${CONTENT}/${slug}.md`;
  if (!(await exists(md))) {
    created++;
    await writeFile(md, `---
slug: "${slug}"
alt: "TODO — describe what is visible, for anyone who cannot see it."
caption: ""
venue: ""
when: ""
orientation: "${orientation}"
hero: false
order: 50
---
`);
  }
}

manifest.sort((a, b) => a.slug.localeCompare(b.slug));
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1));

console.log(`${manifest.length} photos in the manifest.`);
if (created) {
  console.log(`\n${created} new entr${created === 1 ? 'y' : 'ies'} in ${CONTENT}/ still say "TODO" in the alt text.`);
  console.log('Alt text is not optional — it is what a blind visitor is read.');
}

const missing = [];
for (const { slug } of manifest) {
  const body = await readFile(`${CONTENT}/${slug}.md`, 'utf8');
  if (body.includes('TODO —')) missing.push(slug);
}
if (missing.length) {
  console.log('\nStill missing alt text:');
  missing.forEach(s => console.log('  ' + s));
}
