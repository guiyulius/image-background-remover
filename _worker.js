import { Auth } from '@auth/core';
import { D1Adapter } from '@auth/d1-adapter';
import Google from '@auth/core/providers/google';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Auth.js routes
    if (url.pathname.startsWith('/api/auth')) {
      const config = {
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

      // @ts-ignore
      return Auth(request, config);
    }

    // User API
    if (url.pathname === '/api/user') {
      // TODO: 实现获取用户信息的 API
      return new Response(JSON.stringify({ user: null }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Static assets - fall through to Pages
    return env.ASSETS.fetch(request);
  },
};
