import express from 'express';
import { initializeMCQSystem } from '../nlp/mcq_system.js';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize Node.js NLP system
let mcqSystem = null;
let customDataLoaded = false;

const PYTHON_SCRIPT = path.join(__dirname, '..', '..', 'NLP', 'copy_of_capstone_nlp.py');

function initializeMCQ(jsonPath = null, modelPath = null) {
  try {
    console.log('🔮 Initializing MCQ system...');
    mcqSystem = initializeMCQSystem(jsonPath, modelPath);
    console.log('✅ MCQ system ready');
    customDataLoaded = !!(jsonPath || modelPath);
  } catch (error) {
    console.error('❌ Failed to initialize MCQ system:', error);
  }
}

// Initialize on startup  
initializeMCQ();

// Load custom model and data
router.post('/load-custom-data', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../nlp/uploads');
    const modelPath = path.join(uploadsDir, 'model.zip');
    const jsonPath = path.join(uploadsDir, 'DSA_Arrays1.json');
    
    const hasModel = fs.existsSync(modelPath);
    const hasJson = fs.existsSync(jsonPath);
    
    if (!hasJson) {
      return res.status(400).json({
        success: false,
        error: 'No JSON data file found. Please upload your DSA_Arrays1.json file first.'
      });
    }
    
    // Reinitialize system with custom data
    initializeMCQ(jsonPath, hasModel ? modelPath : null);
    
    // Load model if available
    if (hasModel && mcqSystem.modelLoader) {
      try {
        await mcqSystem.modelLoader.loadModel(modelPath);
      } catch (error) {
        console.error('Model loading error:', error);
        // Continue without model
      }
    }
    
    const questionCount = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).length;
    
    res.json({
      success: true,
      message: 'Custom data loaded successfully',
      hasModel,
      hasJson,
      questionCount,
      modelLoaded: mcqSystem.modelLoader ? mcqSystem.modelLoader.isReady() : false
    });
    
  } catch (error) {
    console.error('❌ Custom data loading error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system status
router.get('/status', (req, res) => {
  const uploadsDir = path.join(__dirname, '../nlp/uploads');
  const modelPath = path.join(uploadsDir, 'model.zip');
  const jsonPath = path.join(uploadsDir, 'DSA_Arrays1.json');
  
  const hasModel = fs.existsSync(modelPath);
  const hasJson = fs.existsSync(jsonPath);
  
  let questionCount = 0;
  if (mcqSystem && mcqSystem.kb) {
    questionCount = mcqSystem.kb.questionsDb.length;
  }
  
  res.json({
    systemReady: !!mcqSystem,
    customDataLoaded,
    hasUploadedModel: hasModel,
    hasUploadedJson: hasJson,
    questionCount,
    modelLoaded: mcqSystem && mcqSystem.modelLoader ? mcqSystem.modelLoader.isReady() : false
  });
});

// Helper function to run Python script
function runPythonScript(command, args = []) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [PYTHON_SCRIPT, command, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (e) {
          resolve({ output: stdout.trim() });
        }
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Initialize NLP system
router.post('/initialize', async (req, res) => {
  try {
    // Initialize the Node.js MCQ system instead of Python
    if (!mcqSystem) {
      initializeMCQ();
    }
    res.json({ success: true, message: 'NLP system initialized successfully' });
  } catch (error) {
    console.error('NLP initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize NLP system', details: error.message });
  }
});

// Process query
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }
    
    if (!mcqSystem) {
      return res.status(503).json({ error: 'MCQ system not initialized' });
    }
    
    const result = await mcqSystem.qaSystem.answerQuestion(query);
    res.json(result);
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ error: 'Failed to process query', details: error.message });
  }
});

// Get autocomplete suggestions
router.post('/autocomplete', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!mcqSystem) {
      return res.status(503).json({ error: 'MCQ system not initialized' });
    }
    
    const wordPredictions = mcqSystem.autocomplete.predictNextWords(text, 5);
    const questionSuggestions = mcqSystem.autocomplete.getQuestionSuggestions(text, 3);
    
    res.json({
      word_predictions: wordPredictions,
      question_suggestions: questionSuggestions
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to get autocomplete suggestions' });
  }
});

// Answer questions
router.post('/answer', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!mcqSystem) {
      return res.status(503).json({ error: 'MCQ system not initialized' });
    }
    
    const result = mcqSystem.qaSystem.answerQuestion(question);
    
    res.json(result);
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Get questions
router.get('/questions', async (req, res) => {
  try {
    if (!mcqSystem) {
      return res.status(503).json({ error: 'MCQ system not initialized' });
    }
    
    const questions = mcqSystem.kb.questionsDb.map((q, index) => ({
      id: index + 1,
      question: q.question,
      topic: q.topic,
      difficulty: q.difficulty,
      options: q.options
    }));
    
    res.json(questions);
  } catch (error) {
    console.error('Questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Get random questions for practice
router.get('/random-questions', async (req, res) => {
  try {
    const { count = 5 } = req.query;
    // This would typically fetch from the knowledge base
    // For now, return a simple response
    res.json({ 
      message: 'Random questions endpoint',
      count: parseInt(count)
    });
  } catch (error) {
    console.error('Random questions error:', error);
    res.status(500).json({ error: 'Failed to get random questions' });
  }
});

export default router;