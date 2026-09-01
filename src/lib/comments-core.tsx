import { useState, useEffect, useRef, type ReactNode, type FormEvent } from 'react';

export type Locale = 'zh-Hant' | 'en';

export interface RawComment {
  id: string;
  thread_key?: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  locale: string;
  lang: string;
  likes: number;
  is_author: number;
  created_at: number;
}

export interface CommentNode extends RawComment {
  children: CommentNode[];
  depth: number;
}

export type SortMode = 'newest' | 'oldest' | 'popular';

export const COPY: Record<Locale, any> = {
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
    delete: '刪除',
    deleteConfirm: '確定刪除這條評論及其所有回覆？',
    unauthorized: '只有站長可以刪除評論',
    adminTokenPlaceholder: '管理員密碼',
    adminSignedIn: '管理員已登入',
    adminSignOut: '登出',
    adminInvalid: '密碼錯誤',
    adminVerify: '驗證',
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
    delete: 'Delete',
    deleteConfirm: 'Delete this comment and all its replies?',
    unauthorized: 'Only the site owner can delete comments',
    adminTokenPlaceholder: 'Admin password',
    adminSignedIn: 'Admin signed in',
    adminSignOut: 'Sign out',
    adminInvalid: 'Invalid password',
    adminVerify: 'Verify',
  },
};

export function buildTree(flat: RawComment[]): CommentNode[] {
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

export function countDesc(node: CommentNode): number {
  return node.children.reduce((s, c) => s + 1 + countDesc(c), 0);
}

export function sortRoots(roots: CommentNode[], mode: SortMode): CommentNode[] {
  const arr = [...roots];
  if (mode === 'newest') arr.sort((a, b) => b.created_at - a.created_at);
  else if (mode === 'popular') arr.sort((a, b) => b.likes - a.likes || b.created_at - a.created_at);
  else arr.sort((a, b) => a.created_at - b.created_at);
  return arr;
}

export function getCookie(n: string): string {
  const m = document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : '';
}
export function setCookie(n: string, v: string): void {
  document.cookie = `${n}=${encodeURIComponent(v)}; path=/; max-age=31536000; samesite=lax`;
}

export function fmtDate(ts: number, locale: Locale): string {
  const d = new Date(ts);
  return d.toLocaleString(locale === 'en' ? 'en-US' : 'zh-Hant', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getAncestorIds(flat: RawComment[], id: string): string[] {
  const ids: string[] = [];
  let cur = flat.find((c) => c.id === id);
  while (cur && cur.parent_id) {
    const p = flat.find((c) => c.id === cur!.parent_id);
    if (!p) break;
    ids.push(p.id);
    cur = p;
  }
  return ids;
}

export function findDepth3Ancestor(roots: CommentNode[], nodeId: string): string | null {
  const search = (nodes: CommentNode[], targetId: string, path: CommentNode[]): string | null => {
    for (const n of nodes) {
      if (n.id === targetId) {
        for (const p of path) {
          if (p.depth === 3) return p.id;
        }
        return null;
      }
      if (n.children.length > 0) {
        const found = search(n.children, targetId, [...path, n]);
        if (found) return found;
      }
    }
    return null;
  };
  return search(roots, nodeId, []);
}

interface CommentThreadProps {
  threadKey: string;
  locale?: Locale;
  isAdmin?: boolean;
  adminToken?: string;
  initialFlat?: RawComment[];
  showTitle?: boolean;
}

export function CommentThread({
  threadKey,
  locale = 'zh-Hant',
  isAdmin = false,
  adminToken = '',
  initialFlat,
  showTitle = true,
}: CommentThreadProps) {
  const t = COPY[locale];
  const pageLang = locale === 'en' ? 'en' : 'zh';

  const [roots, setRoots] = useState<CommentNode[]>(initialFlat ? buildTree(initialFlat) : []);
  const [flat, setFlat] = useState<RawComment[]>(initialFlat ? initialFlat : []);
  const [loading, setLoading] = useState(initialFlat ? false : true);
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
    if (initialFlat !== undefined) return; // 已由上層（合併頁）提供資料
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
      const postData = await res.json();
      setCookie('comments_name', payload.name);
      setCookie('comments_email', payload.email);

      const now = Date.now();
      const newComment: RawComment = {
        id: postData.id || crypto.randomUUID(),
        parent_id: payload.parent_id ?? null,
        author_name: payload.name,
        body: payload.content,
        locale: pageLang,
        lang: postData.lang || pageLang,
        likes: 0,
        is_author: postData.is_author || 0,
        created_at: now,
      };
      setFlat((prev) => {
        const next = [...prev, newComment];
        setRoots(buildTree(next));
        return next;
      });

      load().catch(() => {});
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

  async function deleteComment(id: string) {
    if (typeof window !== 'undefined' && !window.confirm(t.deleteConfirm)) return;
    try {
      const res = await fetch('/api/comments/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, token: adminToken }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg(d.error === 'unauthorized' ? t.unauthorized : t.error);
        return;
      }
      const toRemove = new Set<string>();
      const collect = (pid: string) => {
        toRemove.add(pid);
        flat.filter((c) => c.parent_id === pid).forEach((c) => collect(c.id));
      };
      collect(id);
      setFlat((prev) => prev.filter((c) => !toRemove.has(c.id)));
      setRoots(buildTree(flat.filter((c) => !toRemove.has(c.id))));
    } catch {
      setMsg(t.error);
    }
  }

  function renderNode(node: CommentNode) {
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
              <button className="hover:text-blue-600" onClick={() => startReply(node.id)}>
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
              {isAdmin && (
                <button className="hover:text-red-600" onClick={() => deleteComment(node.id)}>
                  {t.delete}
                </button>
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

        {(() => {
          if (node.depth < 3) {
            return node.children.map((c) => renderNode(c));
          }
          if (node.depth === 3) {
            if (expanded.has(node.id)) {
              return (
                <>
                  {node.children.map((c) => renderNode(c))}
                  <button
                    key={'col-' + node.id}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                    onClick={() => toggleExpand(node.id)}
                  >
                    {t.hideReplies}
                  </button>
                </>
              );
            }
            const n = countDesc(node);
            if (n > 0)
              return (
                <button key={'exp-' + node.id} className="mt-2 text-sm text-blue-600 hover:underline" onClick={() => toggleExpand(node.id)}>
                  {t.showReplies(n)}
                </button>
              );
            return null;
          }
          const d3ancestor = findDepth3Ancestor(roots, node.id);
          if (d3ancestor && expanded.has(d3ancestor)) {
            return node.children.map((c) => renderNode(c));
          }
          return null;
        })()}
      </div>
    );
  }

  function startReply(id: string) {
    const anc = getAncestorIds(flat, id);
    setExpanded((prev) => {
      const next = new Set(prev);
      anc.forEach((a) => next.add(a));
      return next;
    });
    setReplyingTo(replyingTo === id ? null : id);
  }

  const total = flat.length;
  const sortedRoots = sortRoots(roots, mode);

  return (
    <section aria-label={t.title}>
      {showTitle && (
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
      )}

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
  const formRef = useRef<HTMLDivElement>(null);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!name.trim() || !content.trim()) return;
    await onSubmit({ parent_id: parentId, name: name.trim(), email: email.trim(), content: content.trim() });
    setContent('');
  }

  useEffect(() => {
    if (parentId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line
  }, [parentId]);

  return (
    <div ref={formRef} className={parentId ? 'mt-3 pl-4 border-l border-gray-200' : 'bg-gray-50 rounded-xl p-4'}>
      <form onSubmit={submit} autoComplete="on">
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            id="comment-name"
            name="name"
            className="flex-1 sm:w-40 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            id="comment-email"
            name="email"
            type="email"
            autoComplete="email"
            className="flex-1 sm:w-56 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <textarea
          id="comment-body"
          name="body"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y min-h-[72px]"
          placeholder={t.body}
          value={content}
          autoFocus={autoFocus}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? t.submitting : parentId ? t.reply : t.submit}
          </button>
          {onCancel && (
            <button type="button" className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700" onClick={onCancel}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export interface AdminState {
  isAdmin: boolean;
  adminToken: string;
}

export function AdminGate({
  locale = 'zh-Hant',
  children,
}: {
  locale: Locale;
  children: (a: AdminState) => ReactNode;
}) {
  const t = COPY[locale];
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [adminInput, setAdminInput] = useState('');
  const [adminChecking, setAdminChecking] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    const saved = getCookie('comments_admin_token');
    if (!saved) return;
    let cancelled = false;
    fetch('/api/comments/admin-verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: saved }),
    })
      .then((r) => r.json())
      .then((d: any) => {
        if (!cancelled && d.ok) {
          setAdminToken(saved);
          setIsAdmin(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, []);

  async function verifyAdmin() {
    const tk = adminInput.trim();
    if (!tk) return;
    setAdminChecking(true);
    setAdminMsg('');
    try {
      const res = await fetch('/api/comments/admin-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: tk }),
      });
      const d = await res.json();
      if (d.ok) {
        setAdminToken(tk);
        setIsAdmin(true);
        setCookie('comments_admin_token', tk);
        setAdminInput('');
      } else {
        setAdminMsg(t.adminInvalid);
        setIsAdmin(false);
      }
    } catch {
      setAdminMsg(t.error);
    } finally {
      setAdminChecking(false);
    }
  }

  function logoutAdmin() {
    setAdminToken('');
    setIsAdmin(false);
    setAdminInput('');
    try {
      document.cookie = 'comments_admin_token=; path=/; max-age=0; samesite=lax';
    } catch {}
  }

  return (
    <>
      <div className="mb-4 text-sm">
        {isAdmin ? (
          <span className="text-green-600">
            {t.adminSignedIn} ·{' '}
            <button type="button" className="underline hover:text-green-700" onClick={logoutAdmin}>
              {t.adminSignOut}
            </button>
          </span>
        ) : (
          <details>
            <summary className="cursor-pointer text-gray-500 hover:text-blue-600 select-none">
              🔧 {locale === 'en' ? 'Admin' : '管理員'}
            </summary>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="password"
                name="admin_token"
                autoComplete="off"
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder={t.adminTokenPlaceholder}
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') verifyAdmin();
                }}
              />
              <button
                type="button"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={adminChecking}
                onClick={verifyAdmin}
              >
                {adminChecking ? t.submitting : t.adminVerify}
              </button>
            </div>
            {adminMsg && <p className="mt-1 text-red-600">{adminMsg}</p>}
          </details>
        )}
      </div>
      {children({ isAdmin, adminToken })}
    </>
  );
}
