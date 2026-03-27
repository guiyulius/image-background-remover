export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('No code provided', { status: 400 });
  }
  
  // 简化处理：直接设置一个模拟的 session cookie
  // 实际生产中应该用 Google token exchange
  const headers = new Headers();
  headers.append('Set-Cookie', 'auth_session=logged_in; Path=/; HttpOnly');
  headers.append('Location', '/');
  
  return new Response(null, {
    status: 302,
    headers
  });
}
