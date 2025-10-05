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
      
      // Sample problems for demo
      const sampleProblems: { [key: string]: Problem } = {
        'sample-1': {
          id: 'sample-1',
          title: 'Two Sum',
          difficulty: 'Easy',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
          inputFormat: 'nums = [2,7,11,15], target = 9',
          outputFormat: '[0,1]',
          constraints: [
            '2 ≤ nums.length ≤ 10⁴',
            '-10⁹ ≤ nums[i] ≤ 10⁹',
            '-10⁹ ≤ target ≤ 10⁹',
            'Only one valid answer exists.'
          ],
          testCases: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
              input: 'nums = [3,2,4], target = 6',
              output: '[1,2]',
              explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
            }
          ],
          tags: ['Array', 'Hash Table'],
          hints: [
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.',
            'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?',
            'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?'
          ],
          optimalSolution: ''
        },
        'sample-2': {
          id: 'sample-2',
          title: 'Binary Search',
          difficulty: 'Easy',
          description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
          inputFormat: 'nums = [-1,0,3,5,9,12], target = 9',
          outputFormat: '4',
          constraints: [
            '1 ≤ nums.length ≤ 10⁴',
            '-10⁴ < nums[i], target < 10⁴',
            'All the integers in nums are unique.',
            'nums is sorted in ascending order.'
          ],
          testCases: [
            {
              input: 'nums = [-1,0,3,5,9,12], target = 9',
              output: '4',
              explanation: '9 exists in nums and its index is 4'
            },
            {
              input: 'nums = [-1,0,3,5,9,12], target = 2',
              output: '-1',
              explanation: '2 does not exist in nums so return -1'
            }
          ],
          tags: ['Array', 'Binary Search'],
          hints: [
            'The array is sorted, so we can use binary search to find the target efficiently.',
            'Compare the target with the middle element and eliminate half of the search space.',
            'Keep track of left and right pointers and update them based on the comparison.'
          ],
          optimalSolution: ''
        },
        'sample-3': {
          id: 'sample-3',
          title: 'Linked List Cycle',
          difficulty: 'Medium',
          description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Internally, pos is used to denote the index of the node that tail\'s next pointer is connected to. Note that pos is not passed as a parameter.\n\nReturn true if there is a cycle in the linked list. Otherwise, return false.',
          inputFormat: 'head = [3,2,0,-4], pos = 1',
          outputFormat: 'true',
          constraints: [
            'The number of the nodes in the list is in the range [0, 10⁴].',
            '-10⁵ ≤ Node.val ≤ 10⁵',
            'pos is -1 or a valid index in the linked-list.'
          ],
          testCases: [
            {
              input: 'head = [3,2,0,-4], pos = 1',
              output: 'true',
              explanation: 'There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).'
            },
            {
              input: 'head = [1,2], pos = 0',
              output: 'true',
              explanation: 'There is a cycle in the linked list, where the tail connects to the 0th node.'
            },
            {
              input: 'head = [1], pos = -1',
              output: 'false',
              explanation: 'There is no cycle in the linked list.'
            }
          ],
          tags: ['Linked List', 'Two Pointers'],
          hints: [
            'Think about using two pointers moving at different speeds.',
            'If there is a cycle, the faster pointer will eventually meet the slower pointer.',
            'This is known as Floyd\'s Cycle Detection Algorithm or the "tortoise and hare" algorithm.'
          ],
          optimalSolution: ''
        }
      };

      const problem = sampleProblems[problemId];
      if (problem) {
        
        setCurrentProblem(problem);
        // Generate MCQ questions for this problem
        await generateMCQForProblem(problem.tags[0] || 'general');
      } else {
        // Try to load from API if not a sample problem
        try {
          const result = await nlpService.getProblemById(problemId);
          if (result.success) {
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
            await generateMCQForProblem(problem.tags[0] || 'general');
          }
        } catch (apiError) {
          console.error('Failed to load problem from API:', apiError);
        }
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