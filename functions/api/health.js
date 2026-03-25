export function onRequest(context) {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'API is working',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
