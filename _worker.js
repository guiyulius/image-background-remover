export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 简单的健康检查
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        message: 'API is working',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 简单的测试登录重定向
    if (url.pathname === '/api/auth/signin/google') {
      return Response.redirect('https://www.google.com', 302);
    }
    
    // 处理 API 路由
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        path: url.pathname 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 对于非 API 路径，让我们直接返回 index.html（SPA 路由处理）
    // 首先检查静态文件是否存在
    const staticResponse = await env.ASSETS.fetch(request);
    if (staticResponse.ok) {
      return staticResponse;
    }
    
    // 如果静态文件不存在，返回 index.html（SPA 路由）
    const indexRequest = new Request(new URL('/index.html', request.url), request);
    return env.ASSETS.fetch(indexRequest);
  }
};
