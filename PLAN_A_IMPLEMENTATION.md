# 方案 A：免费额度+历史记录型 - 实施指南

## ✅ 已完成的功能

### 1. 数据库设计
- ✅ `schema-quota.sql` - 用户配额表和访客使用记录表

### 2. 配额管理服务
- ✅ `lib/quota.ts` - 完整的配额管理逻辑
  - 用户月度配额（50次）
  - 访客日配额（3次）
  - 自动重置逻辑
  - 额度检查和使用记录

### 3. API 路由
- ✅ `app/api/usage/check/route.ts` - 检查额度 API
- ✅ `app/api/usage/record/route.ts` - 记录使用 API

### 4. 用户界面
- ✅ `app/page-plan-a.tsx` - 方案 A 的完整主页面
  - 额度指示器
  - 额度不足警告
  - 额度耗尽提示
  - 登录引导

### 5. 方案配置
- ✅ `config/plans.ts` - 方案切换配置

---

## 🎯 如何切换到方案 A

### 方法 1：直接使用方案 A 页面

1. 将 `app/page-plan-a.tsx` 重命名为 `app/page.tsx`
2. 覆盖原有的方案 B 页面

### 方法 2：保持两个方案，通过配置切换

1. 在 `app/page.tsx` 中添加方案切换逻辑
2. 根据 `config/plans.ts` 中的 `CURRENT_PLAN` 决定渲染哪个页面

---

## 📋 方案 A 功能说明

### 未登录用户
- **每天 3 次免费使用**
- 额度指示器显示剩余次数
- 第 3 次使用时显示警告
- 额度耗尽后提示登录或明天再来

### 登录用户
- **每月 50 次免费使用**
- 永久保存历史记录
- 个人统计仪表盘
- 显示下次重置日期
- 额度耗尽后提示下个月再来或升级 Pro

### Pro 会员（可选）
- 无限次数使用
- 优先处理
- 高级模板
- 批量处理
- API 访问

---

## 🔧 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 切换到方案 A
```bash
# 备份原页面
mv app/page.tsx app/page-plan-b.tsx

# 使用方案 A
mv app/page-plan-a.tsx app/page.tsx
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问测试
打开 http://localhost:3000 测试方案 A 的完整功能

---

## 📊 数据库表结构

### user_quotas（用户配额表）
```sql
CREATE TABLE user_quotas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  monthly_quota INTEGER DEFAULT 50,
  monthly_used INTEGER DEFAULT 0,
  quota_reset_date INTEGER,
  total_used INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);
```

### guest_usage（访客使用记录表）
```sql
CREATE TABLE guest_usage (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE(identifier, date)
);
```

---

## 🎨 UI/UX 特性

### 额度指示器
- 紫色渐变背景（正常状态）
- 黄色背景（剩余 1 次警告）
- 红色背景（额度耗尽）

### 智能提示
- 剩余 1 次时：显示警告，引导登录
- 额度耗尽时：显示错误，提供解决方案
- 登录用户：显示月度配额和重置时间

### 用户旅程
```
访客 → 第1次使用 → 第2次使用 → 第3次（警告）→ 额度耗尽
                                    ↓
                                引导登录
                                    ↓
                          登录用户（每月50次）
```

---

## 💡 商业扩展建议

### Pro 会员定价
| 方案 | 价格 | 权益 |
|------|------|------|
| 免费 | $0 | 登录用户每月50次 |
| Pro | $4.99/月 | 无限次数 + 优先处理 + 高级模板 |
| Pro+ | $9.99/月 | 所有 Pro 功能 + 批量处理 + API 访问 |

### 优化建议
1. 根据用户反馈调整额度
2. A/B 测试不同的定价策略
3. 提供周/月/年订阅选项
4. 节假日活动增加临时额度

---

## 🚀 部署到生产

### 1. 切换方案 A 页面
```bash
cd /path/to/removebg-pro-next
mv app/page.tsx app/page-plan-b.tsx
mv app/page-plan-a.tsx app/page.tsx
```

### 2. 提交代码
```bash
git add .
git commit -m "feat: 实施方案 A - 免费额度+历史记录型"
git push
```

### 3. 部署到 Cloudflare Pages / Vercel
按照之前的部署步骤操作即可

---

## 📝 注意事项

1. **当前使用内存存储** - 生产环境建议接入真实数据库
2. **访客识别** - 当前使用简单的 IP/设备识别，生产环境建议更精准的方案
3. **额度重置** - 每月 1 号自动重置，可根据需要调整
4. **数据持久化** - 建议使用 PostgreSQL/MySQL 等数据库

---

## ✅ 完成！

方案 A 已经完整实现，可以立即使用！🎉
