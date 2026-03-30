-- RemoveBG Pro 用户体系扩展表结构
-- 基于 Auth.js 标准表，添加用户资料、偏好、历史记录等功能

-- 用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  bio TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  language TEXT DEFAULT 'zh-CN',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  -- 背景移除默认设置
  default_output_format TEXT DEFAULT 'png',
  default_quality INTEGER DEFAULT 100,
  auto_download BOOLEAN DEFAULT 0,
  -- 界面设置
  theme TEXT DEFAULT 'light',
  show_tutorial BOOLEAN DEFAULT 1,
  -- 通知设置
  email_notifications BOOLEAN DEFAULT 1,
  newsletter BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 处理历史记录表
CREATE TABLE IF NOT EXISTS processing_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_filename TEXT,
  original_size INTEGER,
  processed_size INTEGER,
  processing_time INTEGER,
  output_format TEXT,
  -- 存储相关
  original_url TEXT,
  processed_url TEXT,
  thumbnail_url TEXT,
  -- 元数据
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_images_processed INTEGER DEFAULT 0,
  total_processing_time INTEGER DEFAULT 0,
  total_bytes_saved INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_processed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS user_profiles_userId_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_preferences_userId_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS processing_history_userId_idx ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS processing_history_createdAt_idx ON processing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS user_stats_userId_idx ON user_stats(user_id);
