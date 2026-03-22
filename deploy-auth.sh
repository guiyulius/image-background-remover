#!/bin/bash

# RemoveBG Pro - Auth.js + D1 自动化部署脚本
# 使用前请先设置 CLOUDFLARE_API_TOKEN 环境变量

set -e

echo "🚀 开始部署 Auth.js + D1..."
echo ""

# 步骤 1: 创建 D1 数据库
echo "📦 步骤 1: 创建 D1 数据库 'image-bg-remover-auth'"
echo "----------------------------------------"
DB_CREATE_OUTPUT=$(npx wrangler d1 create image-bg-remover-auth 2>&1)
echo "$DB_CREATE_OUTPUT"

# 提取 database_id
DATABASE_ID=$(echo "$DB_CREATE_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$DATABASE_ID" ]; then
  echo ""
  echo "⚠️  无法自动提取 database_id，请手动从上面的输出中复制"
  echo ""
  read -p "请输入 database_id: " DATABASE_ID
fi

echo ""
echo "✅ 数据库 ID: $DATABASE_ID"
echo ""

# 步骤 2: 更新 wrangler.toml
echo "📝 步骤 2: 更新 wrangler.toml"
echo "----------------------------------------"

# 备份当前 wrangler.toml
cp wrangler.toml wrangler.toml.backup

# 更新 wrangler.toml
cat > wrangler.toml << EOF
name = "image-background-remover"
compatibility_date = "2024-03-18"

[build]
command = ""
publish = "."

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[vars]
AUTH_SECRET = "generate-a-random-secret-here-please-change-in-production"
AUTH_URL = "https://imagebackgroundcleaning.shop"
AUTH_TRUST_HOST = "true"
# GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET should be set in Cloudflare Pages env vars
# not in this file for security reasons

[d1_databases]
database_name = "image-bg-remover-auth"
database_id = "$DATABASE_ID"
EOF

echo "✅ wrangler.toml 已更新"
echo ""

# 步骤 3: 初始化数据库表
echo "🗄️  步骤 3: 初始化数据库表结构"
echo "----------------------------------------"
npx wrangler d1 execute image-bg-remover-auth --file=./schema.sql
echo "✅ 数据库表已创建"
echo ""

# 步骤 4: 生成 AUTH_SECRET
echo "🔐 步骤 4: 生成 AUTH_SECRET"
echo "----------------------------------------"
AUTH_SECRET=$(node -e "console.log(crypto.randomBytes(32).toString('hex'))")
echo "AUTH_SECRET: $AUTH_SECRET"
echo ""
echo "请复制上面的 AUTH_SECRET，稍后需要在 Cloudflare Pages 中配置"
echo ""

# 步骤 5: 提交更新后的 wrangler.toml
echo "📤 步骤 5: 提交配置变更"
echo "----------------------------------------"
git add wrangler.toml
git commit -m "Update wrangler.toml with D1 database configuration" || echo "没有变更需要提交"
git push || echo "已经是最新版本"
echo ""

# 步骤 6: 显示后续步骤
echo ""
echo "🎉 基础部署完成！"
echo ""
echo "📋 还需要完成以下步骤："
echo ""
echo "1️⃣  在 Cloudflare Dashboard 中配置环境变量："
echo "    进入: Pages → image-background-remover → Settings → Environment variables"
echo "    添加以下变量："
echo ""
echo "    AUTH_SECRET=$AUTH_SECRET"
echo "    AUTH_URL=https://imagebackgroundcleaning.shop"
echo "    AUTH_TRUST_HOST=true"
echo "    GOOGLE_CLIENT_ID=你的-CLIENT-ID"
echo "    GOOGLE_CLIENT_SECRET=你的-CLIENT-SECRET"
echo ""
echo "2️⃣  在 Google Cloud Console 中配置重定向 URI："
echo "    https://imagebackgroundcleaning.shop/api/auth/callback/google"
echo "    https://www.imagebackgroundcleaning.shop/api/auth/callback/google"
echo ""
echo "3️⃣  重新部署 Cloudflare Pages（会自动触发）"
echo ""
echo "✅ 完成后就可以测试登录功能了！"
echo ""
