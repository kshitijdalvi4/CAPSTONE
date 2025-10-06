import React, { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, Brain, Clock, Target, Sparkles } from 'lucide-react';
import axios from 'axios';

interface MCQResult {
  status: string;
  question: string;
  answer: string;
  answer_index: number;
  explanation: string;
  topic: string;
  difficulty: string;
  confidence: number;
  options: string[];
  suggestions?: Array<{
    question: string;
    topic: string;
    difficulty: string;
  }>;
  total_time: number;
}

interface AutocompleteResult {
  word_predictions: string[];
  question_suggestions: string[];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize NLP system on component mount
    const initializeNLP = async () => {
      try {
        await axios.post('/api/nlp/initialize');
        console.log('NLP system initialized');
      } catch (error) {
        console.error('Failed to initialize NLP system:', error);
      }
    };
    
    initializeNLP();
  }, []);

  const handleAutocomplete = async (text: string) => {
    if (text.length < 2) {
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await axios.post('/api/nlp/autocomplete', { text });
      setAutocomplete(response.data);
      setShowAutocomplete(true);
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
      const response = await axios.post('/api/nlp/query', { query });
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

    const statusEmoji = result.status === 'exact_match' ? '🎯' : '🔍';
    const confidenceBar = '█'.repeat(Math.floor(result.confidence * 10)) + '░'.repeat(10 - Math.floor(result.confidence * 10));
    
    return `${statusEmoji} **${result.status === 'exact_match' ? 'Exact Match' : 'Similar Question'}**

**Answer:** ${result.answer}

**Confidence:** ${confidenceBar} ${(result.confidence * 100).toFixed(1)}%

**Topic:** ${result.topic} | **Difficulty:** ${result.difficulty}

**Explanation:** ${result.explanation}

*Response time: ${(result.total_time * 1000).toFixed(0)}ms*`;
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
                    
                    {message.result && message.result.options && (
                      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">All Options:</h4>
                        <div className="space-y-1">
                          {message.result.options.map((option, idx) => (
                            <div key={idx} className={`text-sm p-2 rounded ${
                              idx === message.result!.answer_index 
                                ? 'bg-green-600/20 text-green-300 border border-green-600/30' 
                                : 'text-gray-400'
                            }`}>
                              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                              {idx === message.result!.answer_index && (
                                <span className="ml-2 text-xs">✓ Correct</span>
                              )}
                            </div>
                          ))}
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
                  <span className="text-gray-400">Thinking...</span>
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
              {autocomplete.word_predictions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400 font-medium">💡 Suggested words: </span>
                  {autocomplete.word_predictions.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const words = query.split(' ');
                        if (query.endsWith(' ')) {
                          setQuery(query + word + ' ');
                        } else {
                          words[words.length - 1] = word;
                          setQuery(words.join(' ') + ' ');
                        }
                        setShowAutocomplete(false);
                      }}
                      className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
              
              {autocomplete.question_suggestions.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400 font-medium">📝 Similar questions:</span>
                  <div className="mt-1 space-y-1">
                    {autocomplete.question_suggestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(question);
                          setShowAutocomplete(false);
                        }}
                        className="block text-left text-xs text-blue-300 hover:text-blue-200 hover:underline"
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