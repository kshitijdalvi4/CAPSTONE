import React, { useState } from 'react';
import { CheckCircle, XCircle, Code2, BookOpen, Lightbulb, RotateCcw } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  optimalSolution?: string;
}

interface OptimalSolutionProps {
  problem: Problem;
  onSolutionFeedback: (worked: boolean) => void;
  solutionWorked: boolean | null;
}

export default function OptimalSolution({ problem, onSolutionFeedback, solutionWorked }: OptimalSolutionProps) {
  const [language, setLanguage] = useState('python');

  const optimalSolutions = {
    python: `def twoSum(nums, target):
    """
    Optimal Solution using Hash Map
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in hash map
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    return []  # No solution found`,
    
    javascript: `function twoSum(nums, target) {
    /**
     * Optimal Solution using Hash Map
     * Time Complexity: O(n)
     * Space Complexity: O(n)
     */
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        // Check if complement exists in hash map
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        // Store current number and its index
        numMap.set(nums[i], i);
    }
    
    return []; // No solution found
}`,
    
    java: `class Solution {
    /**
     * Optimal Solution using HashMap
     * Time Complexity: O(n)
     * Space Complexity: O(n)
     */
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> numMap = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            // Check if complement exists in hash map
            if (numMap.containsKey(complement)) {
                return new int[]{numMap.get(complement), i};
            }
            
            // Store current number and its index
            numMap.put(nums[i], i);
        }
        
        return new int[]{}; // No solution found
    }
}`,
    
    cpp: `class Solution {
public:
    /**
     * Optimal Solution using unordered_map
     * Time Complexity: O(n)
     * Space Complexity: O(n)
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            // Check if complement exists in hash map
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            
            // Store current number and its index
            numMap[nums[i]] = i;
        }
        
        return {}; // No solution found
    }
};`
  };

  const languages = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' }
  ];

  const approaches = [
    {
      name: 'Brute Force',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'Check every pair of numbers to find the target sum.',
      pros: ['Simple to understand', 'No extra space needed'],
      cons: ['Inefficient for large arrays', 'Quadratic time complexity']
    },
    {
      name: 'Hash Map (Optimal)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description: 'Use a hash map to store complements and find the solution in one pass.',
      pros: ['Linear time complexity', 'Single pass through array'],
      cons: ['Uses extra space for hash map']
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="bg-gray-700 p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Optimal Solution</span>
          </div>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-600 text-white text-sm rounded px-3 py-1 border border-gray-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Solution Feedback */}
        {solutionWorked === null && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-2">Did your solution work on LeetCode?</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => onSolutionFeedback(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Yes, it worked!
              </button>
              <button
                onClick={() => onSolutionFeedback(false)}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                No, there were issues
              </button>
            </div>
          </div>
        )}

        {solutionWorked === true && (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center text-green-400">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Great job! Your solution worked perfectly.</span>
            </div>
          </div>
        )}

        {solutionWorked === false && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-400">
                <XCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Let's debug this together. Study the optimal solution below.</span>
              </div>
              <button
                onClick={() => onSolutionFeedback(false)}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Approach Comparison */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
            Solution Approaches
          </h3>
          <div className="grid gap-4">
            {approaches.map((approach, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                approach.name.includes('Optimal') 
                  ? 'bg-green-900/20 border-green-600/30' 
                  : 'bg-gray-700/50 border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{approach.name}</h4>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-400">Time: {approach.timeComplexity}</span>
                    <span className="text-purple-400">Space: {approach.spaceComplexity}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{approach.description}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-400 font-medium">Pros:</span>
                    <ul className="text-gray-300 mt-1">
                      {approach.pros.map((pro, i) => (
                        <li key={i} className="ml-2">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-red-400 font-medium">Cons:</span>
                    <ul className="text-gray-300 mt-1">
                      {approach.cons.map((con, i) => (
                        <li key={i} className="ml-2">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Code */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Code2 className="h-5 w-5 text-blue-400 mr-2" />
            Optimal Implementation
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <pre className="text-gray-100 font-mono text-sm overflow-x-auto">
              <code>{optimalSolutions[language as keyof typeof optimalSolutions]}</code>
            </pre>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>The hash map approach reduces time complexity from O(n²) to O(n) by trading space for time.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>We store each number and its index as we iterate, checking if the complement exists.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>This ensures we don't use the same element twice and find the solution in a single pass.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Hash map lookups are O(1) on average, making this the most efficient solution.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}