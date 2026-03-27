export function onRequest(context) {
  const headers = new Headers();
  headers.append('Set-Cookie', 'auth_session=; Path=/; HttpOnly; Max-Age=0');
  headers.append('Location', '/');
  
  return new Response(null, {
    status: 302,
    headers
  });
}
