import { handleAuth } from './_auth';

export const onRequest: PagesFunction = async (context) => {
  return handleAuth(context.request, context.env);
};
