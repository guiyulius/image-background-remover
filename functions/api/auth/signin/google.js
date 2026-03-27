export function onRequest(context) {
  const { GOOGLE_CLIENT_ID, AUTH_URL } = context.env;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', `${AUTH_URL}/api/auth/callback/google`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', 'random');
  
  return Response.redirect(authUrl.toString(), 302);
}
