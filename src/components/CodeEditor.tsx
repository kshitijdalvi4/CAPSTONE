import React, { useState } from 'react';
import { Play, Download, RotateCcw, Code2, ExternalLink } from 'lucide-react';

interface CodeEditorProps {
  onStartCoding: () => void;
  phase: string;
}

export default function CodeEditor({ onStartCoding, phase }: CodeEditorProps) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(`# Write your solution here
def twoSum(nums, target):
    # Your code here
    pass`);

  const languages = [
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'cpp', name: 'C++', ext: '.cpp' }
  ];

  const getStarterCode = (lang: string) => {
    switch (lang) {
      case 'python':
        return `# Write your solution here
def twoSum(nums, target):
    # Your code here
    pass`;
      case 'javascript':
        return `// Write your solution here
function twoSum(nums, target) {
    // Your code here
}`;
      case 'java':
        return `// Write your solution here
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`;
      case 'cpp':
        return `// Write your solution here
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`;
      default:
        return '';
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
  };

  const handleRunCode = () => {
    if (phase === 'reading') {
      onStartCoding();
    }
    // In a real implementation, this would execute the code
    console.log('Running code:', code);
  };

  const handleReset = () => {
    setCode(getStarterCode(language));
  };

  const handleExportToLeetCode = () => {
    // Export to LeetCode - in real implementation, this would integrate with LeetCode API
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution${languages.find(l => l.id === language)?.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Also open LeetCode in new tab
    window.open('https://leetcode.com/problems/two-sum/', '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="bg-gray-700 p-3 border-b border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Code2 className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">Code Editor</span>
          </div>
          
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-600 text-white text-sm rounded px-2 py-1 border border-gray-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            <Play className="h-3 w-3 mr-1" />
            {phase === 'reading' ? 'Start Coding' : 'Run'}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </button>
          
          <button
            onClick={handleExportToLeetCode}
            className="flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Export to LeetCode
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
          placeholder="Write your solution here..."
          spellCheck={false}
        />
        
        {/* Line numbers could be added here */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gray-800 border-r border-gray-600 text-gray-500 text-xs font-mono p-2 pointer-events-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="h-5 leading-5">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Footer */}
      <div className="bg-gray-700 p-2 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
        </div>
      </div>
    </div>
  );
}