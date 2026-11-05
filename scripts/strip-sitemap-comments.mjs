// Post-build step: remove owner-only comment-moderation URLs from the generated sitemap.
//
// @astrojs/sitemap's `filter` option and custom `astro:build:done` integration hooks do not
// fire reliably in this Astro pipeline, so we strip the comment-moderation URLs directly
// from the written sitemap XML after `astro build` completes.
//
// Run automatically via the `build` npm script: `astro build && node ./scripts/strip-sitemap-comments.mjs`
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const files = readdirSync(distDir).filter((f) => /^sitemap-\d+\.xml$/.test(f));

if (files.length === 0) {
  console.log('[strip-sitemap] no sitemap-*.xml found in dist/, skipping.');
  process.exit(0);
}

// Negative lookahead `(?:(?!<\/url>)[\s\S])*?` keeps the match inside a single <url> block,
// so it never swallows neighbouring URLs between the first <url> and the comment page.
const re = /<url>(?:(?!<\/url>)[\s\S])*?<loc>[^<]*comments[^<]*<\/loc>(?:(?!<\/url>)[\s\S])*?<\/url>/g;
let totalRemoved = 0;

for (const f of files) {
  const p = distDir + f;
  const xml = readFileSync(p, 'utf-8');
  const cleaned = xml.replace(re, '');
  const removed = (xml.length - cleaned.length) > 0;
  if (removed) {
    writeFileSync(p, cleaned);
    totalRemoved += (xml.match(/comments/g) || []).length;
    console.log(`[strip-sitemap] ${f}: removed comment-moderation URLs`);
  }
}

console.log(`[strip-sitemap] done — scanned ${files.length} sitemap file(s), removed ${totalRemoved} comment URL(s).`);
