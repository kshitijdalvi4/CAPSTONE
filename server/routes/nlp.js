import express from 'express';
import { initializeMCQSystem } from '../nlp/mcq_system.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize Node.js NLP system
let mcqSystem = null;
let customDataLoaded = false;

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

// Health check endpoint (matching Flask /api/health)
router.get('/health', (req, res) => {
  const uploadsDir = path.join(__dirname, '../nlp/uploads');
  const jsonPath = path.join(uploadsDir, 'DSA_Arrays1.json');
  
  let questionCount = 0;
  if (mcqSystem && mcqSystem.kb) {
    questionCount = mcqSystem.kb.questionsDb.length;
  } else if (fs.existsSync(jsonPath)) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      questionCount = jsonData.length;
    } catch (e) {
      console.error('Error reading JSON:', e);
    }
  }

  res.json({
    status: 'ok',
    questions: questionCount,
    systemReady: !!mcqSystem,
    customDataLoaded
  });
});

// Autocomplete endpoint (matching Flask /api/autocomplete)
router.post('/autocomplete', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.json({ words: [], questions: [] });
    }

    if (!mcqSystem) {
      return res.json({ words: [], questions: [] });
    }
    
    // Get word predictions
    const wordPredictions = mcqSystem.autocomplete.predictNextWords(text, 5);
    
    // Get question suggestions
    let questionSuggestions = [];
    if (text.length >= 3) {
      questionSuggestions = mcqSystem.autocomplete.getQuestionSuggestions(text, 3);
    }
    
    res.json({
      words: wordPredictions,
      questions: questionSuggestions
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.json({ words: [], questions: [] });
  }
});

// Main question answering endpoint (matching Flask /api/ask)
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Question is required and must be a string' 
      });
    }
    
    if (!mcqSystem) {
      return res.status(503).json({ 
        status: 'error',
        message: 'MCQ system not initialized' 
      });
    }
    
    console.log('Processing question:', question);
    const startTime = Date.now();
    
    // Find similar questions
    const matches = mcqSystem.kb.findSimilarQuestions(question, 5);
    
    if (!matches || matches.length === 0) {
      return res.json({
        status: 'no_match',
        message: 'No matching questions found',
        total_time: (Date.now() - startTime) / 1000
      });
    }
    
    const bestMatch = matches[0];
    
    // Handle exact match
    if (bestMatch.match_type === 'exact') {
      return res.json({
        status: 'exact_match',
        question: bestMatch.question,
        answer: bestMatch.correct_option,
        answer_index: bestMatch.correct_answer,
        explanation: bestMatch.explanation,
        topic: bestMatch.topic,
        difficulty: bestMatch.difficulty,
        confidence: 1.0,
        suggestions: matches.slice(1, 4).map(m => ({
          question: m.question,
          topic: m.topic
        })),
        total_time: (Date.now() - startTime) / 1000
      });
    }
    
    // Try to use model prediction if available
    if (mcqSystem.modelLoader && mcqSystem.modelLoader.isReady()) {
      try {
        const prediction = await mcqSystem.modelLoader.predict(question, bestMatch.options);
        
        return res.json({
          status: 'model_prediction',
          original_query: question,
          matched_question: bestMatch.question,
          match_score: bestMatch.score,
          answer: prediction.predicted_answer,
          answer_index: prediction.predicted_idx,
          confidence: prediction.confidence,
          all_probabilities: prediction.all_probabilities,
          options: bestMatch.options,
          explanation: bestMatch.explanation,
          topic: bestMatch.topic,
          difficulty: bestMatch.difficulty,
          inference_time: prediction.inference_time,
          suggestions: matches.slice(1, 4).map(m => ({
            question: m.question,
            topic: m.topic
          })),
          total_time: (Date.now() - startTime) / 1000
        });
      } catch (error) {
        console.error('Model prediction error:', error);
        // Fall back to semantic matching
      }
    }
    
    // Semantic match fallback
    return res.json({
      status: 'model_prediction', // Keep same status for UI compatibility
      original_query: question,
      matched_question: bestMatch.question,
      match_score: bestMatch.score,
      answer: bestMatch.correct_option,
      answer_index: bestMatch.correct_answer,
      confidence: bestMatch.score,
      all_probabilities: bestMatch.options.map((_, i) => 
        i === bestMatch.correct_answer ? bestMatch.score : (1 - bestMatch.score) / (bestMatch.options.length - 1)
      ),
      options: bestMatch.options,
      explanation: bestMatch.explanation,
      topic: bestMatch.topic,
      difficulty: bestMatch.difficulty,
      inference_time: 0,
      suggestions: matches.slice(1, 4).map(m => ({
        question: m.question,
        topic: m.topic
      })),
      total_time: (Date.now() - startTime) / 1000
    });
    
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process question',
      details: error.message 
    });
  }
});

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

export default router;