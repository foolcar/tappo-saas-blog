// 2. Import content collections
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    category: z.enum([
      'POS選購',
      '全球市場',
      '國際化',
      '支付整合',
      '合規挑戰',
      '產品設計',
      '團隊管理',
    ]),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const blogEnCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    category: z.enum([
      'POS Purchasing',
      'Global Markets',
      'Internationalization',
      'Payment Integration',
      'Compliance',
      'Product Design',
      'Team Management',
    ]),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    originalSlug: z.string(), // links back to Chinese version
  }),
});

export const collections = {
  blog: blogCollection,
  blogEn: blogEnCollection,
};
