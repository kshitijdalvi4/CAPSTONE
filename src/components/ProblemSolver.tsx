import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Lightbulb, Play, RotateCcw, Settings, Eye, EyeOff } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useProblem } from '../contexts/ProblemContext';
import CodeEditor from './CodeEditor';
import MCQSection from './MCQSection';
import Timer from './Timer';
import OptimalSolution from './OptimalSolution';

export default function ProblemSolver() {
  const { currentProblem } = useProblem();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [phase, setPhase] = useState<'reading' | 'mcq' | 'coding' | 'completed'>('reading');
  const [showOptimalSolution, setShowOptimalSolution] = useState(false);
  const [solutionWorked, setSolutionWorked] = useState<boolean | null>(null);
  const [hintInterval, setHintInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase === 'coding' && timerRunning) {
      // Set up hint intervals every 7-10 minutes
      const interval = setInterval(() => {
        if (!showHint) {
          setShowHint(true);
        }
      }, 420000); // 7 minutes
      
      setHintInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [phase, timerRunning, showHint]);

  if (!currentProblem) {
    return <div className="text-white p-8">No problem selected</div>;
  }

  const handleStartCoding = () => {
    setPhase('coding');
    setTimerRunning(true);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setPhase('completed');
    setTimerRunning(false);
    setShowOptimalSolution(true);
    if (hintInterval) {
      clearInterval(hintInterval);
    }
  };

  const handleSolutionFeedback = (worked: boolean) => {
    setSolutionWorked(worked);
    if (!worked) {
      // Restart the process for debugging
      setPhase('reading');
      setIsCompleted(false);
      setShowOptimalSolution(false);
      setTimerRunning(false);
    }
  };

  const nextHint = () => {
    if (currentHintIndex < currentProblem.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Section - Timer and Status */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Timer running={timerRunning} />
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Status:</span>
              {isCompleted ? (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  Completed
                </div>
              ) : (
                <div className="flex items-center text-yellow-400">
                  <Clock className="h-5 w-5 mr-1" />
                  In Progress
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400">
              Phase: <span className="text-white capitalize">{phase}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Hint
            </button>
            
            {phase === 'coding' && (
              <button
                onClick={handleComplete}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I'm Done!
              </button>
            )}

            {phase === 'completed' && showOptimalSolution && (
              <button
                onClick={() => setShowOptimalSolution(!showOptimalSolution)}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {showOptimalSolution ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showOptimalSolution ? 'Hide' : 'Show'} Optimal Solution
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint Panel */}
      {showHint && (
        <div className="bg-yellow-900/20 border-b border-yellow-600/30 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-yellow-400 font-medium mb-2">
                  Hint {currentHintIndex + 1} of {currentProblem.hints.length}
                </h3>
                <p className="text-gray-300">{currentProblem.hints[currentHintIndex]}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {currentHintIndex < currentProblem.hints.length - 1 && (
                  <button
                    onClick={nextHint}
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    Next Hint →
                  </button>
                )}
                <button
                  onClick={() => setShowHint(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Problem Description (50%) */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-gray-900 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">{currentProblem.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentProblem.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentProblem.tags.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-white mb-3">Problem Description</h3>
                  <p className="text-gray-300 mb-6 whitespace-pre-line">{currentProblem.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-md font-semibold text-white mb-2">Input Format</h4>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <code className="text-gray-300">{currentProblem.inputFormat}</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-white mb-2">Output Format</h4>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <code className="text-gray-300">{currentProblem.outputFormat}</code>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-md font-semibold text-white mb-3">Constraints</h4>
                  <ul className="text-gray-300 mb-6">
                    {currentProblem.constraints.map((constraint, index) => (
                      <li key={index} className="mb-1">• {constraint}</li>
                    ))}
                  </ul>

                  <h4 className="text-md font-semibold text-white mb-3">Examples</h4>
                  <div className="space-y-4">
                    {currentProblem.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <div className="mb-2">
                          <strong className="text-white">Input:</strong>
                          <code className="ml-2 text-gray-300">{testCase.input}</code>
                        </div>
                        <div className="mb-2">
                          <strong className="text-white">Output:</strong>
                          <code className="ml-2 text-gray-300">{testCase.output}</code>
                        </div>
                        {testCase.explanation && (
                          <div className="text-sm text-gray-400">
                            <strong>Explanation:</strong> {testCase.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {phase === 'reading' && (
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setPhase('mcq')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      I understand the problem - Continue to Questions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-gray-600 transition-colors cursor-col-resize" />

          {/* Right Panel - Code Editor (50%) */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-gray-800">
              {showOptimalSolution && phase === 'completed' ? (
                <OptimalSolution 
                  problem={currentProblem} 
                  onSolutionFeedback={handleSolutionFeedback}
                  solutionWorked={solutionWorked}
                />
              ) : (
                <CodeEditor onStartCoding={handleStartCoding} phase={phase} />
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Bottom Section - MCQ */}
      {phase === 'mcq' && (
        <div className="h-64 bg-gray-800 border-t border-gray-700 flex-shrink-0">
          <MCQSection onComplete={() => setPhase('coding')} />
        </div>
      )}
    </div>
  );
}