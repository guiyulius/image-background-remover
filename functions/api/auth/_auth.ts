import { Auth } from '@auth/core';
import { authConfig } from '../../../lib/auth';

export async function handleAuth(request: Request, env: any) {
  const config = authConfig(env);
  // @ts-ignore
  return Auth(request, config);
}
