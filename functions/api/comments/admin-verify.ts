// POST /api/comments/admin-verify  → 回傳 token 是否為有效管理憑證
// 用途：前端決定是否顯示「刪除」鈕 / 開放合併評論頁（僅管理員可見），避免把雜湊白名單暴露到客戶端
import { json, isAdminToken } from '../../_lib/helpers';

export const onRequestPost = async (ctx: any) => {
  const { request, env } = ctx;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false });
  }
  const token = (body.token || '').toString().trim();
  if (!token) return json({ ok: false });
  const ok = await isAdminToken(token, env);
  return json({ ok: !!ok });
};
