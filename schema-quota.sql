-- RemoveBG Pro 方案 A：免费额度+历史记录型
-- 用户使用配额表

CREATE TABLE IF NOT EXISTS user_quotas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  monthly_quota INTEGER DEFAULT 50,
  monthly_used INTEGER DEFAULT 0,
  quota_reset_date INTEGER,
  total_used INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 未登录用户使用记录（基于 IP/设备）
CREATE TABLE IF NOT EXISTS guest_usage (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(identifier, date)
);

-- 索引
CREATE INDEX IF NOT EXISTS user_quotas_userId_idx ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS guest_usage_identifier_date_idx ON guest_usage(identifier, date);
