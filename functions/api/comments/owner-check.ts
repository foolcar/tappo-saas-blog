// POST /api/comments/owner-check  → 回傳該郵箱是否為站長
// 用途：前端決定是否顯示「刪除」鈕（僅站長可見），避免把雜湊白名單暴露到客戶端
import { json, isOwnerEmail } from '../_lib/helpers';

export const onRequestPost = async (ctx: any) => {
  const { request, env } = ctx;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ is_owner: false });
  }
  const email = (body.email || '').toString().trim();
  if (!email) return json({ is_owner: false });
  const isOwner = await isOwnerEmail(email, env);
  return json({ is_owner: !!isOwner });
};
