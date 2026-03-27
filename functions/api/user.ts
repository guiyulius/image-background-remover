import { getSession } from '@auth/core';
import { authConfig } from '../../lib/auth';

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
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
};
