// POST /api/comments/delete  → 管理員軟刪除某條評論 + 整串子回覆（cascade）
import { json, isAdminToken } from '../../_lib/helpers';

export const onRequestPost = async (ctx: any) => {
  const { request, env } = ctx;
  if (!env.DB) return json({ error: 'db unavailable' }, 503);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const id = (body.id || '').toString().trim();
  if (!id) return json({ error: 'missing id' }, 400);

  // 管理員驗證：使用專屬 admin token（與站長郵箱分離），避免以公開郵箱當憑證
  const isAdmin = await isAdminToken(body.token, env);
  if (!isAdmin) return json({ error: 'unauthorized' }, 403);

  // 確認目標存在（含已刪除的也視為 not found，避免重複操作）
  const root = await env.DB.prepare(`SELECT id FROM comments WHERE id = ?`).bind(id).first();
  if (!root) return json({ error: 'not found' }, 404);

  // 收集該評論 + 所有子孫 id（cascade，只沿 approved 往下，避免重複處理已刪除）
  const ids: string[] = [];
  const queue: string[] = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    ids.push(cur);
    const { results } = await env.DB.prepare(
      `SELECT id FROM comments WHERE parent_id = ? AND status = 'approved'`
    )
      .bind(cur)
      .all();
    for (const r of results ?? []) queue.push((r as any).id);
  }

  const placeholders = ids.map(() => '?').join(',');

  // 軟刪除：status = 'deleted'（GET 已過濾 approved，自動隱藏）
  await env.DB.prepare(`UPDATE comments SET status = 'deleted' WHERE id IN (${placeholders})`)
    .bind(...ids)
    .run();

  // 一併清掉點讚 / 翻譯緩存，保持整潔
  await env.DB.prepare(`DELETE FROM comment_likes WHERE comment_id IN (${placeholders})`)
    .bind(...ids)
    .run();
  await env.DB.prepare(`DELETE FROM comment_translations WHERE comment_id IN (${placeholders})`)
    .bind(...ids)
    .run();

  return json({ ok: true, deleted: ids.length });
};
