import { authConfig } from '../../lib/auth';
import { getSession } from '@auth/core';

export const onRequestGet: PagesFunction = async (context) => {
  const { request, env } = context;
  const config = authConfig(env);
  
  // @ts-ignore
  const session = await getSession(request, config);

  return new Response(JSON.stringify({ user: session?.user || null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
