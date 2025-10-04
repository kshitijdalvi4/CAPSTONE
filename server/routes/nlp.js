const express = require('express');
const { initializeMCQSystem } = require('../nlp/mcq_system');
const router = express.Router();

// Initialize Node.js NLP system
let mcqSystem = null;

function initializeMCQ() {
  try {
    console.log('🔮 Initializing MCQ system...');
    mcqSystem = initializeMCQSystem();
    console.log('✅ MCQ system ready');
  } catch (error) {
    console.error('❌ Failed to initialize MCQ system:', error);
  }
}

// Initialize on startup  
initializeMCQ();

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
    await runPythonScript('init');
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
    
    const result = await runPythonScript('query', [query]);
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
      words: wordPredictions,
      questions: questionSuggestions
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

module.exports = router;

export default runPythonScript