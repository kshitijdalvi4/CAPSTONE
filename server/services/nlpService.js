import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NLPService {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../../NLP/nlp_processor.py');
    this.isInitialized = false;
  }

  async initializeNLP() {
    if (this.isInitialized) return;

    try {
      const options = {
        mode: 'text',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.dirname(this.pythonScriptPath),
        args: ['--initialize']
      };

      await new Promise((resolve, reject) => {
        PythonShell.run('nlp_processor.py', options, (err, results) => {
          if (err) reject(err);
          else {
            console.log('NLP System initialized:', results);
            this.isInitialized = true;
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize NLP system:', error);
      throw error;
    }
  }

  async processBookContent(bookContent) {
    await this.initializeNLP();

    try {
      const options = {
        mode: 'json',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.dirname(this.pythonScriptPath),
        args: ['--process-book']
      };

      const results = await new Promise((resolve, reject) => {
        const pyshell = new PythonShell('nlp_processor.py', options);
        
        // Send book content to Python script
        pyshell.send(JSON.stringify({ content: bookContent }));
        
        pyshell.on('message', (message) => {
          resolve(message);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to process book content:', error);
      throw error;
    }
  }

  async generateMCQQuestions(topic, difficulty = 'beginner', count = 5) {
    await this.initializeNLP();

    try {
      const options = {
        mode: 'json',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.dirname(this.pythonScriptPath),
        args: ['--generate-mcq']
      };

      const results = await new Promise((resolve, reject) => {
        const pyshell = new PythonShell('nlp_processor.py', options);
        
        pyshell.send(JSON.stringify({ 
          topic, 
          difficulty, 
          count 
        }));
        
        pyshell.on('message', (message) => {
          resolve(message);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to generate MCQ questions:', error);
      throw error;
    }
  }

  async generateProblems(topic, difficulty = 'Easy', count = 3) {
    await this.initializeNLP();

    try {
      const options = {
        mode: 'json',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.dirname(this.pythonScriptPath),
        args: ['--generate-problems']
      };

      const results = await new Promise((resolve, reject) => {
        const pyshell = new PythonShell('nlp_processor.py', options);
        
        pyshell.send(JSON.stringify({ 
          topic, 
          difficulty, 
          count 
        }));
        
        pyshell.on('message', (message) => {
          resolve(message);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to generate problems:', error);
      throw error;
    }
  }

  async getRecommendations(userId, userPerformance) {
    await this.initializeNLP();

    try {
      const options = {
        mode: 'json',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.dirname(this.pythonScriptPath),
        args: ['--get-recommendations']
      };

      const results = await new Promise((resolve, reject) => {
        const pyshell = new PythonShell('nlp_processor.py', options);
        
        pyshell.send(JSON.stringify({ 
          userId, 
          performance: userPerformance 
        }));
        
        pyshell.on('message', (message) => {
          resolve(message);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw error;
    }
  }
}

export default new NLPService();