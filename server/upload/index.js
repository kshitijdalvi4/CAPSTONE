import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../nlp/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    if (file.fieldname === 'model') {
      cb(null, 'model.zip');
    } else if (file.fieldname === 'json') {
      cb(null, 'DSA_Arrays1.json');
    } else {
      cb(null, file.originalname);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Upload model and JSON data
router.post('/upload-assets', upload.fields([
  { name: 'model', maxCount: 1 },
  { name: 'json', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📁 Files uploaded:', req.files);
    
    let modelPath = null;
    let jsonPath = null;
    
    if (req.files.model) {
      modelPath = req.files.model[0].path;
      console.log('🤖 Model uploaded to:', modelPath);
    }
    
    if (req.files.json) {
      jsonPath = req.files.json[0].path;
      console.log('📊 JSON data uploaded to:', jsonPath);
      
      // Validate JSON structure
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`✅ JSON validated: ${jsonData.length} questions loaded`);
    }
    
    res.json({
      success: true,
      message: 'Assets uploaded successfully',
      modelPath,
      jsonPath,
      questionCount: jsonPath ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')).length : 0
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if assets are available
router.get('/check-assets', (req, res) => {
  const uploadsDir = path.join(__dirname, '../nlp/uploads');
  const modelPath = path.join(uploadsDir, 'model.zip');
  const jsonPath = path.join(uploadsDir, 'DSA_Arrays1.json');
  
  const hasModel = fs.existsSync(modelPath);
  const hasJson = fs.existsSync(jsonPath);
  
  let questionCount = 0;
  if (hasJson) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      questionCount = jsonData.length;
    } catch (e) {
      console.error('Error reading JSON:', e);
    }
  }
  
  res.json({
    hasModel,
    hasJson,
    questionCount,
    modelPath: hasModel ? modelPath : null,
    jsonPath: hasJson ? jsonPath : null
  });
});

export default router;