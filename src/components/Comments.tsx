import { AdminGate, CommentThread, type Locale } from '../lib/comments-core';

export default function Comments({ threadKey, locale = 'zh-Hant' }: { threadKey: string; locale?: Locale }) {
  return (
    <AdminGate locale={locale}>
      {({ isAdmin, adminToken }) => (
        <CommentThread threadKey={threadKey} locale={locale} isAdmin={isAdmin} adminToken={adminToken} />
      )}
    </AdminGate>
  );
}
