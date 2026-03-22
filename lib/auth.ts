import { D1Adapter } from '@auth/d1-adapter';
import Google from '@auth/core/providers/google';

export function authConfig(env: any) {
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
      signIn: '/',
      signOut: '/',
      error: '/',
    },
    callbacks: {
      async session({ session, user }: any) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };
}
