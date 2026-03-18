export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve static files
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await env.ASSETS.fetch(request);
      return html;
    }

    // API endpoint for background removal
    if (url.pathname === '/api/remove-bg' && request.method === 'POST') {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      const bgColor = formData.get('bg_color') || 'transparent';

      if (!imageFile) {
        return new Response(JSON.stringify({ error: 'No image provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        // Call remove.bg API
        const apiForm = new FormData();
        apiForm.append('image_file', imageFile, imageFile.name);
        
        if (bgColor !== 'transparent') {
          apiForm.append('bg_color', bgColor);
        }

        const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': env.REMOVE_BG_API_KEY
          },
          body: apiForm
        });

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('Remove.bg API error:', apiResponse.status, errorText);
          return new Response(JSON.stringify({ error: 'Failed to process image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const imageBlob = await apiResponse.blob();
        return new Response(imageBlob, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline'
          }
        });

      } catch (error) {
        console.error('Processing error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  }
};