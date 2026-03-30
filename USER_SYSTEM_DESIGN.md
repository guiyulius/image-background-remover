# RemoveBG Pro 用户体系设计文档

## 📋 概述

为 RemoveBG Pro 设计一套完整的用户体系，包括个人中心、使用历史、偏好设置等功能。

---

## 🎯 核心功能模块

### 1. 用户个人中心（Dashboard）
### 2. 使用历史记录
### 3. 用户偏好设置
### 4. 账户管理
### 5. 统计数据

---

## 🗄️ 数据库设计

### 扩展表结构（基于 Auth.js 标准表）

```sql
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
  default_output_format TEXT DEFAULT 'png', -- png, webp, jpg
  default_quality INTEGER DEFAULT 100, -- 1-100
  auto_download BOOLEAN DEFAULT 0,
  -- 界面设置
  theme TEXT DEFAULT 'light', -- light, dark, system
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
  original_size INTEGER, -- bytes
  processed_size INTEGER, -- bytes
  processing_time INTEGER, -- milliseconds
  output_format TEXT,
  -- 存储相关（可选，根据实际存储方案）
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
  total_processing_time INTEGER DEFAULT 0, -- milliseconds
  total_bytes_saved INTEGER DEFAULT 0, -- 累计节省的存储空间（可选）
  streak_days INTEGER DEFAULT 0, -- 连续使用天数
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
```

---

## 🌐 页面路由设计

```
/app
  /dashboard              # 个人中心首页
  /history                # 处理历史
  /settings               # 设置
    /profile              # 个人资料
    /preferences          # 偏好设置
    /account              # 账户管理
  /api
    /user
      /profile            # GET/PUT 用户资料
      /preferences        # GET/PUT 用户偏好
      /stats              # GET 用户统计
    /history
      /route.ts           # GET 历史列表
      /[id]
        /route.ts         # GET/DELETE 单条记录
```

---

## 🎨 UI/UX 设计

### 1. 个人中心（Dashboard）

**功能：**
- 欢迎横幅 + 用户头像
- 快速统计卡片
- 最近处理记录（最近 5 条）
- 快捷操作按钮

**设计：**
```
┌─────────────────────────────────────────────────────────┐
│  👋 欢迎回来，张三！                    [查看全部历史] │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  128     │ │  2h 34m  │ │  7 天    │ │  256 MB  │ │
│  │ 张图片   │ │ 总耗时   │ │ 连续使用 │ │  处理量   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                           │
│  最近处理记录：                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📷 product.jpg  │ 2分钟前  │ PNG  │ 2.4 MB  │ │
│  │ 📷 avatar.png   │ 1小时前  │ PNG  │ 856 KB  │ │
│  │ ...                                             │ │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  [上传新图片]  [查看全部历史]  [前往设置]                │
└─────────────────────────────────────────────────────────┘
```

### 2. 处理历史页面

**功能：**
- 时间线视图展示所有处理记录
- 筛选和搜索
- 批量操作（删除、下载）
- 分页加载

**设计：**
```
┌─────────────────────────────────────────────────────────┐
│  📋 处理历史                              [筛选] [搜索] │
│                                                           │
│  2026年3月                                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [缩略图]                                          │  │
│  │ 文件名：product_photo.jpg                         │  │
│  │ 处理时间：2026-03-30 14:32:15                    │  │
│  │ 耗时：1.2s  │ 格式：PNG  │ 大小：2.4 MB → 856 KB│  │
│  │ [下载] [查看详情] [删除]                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  [加载更多]                                               │
└─────────────────────────────────────────────────────────┘
```

### 3. 设置页面

**分为三个子页面：**

#### 3.1 个人资料
- 头像（可上传）
- 用户名
- 个人简介
- 网站链接
- 时区设置
- 语言设置

#### 3.2 偏好设置
- **输出设置：**
  - 默认输出格式（PNG/WebP/JPG）
  - 默认质量
  - 自动下载开关
  
- **界面设置：**
  - 主题（浅色/深色/跟随系统）
  - 显示新手引导
  
- **通知设置：**
  - 邮件通知
  - 订阅 newsletter

#### 3.3 账户管理
- 关联账户（Google、GitHub 等）
- 修改密码（如果支持邮箱登录）
- 导出数据
- 删除账户

---

## 🔌 API 接口设计

### 用户资料

```typescript
// GET /api/user/profile
// Response:
{
  id: string
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  bio: string | null
  website: string | null
  timezone: string
  language: string
  createdAt: number
}

// PUT /api/user/profile
// Body:
{
  username?: string
  bio?: string
  website?: string
  timezone?: string
  language?: string
}
```

### 用户偏好

```typescript
// GET /api/user/preferences
// Response:
{
  defaultOutputFormat: 'png' | 'webp' | 'jpg'
  defaultQuality: number
  autoDownload: boolean
  theme: 'light' | 'dark' | 'system'
  showTutorial: boolean
  emailNotifications: boolean
  newsletter: boolean
}

// PUT /api/user/preferences
// Body:
{
  defaultOutputFormat?: 'png' | 'webp' | 'jpg'
  defaultQuality?: number
  autoDownload?: boolean
  theme?: 'light' | 'dark' | 'system'
  showTutorial?: boolean
  emailNotifications?: boolean
  newsletter?: boolean
}
```

### 用户统计

```typescript
// GET /api/user/stats
// Response:
{
  totalImagesProcessed: number
  totalProcessingTime: number
  streakDays: number
  lastProcessedAt: number | null
}
```

### 处理历史

```typescript
// GET /api/history?page=1&limit=20
// Response:
{
  items: Array<{
    id: string
    originalFilename: string
    originalSize: number
    processedSize: number
    processingTime: number
    outputFormat: string
    thumbnailUrl: string | null
    createdAt: number
  }>
  total: number
  page: number
  limit: number
}

// DELETE /api/history/[id]
// Response: { success: boolean }
```

---

## 🎯 实施优先级

### Phase 1: 核心功能（MVP）
1. ✅ 数据库表设计
2. ✅ 个人中心 Dashboard（统计 + 最近记录）
3. ✅ 处理历史列表页面
4. ✅ 基础 API 接口

### Phase 2: 增强功能
5. 用户偏好设置
6. 个人资料编辑
7. 历史记录详情页
8. 批量操作

### Phase 3: 高级功能
9. 数据导出
10. 深色主题
11. 成就系统
12. 更多统计图表

---

## 📝 备注

- **存储方案：** 处理后的图片可以存储在 Cloudflare R2、AWS S3 或其他对象存储
- **图片保留策略：** 免费用户保留 30 天，付费用户永久保留（可选）
- **性能优化：** 历史记录使用分页加载，缩略图预生成
