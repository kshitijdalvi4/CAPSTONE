import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import nlpService from '../services/nlpService.js';
import Problem from '../models/Problem.js';
import MCQQuestion from '../models/MCQQuestion.js';
import BookContent from '../models/BookContent.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize NLP system and process book content
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    // Check if book content is already processed
    let bookContent = await BookContent.findOne({ processed: true });
    
    if (!bookContent) {
      // Read the book content from file
      const bookPath = path.join(__dirname, '../../NLP/book_content.txt');
      const content = fs.readFileSync(bookPath, 'utf-8');
      
      // Process book content using NLP service
      const processedData = await nlpService.processBookContent(content);
      
      // Save to database
      bookContent = new BookContent({
        title: 'DSA Capstone Book',
        content: content,
        chunks: processedData.chunks || [],
        processed: true,
        processedAt: new Date()
      });
      
      await bookContent.save();
    }
    
    res.json({
      success: true,
      message: 'NLP system initialized successfully',
      chunksCount: bookContent.chunks.length
    });
  } catch (error) {
    console.error('NLP initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize NLP system',
      error: error.message
    });
  }
});

// Generate MCQ questions for a topic
router.post('/generate-mcq', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'beginner', count = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }
    
    // Generate questions using NLP service
    const result = await nlpService.generateMCQQuestions(topic, difficulty, count);
    
    if (result.status === 'success') {
      // Save questions to database
      const savedQuestions = [];
      for (const questionData of result.questions) {
        const mcqQuestion = new MCQQuestion({
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          category: questionData.category,
          difficulty: questionData.difficulty
        });
        
        const saved = await mcqQuestion.save();
        savedQuestions.push(saved);
      }
      
      res.json({
        success: true,
        questions: savedQuestions
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to generate MCQ questions'
      });
    }
  } catch (error) {
    console.error('MCQ generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate MCQ questions',
      error: error.message
    });
  }
});

// Generate coding problems for a topic
router.post('/generate-problems', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'Easy', count = 3 } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }
    
    // Generate problems using NLP service
    const result = await nlpService.generateProblems(topic, difficulty, count);
    
    if (result.status === 'success') {
      // Save problems to database
      const savedProblems = [];
      for (const problemData of result.problems) {
        const problem = new Problem({
          title: problemData.title,
          difficulty: problemData.difficulty,
          description: problemData.description,
          inputFormat: problemData.inputFormat,
          outputFormat: problemData.outputFormat,
          constraints: problemData.constraints,
          testCases: problemData.testCases,
          tags: problemData.tags,
          hints: problemData.hints,
          category: topic
        });
        
        const saved = await problem.save();
        savedProblems.push(saved);
      }
      
      res.json({
        success: true,
        problems: savedProblems
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to generate problems'
      });
    }
  } catch (error) {
    console.error('Problem generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate problems',
      error: error.message
    });
  }
});

// Get personalized recommendations
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { performance } = req.body;
    const userId = req.user.id;
    
    // Get recommendations using NLP service
    const result = await nlpService.getRecommendations(userId, performance || {});
    
    if (result.status === 'success') {
      res.json({
        success: true,
        recommendations: result.recommendations
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to get recommendations'
      });
    }
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get all problems
router.get('/problems', authenticateToken, async (req, res) => {
  try {
    const { difficulty, category, limit = 10 } = req.query;
    
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = new RegExp(category, 'i');
    
    const problems = await Problem.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      problems
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get problems',
      error: error.message
    });
  }
});

// Get problem by ID
router.get('/problems/:id', authenticateToken, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    res.json({
      success: true,
      problem
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get problem',
      error: error.message
    });
  }
});

// Get MCQ questions for a problem
router.get('/problems/:id/mcq', authenticateToken, async (req, res) => {
  try {
    const { count = 5 } = req.query;
    
    // Get random MCQ questions
    const questions = await MCQQuestion.aggregate([
      { $sample: { size: parseInt(count) } }
    ]);
    
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Get MCQ questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MCQ questions',
      error: error.message
    });
  }
});

// Get book content chunks
router.get('/book-content', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    
    const bookContent = await BookContent.findOne({ processed: true });
    
    if (!bookContent) {
      return res.status(404).json({
        success: false,
        message: 'Book content not found. Please initialize the system first.'
      });
    }
    
    let chunks = bookContent.chunks;
    
    // Filter by topic if provided
    if (topic) {
      chunks = chunks.filter(chunk => 
        chunk.topic.toLowerCase().includes(topic.toLowerCase())
      );
    }
    
    // Filter by difficulty if provided
    if (difficulty) {
      chunks = chunks.filter(chunk => chunk.difficulty === difficulty);
    }
    
    res.json({
      success: true,
      chunks,
      totalChunks: bookContent.chunks.length
    });
  } catch (error) {
    console.error('Get book content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get book content',
      error: error.message
    });
  }
});

export default router;