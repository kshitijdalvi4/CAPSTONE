const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// Path to Python script
const PYTHON_SCRIPT = path.join(__dirname, '../nlp/mcq_system.py');

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
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }
    
    const result = await runPythonScript('autocomplete', [text]);
    res.json(result);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to get autocomplete suggestions', details: error.message });
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