import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: '餐饮SaaS出海指南',
    description: '從中國香港出發，分享將餐飲SaaS產品推向全球市場的實戰經驗',
    site: context.site ?? 'https://foolcar.github.io',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/tappo-saas-blog/blog/${post.slug}`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>zh-Hant</language>`,
  });
}
