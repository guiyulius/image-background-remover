# 手动执行步骤指南

在你的本地电脑或已配置好 wrangler 的环境中执行以下步骤：

---

## 🚀 开始之前

确保你已：
1. 安装 Node.js 和 npm
2. 安装 wrangler: `npm install -g wrangler`
3. 登录 wrangler: `npx wrangler login`
4. 克隆项目: `git clone https://github.com/guiyulius/image-background-remover.git`
5. 进入目录: `cd image-background-remover`

---

## 步骤 1: 创建 D1 数据库

```bash
npx wrangler d1 create image-bg-remover-auth
```

**输出示例：**
```
✅ Successfully created DB 'image-bg-remover-auth'
[...]
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

👉 **重要：复制上面的 database_id，下一步需要用！**

---

## 步骤 2: 更新 wrangler.toml

编辑 `wrangler.toml` 文件，在底部添加：

```toml
[d1_databases]
database_name = "image-bg-remover-auth"
database_id = "这里粘贴你的-database-id"  # 从步骤1复制
```

---

## 步骤 3: 初始化数据库表

```bash
npx wrangler d1 execute image-bg-remover-auth --file=./schema.sql
```

你会看到类似输出：
```
🌀 Executing on image-bg-remover-auth ...
✅ All tables created
```

---

## 步骤 4: 生成 AUTH_SECRET

运行以下命令生成一个安全的密钥：

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

**输出示例：**
```
a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890ab
```

👉 **复制这个密钥，下一步需要！**

---

## 步骤 5: 提交并推送 wrangler.toml 变更

```bash
git add wrangler.toml
git commit -m "Add D1 database configuration"
git push
```

---

## 步骤 6: 配置 Cloudflare Pages 环境变量

1. 打开 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → **image-background-remover**
3. 点击 **Settings** → **Environment variables**
4. 点击 **Add variables** (生产环境)

添加以下 5 个变量：

| 变量名 | 值 |
|--------|-----|
| `AUTH_SECRET` | 从步骤4复制的密钥 |
| `AUTH_URL` | `https://imagebackgroundcleaning.shop` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | 你的 Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | 你的 Google OAuth Client Secret |

点击 **Save** 保存。

---

## 步骤 7: 配置 Google Cloud Console

1. 打开 https://console.cloud.google.com/
2. 选择你的项目
3. 进入 **APIs & Services** → **Credentials**
4. 找到 "OAuth 2.0 Client IDs" 下的那项，点击编辑

在 **Authorized JavaScript origins** 中添加：
```
https://imagebackgroundcleaning.shop
https://www.imagebackgroundcleaning.shop
```

在 **Authorized redirect URIs** 中添加：
```
https://imagebackgroundcleaning.shop/api/auth/callback/google
https://www.imagebackgroundcleaning.shop/api/auth/callback/google
```

点击 **Save** 保存。

---

## 步骤 8: 重新部署

由于我们推送了代码，Cloudflare Pages 应该会自动重新部署。

你可以在 Cloudflare Dashboard → Pages → image-background-remover → **Deployments** 中查看部署状态。

等待部署完成（通常需要 1-2 分钟）。

---

## 步骤 9: 测试登录功能

部署完成后：

1. 打开 https://imagebackgroundcleaning.shop
2. 你应该能在右上角看到 "使用 Google 登录" 按钮
3. 点击按钮，完成 Google 认证
4. 成功后应该能看到你的头像和用户名
5. 点击 "退出" 按钮测试登出

---

## 🎉 完成！

如果一切正常，恭喜你！你的 RemoveBG Pro 现在有了完整的用户认证系统！

---

## ❓ 遇到问题？

### 问题 1: wrangler 命令不工作
- 确保已登录: `npx wrangler login`

### 问题 2: 数据库错误
- 确认 wrangler.toml 中的 database_id 正确
- 确认已执行 schema.sql

### 问题 3: Google 登录提示 redirect_uri_mismatch
- 检查 Google Cloud Console 中的重定向 URI 是否完全匹配

### 问题 4: AUTH_SECRET 错误
- 确认在 Cloudflare Pages 环境变量中设置了 AUTH_SECRET
- 确认使用的是步骤4生成的密钥
