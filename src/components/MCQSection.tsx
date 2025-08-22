import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, Brain, Clock } from 'lucide-react';
import { useProblem } from '../contexts/ProblemContext';

interface MCQSectionProps {
  onComplete: () => void;
}

export default function MCQSection({ onComplete }: MCQSectionProps) {
  const { mcqQuestions, currentMCQIndex, nextMCQ } = useProblem();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [answerTime, setAnswerTime] = useState<number | null>(null);

  const currentQuestion = mcqQuestions[currentMCQIndex];

  if (!currentQuestion) {
    return null;
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setAnswerTime(Date.now() - startTime);
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentMCQIndex < mcqQuestions.length - 1) {
      nextMCQ();
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswered(false);
    } else {
      onComplete();
    }
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Brain className="h-5 w-5 text-blue-400 mr-2" />
          Understanding Check ({currentMCQIndex + 1}/{mcqQuestions.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          {mcqQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentMCQIndex
                  ? 'bg-blue-400'
                  : index < currentMCQIndex
                    ? 'bg-green-400'
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-gray-300 text-lg mb-4">{currentQuestion.question}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={answered}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  answered
                    ? selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-red-100 border-red-500 text-red-800'
                      : index === currentQuestion.correctAnswer
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                
                {answered && selectedAnswer === index && (
                  <span className="float-right">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </span>
                )}
                
                {answered && index === currentQuestion.correctAnswer && selectedAnswer !== index && (
                  <CheckCircle className="h-5 w-5 text-green-600 float-right" />
                )}
              </button>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-900/20 border border-green-600/30' : 'bg-red-900/20 border border-red-600/30'
          }`}>
            <h4 className={`font-medium mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </h4>
            <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
            {answerTime && (
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                Answered in {Math.round(answerTime / 1000)}s
              </div>
            )}
          </div>
        )}

        {answered && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {currentMCQIndex < mcqQuestions.length - 1 ? 'Next Question' : 'Start Coding'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}