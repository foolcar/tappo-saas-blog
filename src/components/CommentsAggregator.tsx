import { useState, useEffect } from 'react';
import {
  AdminGate,
  CommentThread,
  COPY,
  fmtDate,
  type Locale,
  type RawComment,
} from '../lib/comments-core';

export interface ThreadMeta {
  title: string;
  url: string;
}

interface Group {
  threadKey: string;
  title: string;
  url: string;
  flat: RawComment[];
  latest: number;
  count: number;
}

function buildGroups(all: RawComment[], threadMeta: Record<string, ThreadMeta>): Group[] {
  const byThread = new Map<string, RawComment[]>();
  for (const c of all) {
    const k = c.thread_key || 'unknown';
    if (!byThread.has(k)) byThread.set(k, []);
    byThread.get(k)!.push(c);
  }
  const gs: Group[] = [];
  byThread.forEach((flat, threadKey) => {
    const meta = threadMeta[threadKey] || { title: threadKey, url: '' };
    const latest = flat.reduce((m, c) => Math.max(m, c.created_at), 0);
    gs.push({ threadKey, title: meta.title, url: meta.url, flat, latest, count: flat.length });
  });
  gs.sort((a, b) => b.latest - a.latest);
  return gs;
}

function AggregatorBody({
  locale,
  isAdmin,
  adminToken,
  threadMeta,
}: {
  locale: Locale;
  isAdmin: boolean;
  adminToken: string;
  threadMeta: Record<string, ThreadMeta>;
}) {
  const t = COPY[locale];
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  async function fetchAll() {
    if (!adminToken) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/comments/all', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: adminToken }),
      });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setGroups(buildGroups(data.comments || [], threadMeta));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin && adminToken) fetchAll();
    else setGroups([]);
    // eslint-disable-next-line
  }, [isAdmin, adminToken]);

  function toggleCollapse(k: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  if (!isAdmin) {
    return (
      <p className="text-gray-400 text-sm">
        {locale === 'en' ? 'Sign in as admin to view all comments.' : '請以管理員身分登入，檢視所有文章的評論。'}
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {groups.length} {locale === 'en' ? 'threads' : '個討論串'}
        </span>
        <button className="text-sm text-blue-600 hover:underline" onClick={fetchAll} disabled={loading}>
          {locale === 'en' ? 'Refresh' : '重新整理'}
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">{t.loading}</p>}
      {error && <p className="text-gray-400 text-sm">{t.error}</p>}
      {!loading && !error && groups.length === 0 && (
        <p className="text-gray-400 text-sm">{locale === 'en' ? 'No comments yet.' : '尚無評論。'}</p>
      )}

      {groups.map((g) => {
        const isCollapsed = collapsed.has(g.threadKey);
        return (
          <div key={g.threadKey} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  onClick={() => toggleCollapse(g.threadKey)}
                  aria-label={isCollapsed ? 'expand' : 'collapse'}
                >
                  {isCollapsed ? '▸' : '▾'}
                </button>
                {g.url ? (
                  <a className="font-medium text-gray-900 truncate hover:text-blue-600" href={g.url}>
                    {g.title}
                  </a>
                ) : (
                  <span className="font-medium text-gray-900 truncate">{g.title}</span>
                )}
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {g.count} {locale === 'en' ? 'comments' : '條'}
                </span>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(g.latest, locale)}</span>
            </div>
            {!isCollapsed && (
              <div className="px-4 py-3">
                <CommentThread
                  threadKey={g.threadKey}
                  locale={locale}
                  isAdmin={isAdmin}
                  adminToken={adminToken}
                  initialFlat={g.flat}
                  showTitle={false}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CommentsAggregator({
  locale = 'zh-Hant',
  threadMeta = {},
}: {
  locale?: Locale;
  threadMeta?: Record<string, ThreadMeta>;
}) {
  return (
    <AdminGate locale={locale}>
      {({ isAdmin, adminToken }) => (
        <AggregatorBody locale={locale} isAdmin={isAdmin} adminToken={adminToken} threadMeta={threadMeta} />
      )}
    </AdminGate>
  );
}
