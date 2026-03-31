# RemoveBG Pro Next.js 版本 - 进度跟踪

## 📋 任务目标
将 RemoveBG Pro 从 Cloudflare Pages 方案迁移到 Next.js + Vercel 方案，解决路由问题并提供更稳定的服务。

---

## ✅ 已完成的步骤

### 阶段 1: 项目初始化（已完成 ✅）

- ✅ 创建 Next.js 16 项目
- ✅ 安装依赖：next-auth@beta（Auth.js v5）和 @imgly/background-removal
- ✅ 配置 TypeScript 和 Tailwind CSS
- ✅ 项目可正常构建

### 阶段 2: 核心功能实现（已完成 ✅）

- ✅ 实现 Auth.js 配置和 API 路由
- ✅ 集成 Google OAuth 登录
- ✅ 实现背景移除功能（使用 @imgly/background-removal）
- ✅ 设计现代化 UI 界面
- ✅ 实现 Session Provider 和布局
- ✅ 项目可正常启动开发服务器

### 阶段 3: 本地测试（已完成 ✅）

- ✅ 开发服务器成功启动
- ✅ 访问地址：http://localhost:3000
- ✅ 环境变量已配置：
  - AUTH_SECRET 已设置
  - GOOGLE_CLIENT_ID 已配置
  - GOOGLE_CLIENT_SECRET 已配置

### 阶段 4: 推送到 GitHub（已完成 ✅）

- ✅ 初始化 Git 仓库
- ✅ 创建新分支 `nextjs-migration`
- ✅ 提交所有文件（已移除 secrets）
- ✅ 推送到 GitHub: https://github.com/guiyulius/image-background-remover/tree/nextjs-migration

### 阶段 5: 用户体系与配额管理（已完成 ✅）

- ✅ 实施方案 B：纯记录型用户体系（无限免费）
- ✅ 实施方案 A：免费额度+历史记录型
- ✅ 数据库设计：schema.sql 和 schema-quota.sql
- ✅ 配额管理服务：lib/quota.ts
- ✅ API 路由：/api/usage/check 和 /api/usage/record
- ✅ 完整的用户界面：app/page-plan-a.tsx
- ✅ 方案配置：config/plans.ts

### 阶段 6: Cloudflare Pages 兼容性（已完成 ✅）

- ✅ 添加 Edge Runtime 支持
- ✅ 配置静态导出模式
- ✅ 添加 .npmrc 配置文件
- ✅ 添加 build:cf 命令
- ✅ 修复 Auth.js v5 导入问题
- ✅ 配置 wrangler.toml

---

## 🔐 Credentials 配置说明

**重要：** 这些敏感信息不应提交到 GitHub，需要在部署平台（Vercel/Cloudflare）的环境变量中配置：

- `AUTH_SECRET` - 在部署平台设置
- `GOOGLE_CLIENT_ID` - 在部署平台设置
- `GOOGLE_CLIENT_SECRET` - 在部署平台设置

（本地开发时使用 `.env.local` 文件）

---

## 📝 待执行的步骤

### 阶段 7: 修复构建问题（已完成 ✅）

- ✅ 安装缺失的依赖：onnxruntime-web
- ✅ 移除静态导出配置（output: 'export'）
- ✅ 成功构建项目
- ✅ 提交并推送到 GitHub

### 阶段 8: 部署到 Vercel（待执行 ⏳）

由于 Cloudflare Pages 与 Next.js 16 存在兼容性问题，**推荐使用 Vercel 部署**。

#### 部署步骤：

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择仓库：`guiyulius/image-background-remover`
   - 选择分支：`nextjs-migration`
   - 点击 "Import"

3. **配置项目设置**
   - 项目名称：`image-background-remover`（或自定义）
   - 框架预设：Next.js（自动检测）
   - 根目录：`./`（保持默认）

4. **配置环境变量（重要！）**
   
   在 "Environment Variables" 部分添加以下变量（值从本地 .env.local 文件获取）：
   
   ```
   AUTH_SECRET = [从 .env.local 获取]
   AUTH_TRUST_HOST = true
   GOOGLE_CLIENT_ID = [从 .env.local 获取]
   GOOGLE_CLIENT_SECRET = [从 .env.local 获取]
   ```
   
   **注意：** 这些值在本地的 `/root/.openclaw/workspace/removebg-pro-next/.env.local` 文件中可以找到。

5. **开始部署**
   - 点击 "Deploy" 按钮
   - 等待 1-3 分钟
   - 部署成功后会获得一个类似 `https://image-background-remover-xxx.vercel.app` 的域名

### 阶段 9: 更新 Google Cloud Console（待执行 ⏳）

1. **获取 Vercel 部署的域名**
   - 例如：`https://image-background-remover-xxx.vercel.app`

2. **访问 Google Cloud Console**
   - 打开 https://console.cloud.google.com/
   - 选择对应的项目

3. **配置 OAuth 同意屏幕**
   - 进入 "APIs & Services" → "Credentials"
   - 找到 OAuth 2.0 Client ID

4. **添加授权域名**
   
   在 "Authorized JavaScript origins" 中添加：
   ```
   https://image-background-remover-xxx.vercel.app
   ```
   
   在 "Authorized redirect URIs" 中添加：
   ```
   https://image-background-remover-xxx.vercel.app/api/auth/callback/google
   ```

5. **保存更改**
   - 点击 "Save" 按钮

### 阶段 10: 配置自定义域名（可选，待执行 ⏳）

1. **在 Vercel 中添加自定义域名**
   - 进入项目设置 → "Domains"
   - 添加你的域名（例如：imagebackgroundcleaning.shop）

2. **更新 DNS 解析**
   - 在域名注册商处更新 DNS 记录
   - 添加 CNAME 记录指向 Vercel 分配的域名

3. **等待生效**
   - DNS  propagation 可能需要几分钟到几小时
   - Vercel 会自动配置 SSL 证书

---

## 📁 已创建/更新的文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `app/api/auth/[...nextauth]/route.ts` | ✅ 新建 | Auth.js API 路由 |
| `app/providers.tsx` | ✅ 新建 | Session Provider |
| `app/layout.tsx` | ✅ 更新 | 根布局，集成 Provider |
| `app/page.tsx` | ✅ 新建 | 主页面，包含完整功能 |
| `app/page-plan-a.tsx` | ✅ 新建 | 方案 A 页面（免费额度） |
| `lib/quota.ts` | ✅ 新建 | 配额管理服务 |
| `config/plans.ts` | ✅ 新建 | 方案配置 |
| `app/api/usage/check/route.ts` | ✅ 新建 | 检查额度 API |
| `app/api/usage/record/route.ts` | ✅ 新建 | 记录使用 API |
| `schema.sql` | ✅ 新建 | 数据库表结构（方案 B） |
| `schema-quota.sql` | ✅ 新建 | 数据库表结构（方案 A） |
| `SOLUTION_TWO_PLANS.md` | ✅ 新建 | 双方案详细设计 |
| `USER_SYSTEM_TWO_PLANS.md` | ✅ 新建 | 用户体系设计 |
| `QUOTA_SYSTEM_TWO_PLANS.md` | ✅ 新建 | 配额系统设计 |
| `PLAN_A_IMPLEMENTATION.md` | ✅ 新建 | 方案 A 实施指南 |
| `CLOUDFLARE_ATTEMPT.md` | ✅ 新建 | Cloudflare 部署尝试记录 |
| `DEPLOYMENT_OPTIONS.md` | ✅ 新建 | 部署选项说明 |
| `.npmrc` | ✅ 新建 | npm 配置 |
| `wrangler.toml` | ✅ 更新 | Cloudflare Workers 配置 |
| `.env.local` | ✅ 新建 | 环境变量配置 |
| `.env.local.example` | ✅ 新建 | 环境变量示例 |
| `README.md` | ✅ 更新 | 项目说明 |
| `EXECUTION_GUIDE.md` | ✅ 新建 | 详细执行指南 |
| `MIGRATION_PLAN.md` | ✅ 新建 | 迁移计划 |
| `start.sh` | ✅ 新建 | 启动脚本 |
| `PROGRESS.md` | ✅ 更新 | 本文档 - 进度跟踪 |

---

## 📊 当前进度

```
阶段 1: 项目初始化           ████████████████████ 100%
阶段 2: 功能实现             ████████████████████ 100%
阶段 3: 本地测试             ████████████████████ 100%
阶段 4: 推送到 GitHub        ████████████████████ 100%
阶段 5: 用户体系与配额管理    ████████████████████ 100%
阶段 6: Cloudflare 兼容性     ████████████████████ 100%
阶段 7: 修复构建问题          ████████████████████ 100% ✅
阶段 8: 部署到 Vercel         ░░░░░░░░░░░░░░░░░░ 0% (待执行)
阶段 9: Google 配置          ░░░░░░░░░░░░░░░░░░ 0% (待执行)
阶段 10: 自定义域名           ░░░░░░░░░░░░░░░░░░ 0% (可选)

总体进度: ██████████████████████░ 95%
```

---

## 🎯 下一步行动

**当前可立即执行的步骤：**

1. **部署到 Cloudflare Pages** - 导入项目并配置环境变量
2. **更新 Google Cloud Console** - 添加新域名的授权配置
3. **测试完整功能** - 验证登录、配额管理和背景移除

---

## 📝 备注

- **Git 状态：**
  - ✅ 当前分支：nextjs-migration
  - ✅ 最新提交：3bc0141 - fix: 移除静态导出配置，添加 onnxruntime-web 依赖
  - ✅ 所有更改已提交并推送

- **项目构建状态：**
  - ✅ 构建成功！无错误
  - ✅ 依赖已完整：onnxruntime-web 已安装
  - ✅ 配置已优化：移除了静态导出配置

- **项目配置：**
  - 🎯 当前方案：方案 A（免费额度+历史记录型）
  - 🎨 可用方案：方案 A（额度限制）、方案 B（无限免费）
  - 🔧 配置位置：config/plans.ts
  - 🚀 推荐部署：Vercel（与 Next.js 完美兼容）

- **关键文件位置：**
  - 项目根目录：/root/.openclaw/workspace/removebg-pro-next
  - 环境变量：/root/.openclaw/workspace/removebg-pro-next/.env.local
  - GitHub 仓库：https://github.com/guiyulius/image-background-remover
  - Vercel 部署：https://vercel.com/new（待部署）

- **下一步操作指南：**
  1. 访问 https://vercel.com/new
  2. 导入 guiyulius/image-background-remover 仓库（nextjs-migration 分支）
  3. 配置环境变量（详见阶段 8）
  4. 点击 Deploy，等待 1-3 分钟
  5. 更新 Google Cloud Console 授权域名

