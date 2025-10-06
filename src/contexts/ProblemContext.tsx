import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  nextMCQ: () => void;
  resetMCQ: () => void;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

const sampleProblem: Problem = {
  id: '1',
  title: 'Two Sum',
  difficulty: 'Easy',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
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
      output: '[1,2]'
    },
    {
      input: 'nums = [3,3], target = 6',
      output: '[0,1]'
    }
  ],
  tags: ['Array', 'Hash Table'],
  hints: [
    'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
    'Try using a hash table to store the complement of each number.',
    'The complement of a number x is target - x. Check if the complement exists in the hash table.',
    'You can solve this in O(n) time with a single pass through the array using a hash map.'
  ],
  optimalSolution: `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`
};

const sampleMCQs: MCQQuestion[] = [
  {
    id: '1',
    question: 'What is the most suitable data structure for solving the Two Sum problem efficiently?',
    options: ['Array', 'Linked List', 'Hash Table', 'Stack'],
    correctAnswer: 2,
    explanation: 'Hash Table provides O(1) average time complexity for lookups, making it ideal for finding complements.',
    category: 'data-structure'
  },
  {
    id: '2',
    question: 'What is the time complexity of the optimal solution?',
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
    correctAnswer: 2,
    explanation: 'Using a hash table, we can solve this in O(n) time by making a single pass through the array.',
    category: 'algorithm'
  }
];

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(sampleProblem);
  const [mcqQuestions] = useState<MCQQuestion[]>(sampleMCQs);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);

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
      nextMCQ,
      resetMCQ
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