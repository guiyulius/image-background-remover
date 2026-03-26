# 🔄 迁移计划：从 Cloudflare Pages 到 Next.js + Vercel

## 概述

我们要把项目从有问题的 Cloudflare Pages 方案迁移到稳定的 Next.js + Vercel 方案。

---

## 📋 执行步骤（按顺序执行）

### 阶段 1: 准备工作（需要你手动操作）

#### 1.1 获取 GOOGLE_CLIENT_SECRET

**操作：**
1. 访问 Cloudflare Dashboard → Workers & Pages → Pages → image-background-remover
2. 点击 Settings → Environment variables
3. 找到 `GOOGLE_CLIENT_SECRET`，复制它的值

#### 1.2 配置本地环境变量

**操作：**
编辑 `.env.local` 文件，把 `GOOGLE_CLIENT_SECRET` 的值填进去：

```env
GOOGLE_CLIENT_SECRET="这里填入你复制的值"
```

#### 1.3 本地测试（可选但推荐）

**操作：**
```bash
cd /root/.openclaw/workspace/removebg-pro-next
npm run dev
```
访问 http://localhost:3000 测试功能是否正常。

---

### 阶段 2: 推送到 GitHub

#### 2.1 初始化 Git 仓库

```bash
cd /root/.openclaw/workspace/removebg-pro-next
git init
git add .
git commit -m "Initial commit: RemoveBG Pro Next.js version"
```

#### 2.2 创建 GitHub 仓库

**操作：**
1. 访问 https://github.com/new
2. 仓库名：`removebg-pro-next`（或你喜欢的名字）
3. 选择 Public 或 Private
4. 不要初始化 README（我们已经有了）
5. 点击 "Create repository"

#### 2.3 推送代码

```bash
# 按照 GitHub 页面显示的命令操作
git remote add origin https://github.com/你的用户名/removebg-pro-next.git
git branch -M main
git push -u origin main
```

---

### 阶段 3: 部署到 Vercel

#### 3.1 导入项目到 Vercel

**操作：**
1. 访问 https://vercel.com
2. 点击 "Add New..." → "Project"
3. 选择刚刚推送的 GitHub 仓库
4. 点击 "Import"

#### 3.2 配置项目设置

**在 Configure Project 页面：**
- Project Name: `removebg-pro-next`（或自定义）
- Framework Preset: 应该会自动检测为 Next.js
- Root Directory: `./`
- Build Command: 保持默认
- Output Directory: 保持默认

#### 3.3 配置环境变量

**在 Environment Variables 部分添加：

| 变量名 | 值 |
|--------|-----|
| `AUTH_SECRET` | `9762f772f0308a05d9f7d569518e27ddb4b67460bc98a97b81f0e97df63d4839` |
| `AUTH_URL` | `https://你的项目名.vercel.app`（部署后更新） |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | `727583503867-cqrnra1cnmlpcu5cn34mr8g94h0lauft.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | 你的密钥 |

**重要：** 先把 `AUTH_URL` 暂时留空或先填一个占位符，部署后再更新。

#### 3.4 部署！

点击 "Deploy" 按钮，等待 1-2 分钟。

---

### 阶段 4: 更新 Google Cloud Console

部署成功后，需要更新 Google Cloud Console 中的授权设置。

#### 4.1 获取 Vercel 分配的域名

部署成功后，Vercel 会给你一个域名，类似：
- `https://removebg-pro-next.vercel.app`

#### 4.2 更新 Google Cloud Console

**操作：**
1. 访问 https://console.cloud.google.com/
2. 选择你的项目
3. 进入 APIs & Services → Credentials
4. 编辑 OAuth 2.0 Client ID

**添加授权 JavaScript 来源：**
- `https://removebg-pro-next.vercel.app`
- `https://imagebackgroundcleaning.shop`（如果还用这个域名）

**添加授权重定向 URI：**
- `https://removebg-pro-next.vercel.app/api/auth/callback/google`
- `https://imagebackgroundcleaning.shop/api/auth/callback/google`

点击 **Save** 保存。

---

### 阶段 5: 更新 Vercel 环境变量（可选）

部署成功后，回到 Vercel 更新 `AUTH_URL`：

1. Vercel Dashboard → 你的项目 → Settings → Environment Variables
2. 更新 `AUTH_URL` 为你的实际域名：
   ```
   AUTH_URL = "https://removebg-pro-next.vercel.app"
   ```
3. 重新部署（Vercel 会自动重新部署）

---

### 阶段 6: 配置自定义域名（可选，推荐）

如果你还想使用 `imagebackgroundcleaning.shop` 这个域名：

#### 6.1 在 Vercel 中添加自定义域名

1. Vercel Dashboard → 你的项目 → Settings → Domains
2. 点击 "Add Domain"
3. 输入 `imagebackgroundcleaning.shop`
4. 点击 "Add"

#### 6.2 更新 DNS 解析

Vercel 会告诉你需要更新的 DNS 记录。

**操作：**
1. 访问你的域名注册商（可能是 Cloudflare 或其他）
2. 找到 DNS 设置
3. 更新 DNS 记录按照 Vercel 的指示

#### 6.3 等待 DNS 生效

这可能需要几分钟到几小时。

---

## ✅ 完成！

🎉 恭喜！你已经成功迁移到 Next.js + Vercel 方案！

---

## 📊 方案对比

| 项目 | 旧方案 | 新方案 |
|------|--------|--------|
| 路由问题 | ❌ 有严重问题 | ✅ 完美解决 |
| 部署难度 | ⚠️ 复杂 | ✅ 简单 |
| 维护成本 | ⚠️ 高 | ✅ 低 |
| 性能 | 一般 | 优秀 |
| Google 登录 | ⚠️ 勉强能用 | ✅ 完美 |

---

## ⏱️ 预计时间

- 阶段 1: 10-15 分钟
- 阶段 2: 10-15 分钟
- 阶段 3: 5-10 分钟
- 阶段 4: 5-10 分钟
- 阶段 5-6（可选）: 15-30 分钟

**总计：约 45-90 分钟

---

## 🆘 需要帮助？

如果在任何步骤遇到问题，随时告诉我！我可以帮你：
- 调试配置问题
- 解决部署问题
- 优化设置 Google OAuth
- 配置自定义域名
