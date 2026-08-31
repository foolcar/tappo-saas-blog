import { useState, useEffect, useRef } from 'react';

type Locale = 'zh-Hant' | 'en';

interface RawComment {
  id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  locale: string;
  lang: string;
  likes: number;
  is_author: number;
  created_at: number;
}

interface CommentNode extends RawComment {
  children: CommentNode[];
  depth: number;
}

type SortMode = 'newest' | 'oldest' | 'popular';

const COPY: Record<Locale, any> = {
  'zh-Hant': {
    title: '評論',
    sortNewest: '最新',
    sortOldest: '最早',
    sortPopular: '熱度',
    count: (n: number) => `${n} 條評論`,
    name: '暱稱',
    email: '郵箱（選填，不公開）',
    body: '說點什麼…',
    submit: '發表',
    reply: '回覆',
    cancel: '取消',
    like: '讚',
    showOriginal: '顯示原文',
    translate: '翻譯',
    translateAll: '翻譯全部',
    showReplies: (n: number) => `展開 ${n} 條回覆`,
    hideReplies: '收起',
    empty: '還沒有評論，來留第一條吧。',
    loading: '載入中…',
    error: '評論載入失敗，請稍後再試。',
    disabled: '評論功能暫未開放。',
    rules: '請署名、就事論事；惡意與廣告內容將被移除。',
    submitting: '送出中…',
    required: '請填寫暱稱與內容',
    replyTo: (n: string) => `回覆 ${n}`,
    authorBadge: '作者',
  },
  en: {
    title: 'Comments',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortPopular: 'Top',
    count: (n: number) => `${n} comment${n === 1 ? '' : 's'}`,
    name: 'Name',
    email: 'Email (optional, private)',
    body: 'Say something…',
    submit: 'Post',
    reply: 'Reply',
    cancel: 'Cancel',
    like: 'Like',
    showOriginal: 'Show original',
    translate: 'Translate',
    translateAll: 'Translate all',
    showReplies: (n: number) => `Show ${n} replies`,
    hideReplies: 'Hide',
    empty: 'No comments yet. Be the first.',
    loading: 'Loading…',
    error: 'Failed to load comments. Please try again later.',
    disabled: 'Comments are not open right now.',
    rules: 'Please use your name and stay on topic; abusive or spammy content will be removed.',
    submitting: 'Posting…',
    required: 'Name and comment are required',
    replyTo: (n: string) => `Reply to ${n}`,
    authorBadge: 'Author',
  },
};

function buildTree(flat: RawComment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));
  const roots: CommentNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const setDepth = (n: CommentNode, d: number) => {
    n.depth = d;
    n.children.forEach((c) => setDepth(c, d + 1));
  };
  roots.forEach((r) => setDepth(r, 1));
  return roots;
}

function countDesc(node: CommentNode): number {
  return node.children.reduce((s, c) => s + 1 + countDesc(c), 0);
}

function sortRoots(roots: CommentNode[], mode: SortMode): CommentNode[] {
  const arr = [...roots];
  if (mode === 'newest') arr.sort((a, b) => b.created_at - a.created_at);
  else if (mode === 'popular') arr.sort((a, b) => b.likes - a.likes || b.created_at - a.created_at);
  else arr.sort((a, b) => a.created_at - b.created_at);
  return arr;
}

function getCookie(n: string): string {
  const m = document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : '';
}
function setCookie(n: string, v: string): void {
  document.cookie = `${n}=${encodeURIComponent(v)}; path=/; max-age=31536000; samesite=lax`;
}

function fmtDate(ts: number, locale: Locale): string {
  const d = new Date(ts);
  return d.toLocaleString(locale === 'en' ? 'en-US' : 'zh-Hant', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Comments({ threadKey, locale = 'zh-Hant' }: { threadKey: string; locale?: Locale }) {
  const t = COPY[locale];
  const pageLang = locale === 'en' ? 'en' : 'zh';

  const [roots, setRoots] = useState<CommentNode[]>([]);
  const [flat, setFlat] = useState<RawComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [mode, setMode] = useState<SortMode>('newest');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showTr, setShowTr] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const refName = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = getCookie('comments_liked');
      if (raw) setLikedIds(new Set(JSON.parse(raw)));
    } catch {}
    const n = getCookie('comments_name');
    const e = getCookie('comments_email');
    if (n) setName(n);
    if (e) setEmail(e);
    // eslint-disable-next-line
  }, []);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/comments?thread=${encodeURIComponent(threadKey)}`);
      if (res.status === 503) {
        // 只有明確關閉才顯示「暫未開放」；DB 未綁定等配置問題歸為可重試錯誤
        try {
          const d = await res.json();
          if (d.error === 'disabled') {
            setDisabled(true);
            setLoading(false);
            return;
          }
        } catch {}
        setError(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list: RawComment[] = data.comments || [];
      setFlat(list);
      setRoots(buildTree(list));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [threadKey]);

  async function postComment(payload: { parent_id?: string | null; name: string; email: string; content: string }) {
    setSubmitting(true);
    setMsg('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          thread: threadKey,
          parent_id: payload.parent_id ?? null,
          name: payload.name,
          email: payload.email,
          content: payload.content,
          locale: pageLang,
          website: '', // 蜜罐，永遠留空
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg(d.error === 'rate limited' ? (locale === 'en' ? 'Too many comments, slow down.' : '發表太頻繁，請稍後再試。') : t.required);
        return false;
      }
      setCookie('comments_name', payload.name);
      setCookie('comments_email', payload.email);
      await load();
      return true;
    } catch {
      setMsg(t.error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLike(id: string) {
    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ comment_id: id }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setFlat((prev) => prev.map((c) => (c.id === id ? { ...c, likes: data.likes } : c)));
      setRoots((prev) => rebuildLikes(prev, id, data.likes));
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(id);
        else next.delete(id);
        try {
          setCookie('comments_liked', JSON.stringify([...next]));
        } catch {}
        return next;
      });
    } catch {}
  }

  function rebuildLikes(nodes: CommentNode[], id: string, likes: number): CommentNode[] {
    return nodes.map((n) => ({
      ...n,
      likes: n.id === id ? likes : n.likes,
      children: rebuildLikes(n.children, id, likes),
    }));
  }

  async function translate(id: string) {
    if (!translations[id]) {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ comment_id: id, target: pageLang }),
        });
        const data = await res.json();
        if (data.translated) {
          setTranslations((p) => ({ ...p, [id]: data.translated }));
        }
      } catch {
        return;
      }
    }
    setShowTr((p) => {
      const next = new Set(p);
      next.add(id);
      return next;
    });
  }

  async function translateAll() {
    const ids = flat.filter((c) => c.lang !== pageLang).map((c) => c.id);
    await Promise.all(
      ids.map(async (id) => {
        if (!translations[id]) {
          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ comment_id: id, target: pageLang }),
            });
            const data = await res.json();
            if (data.translated) setTranslations((p) => ({ ...p, [id]: data.translated }));
          } catch {}
        }
      })
    );
    setShowTr(new Set(ids));
  }

  function toggleExpand(id: string) {
    setExpanded((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function renderNode(node: CommentNode) {
    // 第 4 層以下由 depth-3 祖先的展開開關控制；祖先未展開則隱藏
    if (node.depth > 3 && !expanded.has(ancestorDepth3(node))) return null;

    const displayBody = showTr.has(node.id) && translations[node.id] ? translations[node.id] : node.body;
    const showTranslateBtn = node.lang !== pageLang;
    const liked = likedIds.has(node.id);

    return (
      <div key={node.id} className={node.depth > 1 ? 'mt-3 pl-4 border-l border-gray-200' : 'mt-4'}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{node.author_name}</span>
              {node.is_author === 1 && (
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {t.authorBadge}
                </span>
              )}
              <span className="text-xs text-gray-400">{fmtDate(node.created_at, locale)}</span>
            </div>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">{displayBody}</p>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-500">
              <button
                className={`hover:text-blue-600 ${liked ? 'text-blue-600' : ''}`}
                onClick={() => toggleLike(node.id)}
                aria-label={t.like}
              >
                👍 {node.likes > 0 ? node.likes : ''} {liked ? '· ' + t.like : ''}
              </button>
              <button className="hover:text-blue-600" onClick={() => setReplyingTo(replyingTo === node.id ? null : node.id)}>
                {replyingTo === node.id ? t.cancel : t.reply}
              </button>
              {showTranslateBtn && (
                showTr.has(node.id) && translations[node.id] ? (
                  <button className="hover:text-blue-600" onClick={() => setShowTr((p) => { const n = new Set(p); n.delete(node.id); return n; })}>
                    {t.showOriginal}
                  </button>
                ) : (
                  <button className="hover:text-blue-600" onClick={() => translate(node.id)}>{t.translate}</button>
                )
              )}
            </div>

            {replyingTo === node.id && (
              <CommentForm
                locale={locale}
                name={name}
                email={email}
                setName={setName}
                setEmail={setEmail}
                parentId={node.id}
                autoFocus
                submitting={submitting}
                onCancel={() => setReplyingTo(null)}
                onSubmit={async (p) => {
                  const ok = await postComment(p);
                  if (ok) setReplyingTo(null);
                }}
              />
            )}
          </div>
        </div>

        {/* 子回覆：depth<3 直接展開；depth===3 由開關控制；depth>3 繼承祖先開關 */}
        {(() => {
          if (node.depth < 3) {
            return node.children.map((c) => renderNode(c));
          }
          if (node.depth === 3) {
            if (expanded.has(node.id)) return node.children.map((c) => renderNode(c));
            const n = countDesc(node);
            if (n > 0)
              return (
                <button key={'exp-' + node.id} className="mt-2 text-sm text-blue-600 hover:underline" onClick={() => toggleExpand(node.id)}>
                  {t.showReplies(n)}
                </button>
              );
            return null;
          }
          // depth > 3：此分支在上方已過濾（祖先未展開則 return null），到這裡必為展開狀態
          return node.children.map((c) => renderNode(c));
        })()}
      </div>
    );
  }

  // 找該節點的 depth-3 祖先 id（用於判斷是否應隱藏第 4 層以下）
  function ancestorDepth3(node: CommentNode): string {
    // flat 建樹時深度已知，但這裡簡化：往上追溯 parent_id
    let cur = node;
    while (cur && cur.depth > 3 && cur.parent_id) {
      const p = flat.find((c) => c.id === cur.parent_id);
      if (!p) break;
      cur = p as any;
    }
    return cur.id;
  }

  const total = flat.length;
  const sortedRoots = sortRoots(roots, mode);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200" aria-label={t.title}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t.title} <span className="text-base font-normal text-gray-400">· {t.count(total)}</span>
        </h2>
        <div className="flex items-center gap-2">
          {flat.some((c) => c.lang !== pageLang) && (
            <button className="text-sm text-gray-500 hover:text-blue-600" onClick={translateAll}>
              {t.translateAll}
            </button>
          )}
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['newest', 'oldest', 'popular'] as SortMode[]).map((m) => (
              <button
                key={m}
                className={`px-3 py-1.5 ${mode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setMode(m)}
              >
                {m === 'newest' ? t.sortNewest : m === 'oldest' ? t.sortOldest : t.sortPopular}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 頂層發表框 */}
      <CommentForm
        locale={locale}
        name={name}
        email={email}
        setName={setName}
        setEmail={setEmail}
        parentId={null}
        submitting={submitting}
        onSubmit={async (p) => {
          await postComment(p);
        }}
      />

      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}

      <p className="mt-3 text-xs text-gray-400">{t.rules}</p>

      <div className="mt-6">
        {loading && <p className="text-gray-400 text-sm">{t.loading}</p>}
        {!loading && error && <p className="text-gray-400 text-sm">{t.error}</p>}
        {!loading && disabled && <p className="text-gray-400 text-sm">{t.disabled}</p>}
        {!loading && !error && !disabled && total === 0 && <p className="text-gray-400 text-sm">{t.empty}</p>}
        {!loading && !error && !disabled && sortedRoots.map((n) => renderNode(n))}
      </div>
    </section>
  );
}

interface FormProps {
  locale: Locale;
  name: string;
  email: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  parentId: string | null;
  autoFocus?: boolean;
  submitting: boolean;
  onCancel?: () => void;
  onSubmit: (p: { parent_id?: string | null; name: string; email: string; content: string }) => Promise<void>;
}

function CommentForm({ locale, name, email, setName, setEmail, parentId, autoFocus, submitting, onCancel, onSubmit }: FormProps) {
  const t = COPY[locale];
  const [content, setContent] = useState('');

  async function submit() {
    if (!name.trim() || !content.trim()) return;
    await onSubmit({ parent_id: parentId, name: name.trim(), email: email.trim(), content: content.trim() });
    setContent('');
  }

  return (
    <div className={parentId ? 'mt-3 pl-4 border-l border-gray-200' : 'bg-gray-50 rounded-xl p-4'}>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          className="flex-1 sm:w-40 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="flex-1 sm:w-56 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <textarea
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y min-h-[72px]"
        placeholder={t.body}
        value={content}
        autoFocus={autoFocus}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? t.submitting : parentId ? t.reply : t.submit}
        </button>
        {onCancel && (
          <button className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700" onClick={onCancel}>
            {t.cancel}
          </button>
        )}
      </div>
    </div>
  );
}
