#!/bin/bash

echo "🚀 RemoveBG Pro - Next.js 版本"
echo "================================"

# 检查是否存在 .env.local 文件
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 文件不存在！"
    echo "📝 正在复制 .env.local.example 到 .env.local..."
    cp .env.local.example .env.local
    echo ""
    echo "⚠️  请编辑 .env.local 文件，填入你的配置："
    echo "   - AUTH_SECRET (使用 'openssl rand -hex 32' 生成)"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo ""
    echo "然后重新运行此脚本。"
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo ""
echo "✅ 启动开发服务器..."
echo "📍 访问: http://localhost:3000"
echo ""

npm run dev
