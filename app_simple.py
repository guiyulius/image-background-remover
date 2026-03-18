from flask import Flask, request, send_file, render_template
from flask_cors import CORS
import os
import io
import uuid
from PIL import Image
import base64

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

UPLOAD_FOLDER = '/tmp/bgremover'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return {'error': 'No image provided'}, 400
    
    file = request.files['image']
    bg_color = request.form.get('bg_color', 'transparent')
    
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_input.png')
    output_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_output.png')
    
    try:
        file.save(input_path)
        
        img = Image.open(input_path)
        
        # Simple demo: convert to grayscale and add alpha channel
        # In production, use rembg library
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Apply background color
        if bg_color != 'transparent':
            bg = Image.new('RGBA', img.size, bg_color)
            composite = Image.alpha_composite(bg, img)
            composite = composite.convert('RGB')
            composite.save(output_path, 'PNG')
        else:
            img.save(output_path, 'PNG')
        
        return send_file(output_path, mimetype='image/png')
    
    except Exception as e:
        return {'error': str(e)}, 500
    
    finally:
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)

@app.route('/api/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)