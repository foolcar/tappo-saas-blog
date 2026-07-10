import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter(page) {
        // Exclude bare /blog/ and /en/blog/ listing pages — they 404
        // Actual blog listings are at / (homepage) and /en/ (EN homepage)
        if (page === 'https://blog.foolcar.cc/blog/' || page === 'https://blog.foolcar.cc/en/blog/') {
          return false;
        }
        return true;
      },
      serialize(item) {
        // Ensure every URL ends with a trailing slash to match canonical and avoid redirect chains
        const url = item.url.replace(/\/+$/, '') + '/';

        // Blog posts: extract actual publish date from URL filename prefix
        // Matches /blog/2026-03-12-* and /en/blog/2026-03-12-*
        const blogMatch = url.match(/\/(?:en\/)?blog\/(\d{4}-\d{2}-\d{2})/i);
        if (blogMatch) {
          return { url, lastmod: new Date(blogMatch[1] + 'T00:00:00Z').toISOString() };
        }

        // All other pages (home, about, category, tags, EN index, EN about):
        // Remove lastmod, changefreq, priority — let Google decide based on crawl
        return { url };
      },
    }),
  ],
  site: 'https://blog.foolcar.cc',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
