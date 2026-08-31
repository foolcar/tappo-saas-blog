// POST /api/comments/like  →  { comment_id }  點讚 / 取消（同 IP 去重）

import { hashIp, json, isEnabled } from '../../_lib/helpers';

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
  if (!comment_id) return json({ error: 'missing comment_id' }, 400);

  const ip = await hashIp(request);

  const existing = await env.DB.prepare(
    `SELECT 1 FROM comment_likes WHERE comment_id = ? AND ip_hash = ?`
  )
    .bind(comment_id, ip)
    .first();

  let liked: boolean;
  if (existing) {
    await env.DB.prepare(
      `DELETE FROM comment_likes WHERE comment_id = ? AND ip_hash = ?`
    )
      .bind(comment_id, ip)
      .run();
    await env.DB.prepare(
      `UPDATE comments SET likes = MAX(0, likes - 1) WHERE id = ?`
    )
      .bind(comment_id)
      .run();
    liked = false;
  } else {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO comment_likes (comment_id, ip_hash, created_at) VALUES (?, ?, ?)`
    )
      .bind(comment_id, ip, Date.now())
      .run();
    await env.DB.prepare(
      `UPDATE comments SET likes = likes + 1 WHERE id = ?`
    )
      .bind(comment_id)
      .run();
    liked = true;
  }

  const row = await env.DB.prepare(
    `SELECT likes FROM comments WHERE id = ?`
  )
    .bind(comment_id)
    .first();

  return json({ likes: row?.likes ?? 0, liked });
};
