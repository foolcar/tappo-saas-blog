import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) =>
      (b.data.updated ?? b.data.date).valueOf() -
      (a.data.updated ?? a.data.date).valueOf()
  );
  const site = context.site ?? new URL('https://blogdemo.foolcar.cc');
  const lastBuildDate = sortedPosts[0]?.data.updated ?? sortedPosts[0]?.data.date;

  return rss({
    title: '餐飲 SaaS 出海觀察',
    description: '餐飲品牌全球化、餐飲 SaaS 出海與數字營運觀察。',
    site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dcterms: 'http://purl.org/dc/terms/',
    },
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}`,
      categories: [...new Set([post.data.category, ...post.data.tags])],
      customData: `<dcterms:modified>${(post.data.updated ?? post.data.date).toISOString()}</dcterms:modified>`,
    })),
    customData: [
      '<language>zh-Hant</language>',
      lastBuildDate ? `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>` : '',
      `<atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml" />`,
    ].join(''),
  });
}
