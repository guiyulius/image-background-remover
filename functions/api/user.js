export function onRequest(context) {
  const { request } = context;
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasSession = cookieHeader.includes('auth_session=logged_in');
  
  if (hasSession) {
    return new Response(JSON.stringify({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://ui-avatars.com/api/?name=Test+User&background=3b82f6&color=fff'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Not authenticated' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
