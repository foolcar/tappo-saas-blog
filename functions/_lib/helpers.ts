// 共用 helper —— Pages Functions 內部模組（_ 開頭目錄不會被當成路由）

export function getIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

export async function hashIp(request: Request): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(getIp(request)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// 輕量語言檢測：回傳 m2m100 可用的語言碼
export function detectLang(text: string): string {
  if (/[가-힯]/.test(text)) return 'ko';
  if (/[぀-ヿ]/.test(text)) return 'ja';
  if (/[؀-ۿ]/.test(text)) return 'ar';
  if (/[一-鿿]/.test(text)) return 'zh';
  return 'en';
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

// L2 功能開關：環境變數 COMMENTS_ENABLED === 'false' 時停用評論區
export function isEnabled(env: any): boolean {
  return env.COMMENTS_ENABLED !== 'false';
}

// 站長郵箱的 SHA-256 雜湊白名單（不在公開 repo 暴露郵箱明文）
// 產生方式：printf 'you@example.com' | shasum -a 256
const OWNER_EMAIL_HASHES = [
  '44e3a4eb32400ba46b1f641fc347e3228326691fe7e21e9b0ae320a71beee1bc',
];

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 站長識別：優先比對內置雜湊白名單；env.OWNER_EMAIL 若有設定亦作備援
// 不依賴環境變數，避免 wrangler.toml / Dashboard 綁定衝突導致徽章失效
export async function isOwnerEmail(email: unknown, env: any): Promise<0 | 1> {
  const e = (email ?? '').toString().trim().toLowerCase();
  if (!e) return 0;
  const envOwner = (env?.OWNER_EMAIL ?? '').toString().trim().toLowerCase();
  if (envOwner && e === envOwner) return 1;
  const h = await sha256Hex(e);
  return OWNER_EMAIL_HASHES.includes(h) ? 1 : 0;
}

// 必填 / 長度校驗，回傳錯誤訊息或 null
export function validateInput(name: string, body: string): string | null {
  const n = name?.toString().trim() ?? '';
  const b = body?.toString().trim() ?? '';
  if (!n || n.length > 60) return 'invalid name';
  if (!b || b.length < 1 || b.length > 2000) return 'invalid body';
  return null;
}
