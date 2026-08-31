// POST /api/translate  →  { comment_id, target }  調 Workers AI 翻譯並緩存

import { json, isEnabled } from '../_lib/helpers';

export const onRequestPost = async (ctx: any) => {
  const { request, env } = ctx;
  if (!isEnabled(env)) return json({ error: 'disabled' }, 503);
  if (!env.DB) return json({ error: 'db unavailable' }, 503);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const comment_id = (body.comment_id || '').toString();
  const target = body.target === 'en' ? 'en' : 'zh';
  if (!comment_id) return json({ error: 'missing comment_id' }, 400);

  const row = await env.DB.prepare(
    `SELECT body, lang FROM comments WHERE id = ? AND status = 'approved'`
  )
    .bind(comment_id)
    .first();
  if (!row) return json({ error: 'not found' }, 404);

  // 原文即目標語 → 直接回傳原文
  if (row.lang === target) return json({ translated: row.body });

  // 命中緩存
  const cached = await env.DB.prepare(
    `SELECT text FROM comment_translations WHERE comment_id = ? AND target = ?`
  )
    .bind(comment_id, target)
    .first();
  if (cached) return json({ translated: cached.text });

  if (!env.AI) return json({ error: 'translation unavailable' }, 503);

  try {
    const res: any = await env.AI.run('@cf/meta/m2m100-1.2b', {
      text: row.body,
      source_lang: row.lang || 'en',
      target_lang: target,
    });
    const translated: string = res?.translated_text || '';
    if (translated) {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO comment_translations (comment_id, target, text, created_at) VALUES (?, ?, ?, ?)`
      )
        .bind(comment_id, target, translated, Date.now())
        .run();
    }
    return json({ translated });
  } catch {
    return json({ error: 'translation failed' }, 502);
  }
};
