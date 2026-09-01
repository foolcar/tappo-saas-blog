// POST /api/comments/all  → 全部已通過評論（跨所有線程），供站長合併管理頁使用
// 僅限管理員：必須帶正確 admin token 才回傳，避免公開彙整資料被直接抓取
import { json, isEnabled, isAdminToken } from '../../_lib/helpers';

export const onRequestPost = async (ctx: any) => {
  const { request, env } = ctx;
  if (!isEnabled(env)) return json({ comments: [] }, 503);
  if (!env.DB) return json({ error: 'db unavailable' }, 503);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const ok = await isAdminToken((body.token ?? '').toString().trim(), env);
  if (!ok) return json({ ok: false, error: 'unauthorized' }, 403);

  const { results } = await env.DB.prepare(
    `SELECT id, thread_key, parent_id, author_name, body, locale, lang, likes, is_author, created_at
       FROM comments
      WHERE status = 'approved'
      ORDER BY created_at DESC`
  ).all();

  return json({ ok: true, comments: results ?? [] });
};
