const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const FormData = require('form-data');

const app = express();
const PORT = 5000;

const REMOVE_BG_API_KEY = 'mUHDVBxMYtsp3Da9qR1izXmA';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({
  dest: '/tmp/bgremover',
  limits: { fileSize: 50 * 1024 * 1024 },
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

    console.log(`Processing image with remove.bg API: ${inputPath}`);

    // Call remove.bg API
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(inputPath));
    
    if (bgColor !== 'transparent') {
      formData.append('bg_color', bgColor);
    }

    const options = {
      hostname: 'api.remove.bg',
      path: '/v1.0/removebg',
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
        ...formData.getHeaders()
      }
    };

    const apiRequest = https.request(options, (apiResponse) => {
      if (apiResponse.statusCode !== 200) {
        let errorData = '';
        apiResponse.on('data', (chunk) => {
          errorData += chunk;
        });
        apiResponse.on('end', () => {
          console.error('Remove.bg API error:', apiResponse.statusCode, errorData);
          res.status(500).json({ error: 'Failed to process image' });
          cleanup(inputPath, outputPath);
        });
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      apiResponse.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close(() => {
          res.sendFile(outputPath, (err) => {
            if (err) {
              console.error('Send file error:', err);
            }
            cleanup(inputPath, outputPath);
          });
        });
      });
    });

    apiRequest.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'API request failed' });
      cleanup(inputPath, outputPath);
    });

    formData.pipe(apiRequest);

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

function cleanup(inputPath, outputPath) {
  try {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  } catch (e) {
    console.error('Cleanup error:', e);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});