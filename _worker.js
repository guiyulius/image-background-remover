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
    
    // 服务静态文件
    return env.ASSETS.fetch(request);
  }
};
