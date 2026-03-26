# RemoveBG Pro - Next.js 版本

专业的 AI 背景移除工具，使用 Next.js + Auth.js + @imgly/background-removal 构建。

## 功能特性

- ✅ **AI 背景移除** - 使用先进的 AI 技术一键移除图片背景
- ✅ **Google 登录** - 通过 Auth.js 实现安全的 Google OAuth 登录
- ✅ **现代化界面** - 使用 Next.js + Tailwind CSS 构建的美观界面
- ✅ **实时预览** - 上传图片后立即预览，处理后对比原图和结果
- ✅ **图片下载** - 一键下载处理后的透明背景图片

## 技术栈

- **Next.js 16** - React 框架
- **Auth.js (NextAuth)** - 身份认证
- **@imgly/background-removal** - AI 背景移除
- **Tailwind CSS** - 样式框架
- **TypeScript** - 类型安全

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.local.example .env.local
```

然后编辑 `.env.local` 文件，填入你的配置：

```env
# 生成一个 AUTH_SECRET
# 可以使用: openssl rand -hex 32
AUTH_SECRET="your-auth-secret-here"

# 开发环境使用 localhost
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Google OAuth 凭证
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. 获取 Google OAuth 凭证

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 进入 **APIs & Services** → **Credentials**
4. 点击 **Create Credentials** → **OAuth client ID**
5. 选择 **Web application**
6. 添加授权 JavaScript 来源：
   - `http://localhost:3000` (开发环境)
   - `https://your-domain.com` (生产环境)
7. 添加授权重定向 URI：
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
8. 点击 **Create**，获取 Client ID 和 Client Secret

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

### 部署到 Vercel (推荐)

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 项目设置中配置环境变量
4. 部署！

### 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. 在 Cloudflare Pages 中连接仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`.next`
5. 在环境变量设置中配置所有变量
6. 部署！

## 项目结构

```
removebg-pro-next/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts    # Auth.js API 路由
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 主页面
│   └── providers.tsx            # Session 提供者
├── .env.local.example           # 环境变量示例
├── package.json
└── README.md
```

## 使用说明

### 上传图片

1. 点击上传区域或拖拽图片到页面
2. 支持 JPG、PNG、WebP 格式

### 移除背景

1. 上传图片后点击"移除背景"按钮
2. 等待 AI 处理（通常几秒钟）
3. 查看对比原图和处理结果

### 下载图片

1. 处理完成后点击"下载图片"
2. 图片将保存为 PNG 格式（保持透明背景）

## 注意事项

- 首次使用时，AI 模型需要下载（约 100MB+），可能需要一些时间
- 处理大图片时可能需要更多内存和时间
- 建议在现代浏览器中使用（Chrome、Firefox、Safari、Edge）

## 许可证

MIT
