# Auth.js v5 + D1 部署完整指南

## 📋 前置条件

- ✅ Cloudflare Pages 项目已存在 (image-background-remover)
- ✅ Google OAuth 凭证已获取
- ✅ Wrangler CLI 已安装

---

## 🔧 步骤 1: 创建 D1 数据库

```bash
# 1. 创建名为 "image-bg-remover-auth" 的 D1 数据库
npx wrangler d1 create image-bg-remover-auth

# 2. 记下输出中的 database_id，类似：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## 🔧 步骤 2: 更新 wrangler.toml

编辑 `wrangler.toml`，取消注释并填入你的 database_id：

```toml
[d1_databases]
database_name = "image-bg-remover-auth"
database_id = "你的-database-id-这里"  # 从步骤1复制
```

---

## 🔧 步骤 3: 初始化数据库表结构

```bash
# 执行 schema.sql 创建表
npx wrangler d1 execute image-bg-remover-auth --file=./schema.sql
```

---

## 🔧 步骤 4: 生成 AUTH_SECRET

```bash
# 生成一个随机的安全密钥
node -e "console.log(crypto.randomBytes(32).toString('hex'))"

# 或者使用 openssl
openssl rand -hex 32
```

将生成的密钥更新到 `wrangler.toml` 的 `AUTH_SECRET` 字段。

---

## 🔧 步骤 5: 配置 Cloudflare Pages 环境变量

在 Cloudflare Dashboard → Pages → image-background-remover → Settings → Environment variables:

添加以下变量（生产环境）：

| 变量名 | 值 |
|--------|-----|
| `AUTH_SECRET` | 从步骤4生成的密钥 |
| `AUTH_URL` | `https://imagebackgroundcleaning.shop` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | 你的 Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | 你的 Google OAuth Client Secret |

---

## 🔧 步骤 6: 配置 GitHub Secrets (可选，但推荐)

在 GitHub → 你的仓库 → Settings → Secrets and variables → Actions:

添加以下 secrets（与上面相同）：
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 🔧 步骤 7: 配置 Google Cloud Console

确保在 Google Cloud Console 中：

1. 进入 https://console.cloud.google.com/
2. 选择你的项目
3. 进入 "APIs & Services" → "Credentials"
4. 找到你的 OAuth 2.0 Client ID，编辑它

添加以下授权配置：

**已授权的 JavaScript 来源:**
```
https://imagebackgroundcleaning.shop
https://www.imagebackgroundcleaning.shop
```

**已授权的重定向 URI:**
```
https://imagebackgroundcleaning.shop/api/auth/callback/google
https://www.imagebackgroundcleaning.shop/api/auth/callback/google
```

---

## 🔧 步骤 8: 本地预览测试 (可选)

```bash
# 安装依赖
npm install

# 本地预览（需要先配置好 wrangler.toml）
npm run pages:dev
```

---

## 🔧 步骤 9: 提交并部署

```bash
# 1. 检查 git 状态
git status

# 2. 添加所有新文件
git add package.json wrangler.toml index.html schema.sql DEPLOYMENT_GUIDE.md
git add functions/ lib/

# 3. 提交更改
git commit -m "Add Auth.js v5 + D1 authentication"

# 4. 推送到 GitHub
git push origin main
```

推送到 GitHub 后，Cloudflare Pages 会自动部署！

---

## 🔧 步骤 10: 验证部署

部署完成后，测试以下功能：

1. 访问 https://imagebackgroundcleaning.shop
2. 点击 "使用 Google 登录"
3. 完成 Google 认证流程
4. 应该能看到你的头像和用户名
5. 点击 "退出" 按钮测试登出

---

## 📁 文件结构说明

```
/
├── wrangler.toml          # Cloudflare Pages + D1 配置
├── package.json            # 项目依赖 (包含 Auth.js)
├── schema.sql              # D1 数据库表结构
├── index.html              # 前端页面 (含登录/用户UI)
├── lib/
│   └── auth.ts             # Auth.js 配置
└── functions/
    ├── api/
    │   ├── auth/
    │   │   └── [...auth].ts  # Auth.js API 路由
    │   └── user.ts            # 获取当前用户 API
```

---

## 🚀 常见问题

### Q: 部署后提示 "AUTH_SECRET is required"
A: 确保在 Cloudflare Pages 环境变量中设置了 `AUTH_SECRET`

### Q: Google 登录提示 "redirect_uri_mismatch"
A: 检查 Google Cloud Console 中的重定向 URI 是否正确

### Q: 数据库错误
A: 确保 `wrangler.toml` 中的 database_id 正确，并且已执行 schema.sql

### Q: 如何查看数据库内容
```bash
# 连接到 D1 数据库交互式控制台
npx wrangler d1 execute image-bg-remover-auth --local --command "SELECT * FROM users;"
```
