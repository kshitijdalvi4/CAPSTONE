import React, { createContext, useContext, useState, ReactNode } from 'react';
import nlpService from '../services/nlpService';

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  testCases: TestCase[];
  tags: string[];
  hints: string[];
  optimalSolution: string;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'data-structure' | 'algorithm' | 'approach';
}

interface ProblemContextType {
  currentProblem: Problem | null;
  mcqQuestions: MCQQuestion[];
  currentMCQIndex: number;
  setCurrentProblem: (problem: Problem) => void;
  loadProblem: (problemId: string) => Promise<void>;
  generateMCQForProblem: (topic: string) => Promise<void>;
  nextMCQ: () => void;
  resetMCQ: () => void;
  loading: boolean;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);


export function ProblemProvider({ children }: { children: ReactNode }) {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadProblem = async (problemId: string) => {
    try {
      setLoading(true);
      const result = await nlpService.getProblemById(problemId);
      
      if (result.success) {
        // Convert MongoDB problem to our Problem interface
        const problem: Problem = {
          id: result.problem._id,
          title: result.problem.title,
          difficulty: result.problem.difficulty,
          description: result.problem.description,
          inputFormat: result.problem.inputFormat,
          outputFormat: result.problem.outputFormat,
          constraints: result.problem.constraints,
          testCases: result.problem.testCases,
          tags: result.problem.tags,
          hints: result.problem.hints,
          optimalSolution: result.problem.optimalSolution || ''
        };
        
        setCurrentProblem(problem);
        
        // Generate MCQ questions for this problem
        await generateMCQForProblem(problem.tags[0] || 'general');
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMCQForProblem = async (topic: string) => {
    try {
      const result = await nlpService.generateMCQQuestions(topic, 'beginner', 3);
      
      if (result.success) {
        // Convert to our MCQQuestion interface
        const questions: MCQQuestion[] = result.questions.map((q: any) => ({
          id: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category
        }));
        
        setMcqQuestions(questions);
        setCurrentMCQIndex(0);
      }
    } catch (error) {
      console.error('Failed to generate MCQ questions:', error);
      // Fallback to empty questions
      setMcqQuestions([]);
    }
  };

  const nextMCQ = () => {
    setCurrentMCQIndex(prev => Math.min(prev + 1, mcqQuestions.length - 1));
  };

  const resetMCQ = () => {
    setCurrentMCQIndex(0);
  };

  return (
    <ProblemContext.Provider value={{
      currentProblem,
      mcqQuestions,
      currentMCQIndex,
      setCurrentProblem,
      loadProblem,
      generateMCQForProblem,
      nextMCQ,
      resetMCQ,
      loading
    }}>
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}