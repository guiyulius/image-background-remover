const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({
  dest: '/tmp/bgremover',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const bgColor = req.body.bg_color || 'transparent';
    const inputPath = req.file.path;
    const outputPath = path.join('/tmp/bgremover', `${req.file.filename}_output.png`);

    console.log(`Processing image: ${inputPath}`);
    
    // Demo: use Python with rembg if available, otherwise just copy
    // For now, let's just copy the file as placeholder
    // In production, integrate with rembg or remove.bg API
    
    // Try to use Python rembg
    try {
      const pythonScript = `
from PIL import Image
import sys
import os

try:
    from rembg import remove
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    bg_color = sys.argv[3] if len(sys.argv) > 3 else 'transparent'
    
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    output_data = remove(input_data)
    
    if bg_color != 'transparent':
        from io import BytesIO
        img = Image.open(BytesIO(output_data))
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        bg = Image.new('RGBA', img.size, bg_color)
        composite = Image.alpha_composite(bg, img)
        composite = composite.convert('RGB')
        composite.save(output_path, 'PNG')
    else:
        with open(output_path, 'wb') as f:
            f.write(output_data)
    
    print('Success')
except ImportError:
    # rembg not available, just copy
    import shutil
    shutil.copy(input_path, output_path)
    print('Fallback: rembg not available')
`;
      
      const scriptPath = path.join('/tmp', `rembg_${Date.now()}.py`);
      fs.writeFileSync(scriptPath, pythonScript);
      
      const python = spawn('python3', [scriptPath, inputPath, outputPath, bgColor]);
      
      let pythonOutput = '';
      python.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      await new Promise((resolve) => {
        python.on('close', resolve);
      });
      
      fs.unlinkSync(scriptPath);
      
      if (!fs.existsSync(outputPath)) {
        throw new Error('Python processing failed');
      }
      
    } catch (pythonError) {
      console.log('Python failed, using fallback:', pythonError.message);
      // Fallback: just copy the file
      fs.copyFileSync(inputPath, outputPath);
    }

    res.sendFile(outputPath, (err) => {
      if (err) {
        console.error('Send file error:', err);
      }
      // Cleanup
      try {
        fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});