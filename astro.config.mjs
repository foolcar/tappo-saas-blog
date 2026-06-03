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
        if (url === 'https://foolcar.github.io/tappo-saas-blog') {
          return { ...item, changefreq: 'daily', priority: 1.0 };
        }

        // --- About page --- informational, rarely updates
        if (url === 'https://foolcar.github.io/tappo-saas-blog/about') {
          return { ...item, changefreq: 'monthly', priority: 0.5 };
        }

        // --- Blog posts --- content pages, stable after publish
        if (url.includes('/tappo-saas-blog/blog/')) {
          return { ...item, changefreq: 'monthly', priority: 0.7 };
        }

        // --- Fallback for any unexpected pages
        return { ...item, changefreq: 'weekly', priority: 0.5 };
      },
    }),
  ],
  site: 'https://foolcar.github.io',
  base: '/tappo-saas-blog',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
