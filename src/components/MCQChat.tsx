import React, { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, Brain, Clock, Target, Sparkles, CircleCheck as CheckCircle } from 'lucide-react';
import axios from 'axios';

interface MCQResult {
  status: string;
  question?: string;
  original_query?: string;
  matched_question?: string;
  answer: string;
  answer_index: number;
  explanation: string;
  topic: string;
  difficulty: string;
  confidence: number;
  match_score?: number;
  options?: string[];
  all_probabilities?: number[];
  inference_time?: number;
  suggestions?: Array<{
    question: string;
    topic: string;
  }>;
  total_time: number;
  message?: string;
}

interface AutocompleteResult {
  words: string[];
  questions: string[];
}

export default function MCQChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    result?: MCQResult;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState<AutocompleteResult | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check system health on component mount
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await axios.get('/api/nlp/health');
      setSystemStatus(response.data);
      console.log('System status:', response.data);
    } catch (error) {
      console.error('Failed to check system health:', error);
    }
  };

  const handleAutocomplete = async (text: string) => {
    if (text.length < 2) {
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await axios.post('/api/nlp/autocomplete', { text });
      setAutocomplete(response.data);
      setShowAutocomplete(response.data.words.length > 0 || response.data.questions.length > 0);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setShowAutocomplete(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = {
      type: 'user' as const,
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowAutocomplete(false);

    try {
      const response = await axios.post('/api/nlp/ask', { question: query });
      const result: MCQResult = response.data;

      const assistantMessage = {
        type: 'assistant' as const,
        content: formatAnswer(result),
        result,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage = {
        type: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const formatAnswer = (result: MCQResult): string => {
    if (result.status === 'no_match') {
      return "I couldn't find a matching question in my knowledge base. Try rephrasing your question or use different keywords.";
    }

    const statusEmoji = result.status === 'exact_match' ? '🎯' : '🤖';
    const statusText = result.status === 'exact_match' ? 'EXACT MATCH' : 
      `AI PREDICTION${result.match_score ? ` (${(result.match_score * 100).toFixed(0)}% match)` : ''}`;
    
    const confidenceBar = '█'.repeat(Math.floor(result.confidence * 10)) + '░'.repeat(10 - Math.floor(result.confidence * 10));
    
    let response = `${statusEmoji} **${statusText}**

**Question:** ${result.original_query || result.question || 'N/A'}

**Answer (Option ${result.answer_index + 1}):** ${result.answer}

**Confidence:** ${confidenceBar} ${(result.confidence * 100).toFixed(1)}%

**Topic:** ${result.topic} | **Difficulty:** ${result.difficulty}

**Explanation:** ${result.explanation}`;

    if (result.inference_time) {
      response += `\n\n**Inference Time:** ${(result.inference_time * 1000).toFixed(1)}ms`;
    }
    
    response += `\n\n**Total Time:** ${(result.total_time * 1000).toFixed(0)}ms`;

    return response;
  };

  const addWordToQuery = (word: string) => {
    const words = query.split(' ');
    if (query.endsWith(' ')) {
      setQuery(query + word + ' ');
    } else {
      words[words.length - 1] = word;
      setQuery(words.join(' ') + ' ');
    }
    setShowAutocomplete(false);
  };

  const setQuestionFromSuggestion = (question: string) => {
    setQuery(question);
    setShowAutocomplete(false);
  };

  const exampleQuestions = [
    "What is the time complexity of binary search?",
    "Which data structure uses LIFO principle?",
    "What is the space complexity of merge sort?",
    "How does hash table lookup work?",
    "What is amortized time complexity?"
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">DSA MCQ Assistant</h1>
              <p className="text-sm text-gray-400">Ask me anything about Data Structures & Algorithms</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            {systemStatus && (
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${systemStatus.systemReady ? 'text-green-400' : 'text-red-400'}`} />
                <span>{systemStatus.questions} questions loaded</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to DSA MCQ Assistant!</h2>
              <p className="text-gray-400 mb-8">Ask me questions about Data Structures and Algorithms</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(question)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors border border-gray-700 hover:border-gray-600"
                  >
                    <Sparkles className="h-4 w-4 text-blue-400 mb-2" />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                {message.type === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.result && message.result.options && message.result.all_probabilities && (
                      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Model Confidence Distribution:</h4>
                        <div className="space-y-2">
                          {message.result.options.map((option, idx) => {
                            const probability = message.result!.all_probabilities![idx];
                            const isCorrect = idx === message.result!.answer_index;
                            return (
                              <div key={idx} className="text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`${isCorrect ? 'text-green-300 font-medium' : 'text-gray-400'}`}>
                                    {isCorrect ? '✓' : ' '} {String.fromCharCode(65 + idx)}. {option.substring(0, 50)}...
                                  </span>
                                  <span className="text-xs">{(probability * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      isCorrect ? 'bg-green-400' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${probability * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {message.result && message.result.suggestions && message.result.suggestions.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">Related Questions:</h4>
                        <div className="space-y-1">
                          {message.result.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuery(suggestion.question)}
                              className="block text-left text-sm text-blue-300 hover:text-blue-200 hover:underline"
                            >
                              • {suggestion.question.substring(0, 80)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-gray-400">Analyzing your question...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Autocomplete */}
          {showAutocomplete && autocomplete && (
            <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
              {autocomplete.words.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400 font-medium">💡 Suggested words: </span>
                  {autocomplete.words.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => addWordToQuery(word)}
                      className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
              
              {autocomplete.questions.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400 font-medium">📝 Similar questions:</span>
                  <div className="mt-1 space-y-1">
                    {autocomplete.questions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuestionFromSuggestion(question)}
                        className="block text-left text-xs text-blue-300 hover:text-blue-200 hover:underline transition-colors"
                      >
                        • {question.substring(0, 100)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleAutocomplete(e.target.value);
                }}
                onFocus={() => query.length >= 2 && setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                placeholder="Ask me about DSA concepts... (e.g., What is the time complexity of...)"
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Lightbulb className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}