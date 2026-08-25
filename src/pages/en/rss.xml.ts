import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blogEn', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) =>
      (b.data.updated ?? b.data.date).valueOf() -
      (a.data.updated ?? a.data.date).valueOf()
  );
  const origin = context.site ?? new URL('https://blogdemo.foolcar.cc');
  const site = new URL('/en/', origin);
  const lastBuildDate = sortedPosts[0]?.data.updated ?? sortedPosts[0]?.data.date;

  return rss({
    title: 'Restaurant SaaS Global Expansion Insight',
    description: 'Independent notes on restaurant brands, F&B SaaS, international expansion, and digital operations.',
    site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dcterms: 'http://purl.org/dc/terms/',
    },
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/en/blog/${post.slug}`,
      categories: [...new Set([post.data.category, ...post.data.tags])],
      customData: `<dcterms:modified>${(post.data.updated ?? post.data.date).toISOString()}</dcterms:modified>`,
    })),
    customData: [
      '<language>en</language>',
      lastBuildDate ? `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>` : '',
      `<atom:link href="${new URL('/en/rss.xml', origin).href}" rel="self" type="application/rss+xml" />`,
    ].join(''),
  });
}
