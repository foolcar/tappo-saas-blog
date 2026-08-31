-- blog.foolcar.cc 評論區 D1 schema
-- 匯入方式：wrangler d1 execute <DB_NAME> --file=comments-schema.sql --remote

CREATE TABLE IF NOT EXISTS comments (
  id           TEXT PRIMARY KEY,
  thread_key   TEXT NOT NULL,            -- 共享線程鍵（中/英同 slug → 同線程）
  parent_id    TEXT,                     -- NULL = 頂層評論（嵌套回覆）
  author_name  TEXT NOT NULL,            -- 暱稱（必填）
  author_email TEXT,                     -- 郵箱（選填，僅存庫、不公開、v1 不發信）
  body         TEXT NOT NULL,
  locale       TEXT,                     -- 來自 zh / en 入口
  lang         TEXT,                     -- 檢測到的原文語言（供翻譯）
  likes        INTEGER DEFAULT 0,
  is_author    INTEGER DEFAULT 0,        -- 1 = 站長回覆（帶「作者」徽章）
  status       TEXT DEFAULT 'approved',  -- approved / deleted
  created_at   INTEGER NOT NULL,
  ip_hash      TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(thread_key);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- 點讚去重：同 IP 對同一條評論只能算 1 讚
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, ip_hash)
);

-- 翻譯緩存：comment_id + 目標語言
CREATE TABLE IF NOT EXISTS comment_translations (
  comment_id TEXT NOT NULL,
  target     TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, target)
);
