export default {
  async fetch(request, env, ctx) {
    return new Response('Hello from worker!', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
