// Post-build step: remove owner-only comment-moderation URLs and low-value
// (single/double-article) tag-page URLs from the generated sitemap XML.
//
// - Comment-moderation URLs are removed by matching `/comments/` in the <loc>.
// - Tag pages whose built HTML carries a `noindex` meta are removed. The
//   `noindex` decision lives in `src/pages/tags/[tag].astro`
//   (`noindex={posts.length < 3}`), so this script needs no hardcoded list and
//   stays correct as the article set grows or shrinks.
//
// Run automatically via the `build` npm script:
//   astro build && node ./scripts/strip-sitemap-comments.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const files = readdirSync(distDir).filter((f) => /^sitemap-\d+\.xml$/.test(f));

if (files.length === 0) {
  console.log('[strip-sitemap] no sitemap-*.xml found in dist/, skipping.');
  process.exit(0);
}

// Map a sitemap <loc> (e.g. https://blog.foolcar.cc/tags/外賣平台/) to the
// built HTML file and report whether that page is marked noindex.
function tagPageIsNoindex(loc) {
  try {
    const u = new URL(loc);
    let p = decodeURIComponent(u.pathname);
    if (p.endsWith('/')) p += 'index.html';
    else if (!/\.[a-z0-9]+$/i.test(p)) p += '/index.html';
    const fp = distDir + p.replace(/^\//, '');
    if (!existsSync(fp)) return false;
    return readFileSync(fp, 'utf-8').includes('noindex');
  } catch {
    return false;
  }
}

let removedComments = 0;
let removedTags = 0;

for (const f of files) {
  const p = distDir + f;
  const xml = readFileSync(p, 'utf-8');
  const cleaned = xml.replace(/<url>(?:(?!<\/url>)[\s\S])*?<\/url>/g, (block) => {
    // Negative lookahead above keeps the match inside a single <url> block.
    if (/<loc>[^<]*comments[^<]*<\/loc>/.test(block)) {
      removedComments++;
      return '';
    }
    const locM = block.match(/<loc>([^<]*)<\/loc>/);
    if (locM && /\/tags\//.test(locM[1]) && tagPageIsNoindex(locM[1])) {
      removedTags++;
      return '';
    }
    return block;
  });
  if (cleaned !== xml) writeFileSync(p, cleaned);
}

console.log(
  `[strip-sitemap] done — scanned ${files.length} sitemap file(s): ` +
    `removed ${removedComments} comment URL(s), ${removedTags} low-count tag URL(s).`
);
