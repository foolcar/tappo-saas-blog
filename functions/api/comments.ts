// GET  /api/comments?thread=<key>  → 該線程評論（flat，按時間正序）
// POST /api/comments                → 發表 / 回覆評論

import { hashIp, detectLang, json, isEnabled, validateInput } from '../_lib/helpers';

export const onRequestGet = async (ctx: any) => {
  const { request, env } = ctx;
  if (!isEnabled(env)) return json({ comments: [] }, 503);
  if (!env.DB) return json({ error: 'db unavailable' }, 503);

  const url = new URL(request.url);
  const thread = url.searchParams.get('thread');
  if (!thread) return json({ error: 'missing thread' }, 400);

  const { results } = await env.DB.prepare(
    `SELECT id, parent_id, author_name, body, locale, lang, likes, is_author, created_at
       FROM comments
      WHERE thread_key = ? AND status = 'approved'
      ORDER BY created_at ASC`
  )
    .bind(thread)
    .all();

  return json({ comments: results ?? [] });
};

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

  // 蜜罐：隱藏欄位 website 被填 → 視為機器人
  if (body.website) return json({ error: 'spam' }, 400);

  const threadKey = (body.thread || '').toString().trim();
  if (!threadKey) return json({ error: 'invalid thread' }, 400);

  const err = validateInput(body.name, body.content);
  if (err) return json({ error: err }, 400);

  const ip = await hashIp(request);

  // IP 限速：每 10 分鐘最多 10 條
  const since = Date.now() - 10 * 60 * 1000;
  const cnt = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM comments WHERE ip_hash = ? AND created_at > ?`
  )
    .bind(ip, since)
    .first();
  if ((cnt?.c ?? 0) >= 10) return json({ error: 'rate limited' }, 429);

  // 校驗 parent_id 確實屬於同一線程（防止跨線程注入）
  let pid: string | null = null;
  if (body.parent_id) {
    const p = await env.DB.prepare(
      `SELECT id FROM comments WHERE id = ? AND thread_key = ? AND status = 'approved'`
    )
      .bind(body.parent_id, threadKey)
      .first();
    if (p) pid = body.parent_id;
  }

  const id = crypto.randomUUID();
  const lang = detectLang(body.content);
  const locale = body.locale === 'en' ? 'en' : 'zh';
  // 站長識別：郵箱與 OWNER_EMAIL 一致 → 帶「作者」徽章
  const isAuthor =
    body.email && env.OWNER_EMAIL && body.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase() ? 1 : 0;

  await env.DB.prepare(
    `INSERT INTO comments (id, thread_key, parent_id, author_name, author_email, body, locale, lang, likes, is_author, status, created_at, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'approved', ?, ?)`
  )
    .bind(
      id,
      threadKey,
      pid,
      body.name.toString().trim(),
      body.email ? body.email.toString().trim() : null,
      body.content.toString().trim(),
      locale,
      lang,
      isAuthor,
      Date.now(),
      ip
    )
    .run();

  return json({ ok: true, id, lang, is_author: isAuthor });
};
