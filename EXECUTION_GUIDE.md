# 🚀 新方案执行指南

## 概述

我们已经从 Cloudflare Pages 方案切换到 Next.js 方案。这个方案更加稳定，有更好的官方支持。

---

## 📋 执行步骤

### 阶段 1: 本地开发和测试（当前阶段）

#### 1.1 获取 Google Client Secret

首先需要你需要获取之前使用的 `GOOGLE_CLIENT_SECRET`。这个值之前在 Cloudflare Pages 的环境变量中设置过。

**获取方式：**
1. 访问 Cloudflare Dashboard → Pages → image-background-remover → Settings → Environment variables
2. 或者从 Google Cloud Console 重新获取

#### 1.2 更新环境变量配置

编辑 `.env.local` 文件，填入正确的 `GOOGLE_CLIENT_SECRET`：

```env
# 已经配置好了 AUTH_SECRET 和 GOOGLE_CLIENT_ID
# 只需要填入 GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_SECRET="你的实际密钥"
```

#### 1.3 启动开发服务器

```bash
cd /root/.openclaw/workspace/removebg-pro-next
./start.sh

# 或者手动执行：
npm run dev
```

#### 1.4 本地测试

访问 http://localhost:3000，测试：
- ✅ 图片上传和背景移除功能
- ✅ Google 登录流程
- ✅ 界面交互和用户体验

---

### 阶段 2: 部署到生产环境

#### 选项 A: 部署到 Vercel（推荐，最简单）

**优点：**
- Next.js 官方平台，完美支持
- 自动部署，零配置
- 免费额度充足

**步骤：**

1. **推送到 GitHub**
   ```bash
   cd /root/.openclaw/workspace/removebg-pro-next
   git init
   git add .
   git commit -m "Initial commit: RemoveBG Pro Next.js version"
   # 创建 GitHub 仓库并推送
   ```

2. **在 Vercel 中导入项目**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   - `AUTH_SECRET` = `9762f772f0308a05d9f7d569518e27ddb4b67460bc98a97b81f0e97df63d4839`
   - `AUTH_URL` = `https://your-project.vercel.app`
   - `AUTH_TRUST_HOST` = `true`
   - `GOOGLE_CLIENT_ID` = `727583503867-cqrnra1cnmlpcu5cn34mr8g94h0lauft.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET` = `你的密钥`

4. **更新 Google Cloud Console**
   在 Google Cloud Console 中添加新的授权域名：
   - JavaScript 来源: `https://your-project.vercel.app`
   - 重定向 URI: `https://your-project.vercel.app/api/auth/callback/google`

5. **部署！**
   点击 Deploy，等待 1-2 分钟

---

#### 选项 B: 部署到 Cloudflare Pages

如果你想继续使用 Cloudflare Pages，也是可以的！

**步骤：**

1. **配置 Next.js for Cloudflare Pages

```bash
# 安装 Cloudflare Pages Next.js 适配器
npm install @cloudflare/next-on-pages --save-dev
```

2. **更新 package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-date=2024-01-01",
    "pages:deploy": "npm run pages:build && npx wrangler pages deploy .vercel/output/static"
  }
}
```

3. **推送到 GitHub 并在 Cloudflare Pages 连接**

4. **配置构建命令**
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`

5. **配置环境变量**（和 Vercel 一样）

---

### 阶段 3: 更新 Google Cloud Console

无论部署到哪个平台，都需要更新 Google Cloud Console 中的授权设置：

**登录 Google Cloud Console：**
1. 访问 https://console.cloud.google.com/
2. 选择你的项目
3. 进入 **APIs & Services** → **Credentials**
4. 编辑 OAuth 2.0 Client ID

**添加授权 JavaScript 来源（根据你的部署平台）：**
- Vercel: `https://your-project.vercel.app`
- Cloudflare Pages: `https://your-project.pages.dev`
- 自定义域名: `https://imagebackgroundcleaning.shop`

**添加授权重定向 URI：**
- `https://your-domain.com/api/auth/callback/google`

---

## 📊 方案对比

| 特性 | 旧方案（Cloudflare Pages） | 新方案（Next.js） |
|------|-------------------------|------------------|
| 路由处理 | ❌ 问题多多 | ✅ 完美支持 |
| Auth.js 集成 | ⚠️ 需要复杂配置 | ✅ 官方支持 |
| 部署难度 | ⚠️ 中等 | ✅ 简单 |
| 维护成本 | ⚠️ 高 | ✅ 低 |
| 社区支持 | ⚠️ 较少 | ✅ 大量资源 |

---

## 🎯 推荐方案

**建议使用 Vercel 部署**，原因：
1. Next.js 官方平台，完美兼容
2. 部署极其简单，自动处理所有配置
3. 免费额度对于这个项目完全够用
4. 全球 CDN，速度快
5. 自动 HTTPS，无需配置

---

## ⏱️ 预计时间

- 阶段 1（本地测试）：15-30 分钟
- 阶段 2（部署）：30-60 分钟
- 阶段 3（Google 配置）：10-15 分钟

**总计：约 1-1.5 小时**

---

## 🆘 需要帮助？

如果在执行过程中遇到问题，随时问我！我可以帮你：
- 调试本地开发环境
- 配置部署
- 解决 Google OAuth 问题
- 优化用户体验
