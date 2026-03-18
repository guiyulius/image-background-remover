export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const bgColor = formData.get('bg_color') || 'transparent';

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiForm = new FormData();
    apiForm.append('image_file', imageFile, imageFile.name);
    
    if (bgColor !== 'transparent') {
      apiForm.append('bg_color', bgColor);
    }

    const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': env.REMOVE_BG_API_KEY || 'mUHDVBxMYtsp3Da9qR1izXmA'
      },
      body: apiForm
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Remove.bg API error:', apiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to process image: ' + errorText }), {
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
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    };
  }
}