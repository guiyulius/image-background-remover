from flask import Flask, request, send_file, render_template
from flask_cors import CORS
import os
import io
import uuid
from PIL import Image
from rembg import remove

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
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_input.png')
    output_path = os.path.join(UPLOAD_FOLDER, f'{file_id}_output.png')
    
    try:
        # Save uploaded file
        file.save(input_path)
        
        # Remove background
        with open(input_path, 'rb') as f:
            input_image = f.read()
            output_image = remove(input_image)
        
        # Apply background color if not transparent
        if bg_color != 'transparent':
            img = Image.open(io.BytesIO(output_image))
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Create background
            bg = Image.new('RGBA', img.size, bg_color)
            
            # Composite
            composite = Image.alpha_composite(bg, img)
            
            # Convert to RGB for JPEG-like output
            composite = composite.convert('RGB')
            composite.save(output_path, 'PNG')
        else:
            with open(output_path, 'wb') as f:
                f.write(output_image)
        
        # Return the processed image
        return send_file(output_path, mimetype='image/png')
    
    except Exception as e:
        return {'error': str(e)}, 500
    
    finally:
        # Cleanup
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)

@app.route('/api/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)