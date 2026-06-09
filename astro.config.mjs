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
      serialize(item) {
        // Remove trailing slash for consistent matching
        const url = item.url.replace(/\/+$/, '');

        // --- Homepage --- highest priority, crawlers check most often
        if (url === 'https://blog.foolcar.cc') {
          return { ...item, changefreq: 'daily', priority: 1.0, lastmod: item.lastmod || new Date().toISOString() };
        }

        // --- About page --- informational, rarely updates
        if (url === 'https://blog.foolcar.cc/about') {
          return { ...item, changefreq: 'monthly', priority: 0.5, lastmod: item.lastmod || new Date().toISOString() };
        }

        // --- Blog posts --- content pages, stable after publish
        if (url.includes('/blog/')) {
          return { ...item, changefreq: 'monthly', priority: 0.7, lastmod: item.lastmod || new Date().toISOString() };
        }

        // --- Tag pages --- supporting content
        if (url.includes('/tags/')) {
          return { ...item, changefreq: 'monthly', priority: 0.4, lastmod: item.lastmod || new Date().toISOString() };
        }

        // --- Fallback for any unexpected pages
        return { ...item, changefreq: 'weekly', priority: 0.5, lastmod: item.lastmod || new Date().toISOString() };
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
