import { Auth, getSession } from '@auth/core';
import Google from '@auth/core/providers/google';
import { D1Adapter } from '@auth/d1-adapter';

function authConfig(env) {
  return {
    adapter: D1Adapter(env.DB),
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    session: {
      strategy: 'database',
      maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
      signIn: '/',
      signOut: '/',
      error: '/',
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname.startsWith('/api/auth/')) {
      // @ts-ignore
      return Auth(request, authConfig(env));
    }
    
    // Handle user API
    if (url.pathname === '/api/user') {
      const session = await getSession(request, authConfig(env));
      
      if (!session?.user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ user: session.user }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Serve static files
    return env.ASSETS.fetch(request);
  }
};
