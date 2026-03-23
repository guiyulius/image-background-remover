import { Auth } from '@auth/core';
import { authConfig } from '../../../lib/auth';

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
  const config = authConfig(env);
  
  // @ts-ignore
  return Auth(request, config);
};
