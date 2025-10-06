import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

interface AutocompleteData {
  words: string[];
  questions: string[];
}

export default function DSAChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Welcome to your AI-powered DSA assistant! I can help you understand complex algorithms, data structures, and solve coding problems. Try asking me anything!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState<AutocompleteData>({ words: [], questions: [] });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Update this to match your Flask server URL
  const API_URL = 'http://localhost:5000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time autocomplete (matching your Flask implementation)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (inputValue.length < 2) {
      setShowAutocomplete(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetch(`${API_URL}/autocomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue })
      })
      .then(res => res.json())
      .then(data => {
        setAutocomplete(data);
        setShowAutocomplete(data.words.length > 0 || data.questions.length > 0);
      })
      .catch(error => {
        console.error('Autocomplete error:', error);
        setShowAutocomplete(false);
      });
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, API_URL]);

  const addWord = (word: string) => {
    const words = inputValue.split(' ');
    words[words.length - 1] = word + ' ';
    setInputValue(words.join(' '));
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  const setQuestion = (question: string) => {
    setInputValue(question);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowAutocomplete(false);
    setIsLoading(true);

    try {
      // Call your Flask API (matching your implementation)
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content })
      });

      const data = await response.json();

      let botContent = '';
      
      if (data.status === 'no_match') {
        botContent = 'No matching questions found. Try different keywords or rephrase your question.';
      } else if (data.status === 'exact_match') {
        botContent = `**${data.question}**\n\n**Answer:** ${data.answer}\n\n**Explanation:** ${data.explanation}\n\n**Topic:** ${data.topic} | **Difficulty:** ${data.difficulty} | **Confidence:** ${(data.confidence * 100).toFixed(1)}%`;
      } else if (data.status === 'model_prediction') {
        botContent = `**Question Match:** ${data.matched_question}\n\n**Answer:** ${data.answer}\n\n**Explanation:** ${data.explanation}\n\n**Stats:**\n• Match Score: ${(data.match_score * 100).toFixed(0)}%\n• Confidence: ${(data.confidence * 100).toFixed(1)}%\n• Topic: ${data.topic}\n• Difficulty: ${data.difficulty}\n• Inference Time: ${(data.inference_time * 1000).toFixed(1)}ms`;
      } else {
        botContent = 'Sorry, I encountered an error processing your question. Please try again.';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
        data: data
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t connect to the server. Please make sure the Flask server is running on port 5000 and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // For bot messages, we'll handle formatting in the response display
    return <div className="text-gray-300">{content}</div>;
  };

  const renderBotResponse = (message: Message) => {
    if (!message.data) {
      return formatMessage(message.content);
    }

    const data = message.data;
    
    return (
      <div className="space-y-4">
        {/* Question Match Card */}
        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-blue-400 font-medium text-sm">QUESTION MATCH</span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {data.matched_question || data.question}
          </p>
        </div>

        {/* Answer Card */}
        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-400 font-medium text-sm">ANSWER</span>
          </div>
          <p className="text-gray-200 font-medium">
            {data.answer}
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-purple-400 font-medium text-sm">EXPLANATION</span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {data.explanation}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Match Score</div>
            <div className="text-white font-semibold">{data.match_score ? `${(data.match_score * 100).toFixed(0)}%` : 'N/A'}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Confidence</div>
            <div className="text-white font-semibold">{(data.confidence * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Topic</div>
            <div className="text-white font-semibold">{data.topic}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Difficulty</div>
            <div className="text-white font-semibold">{data.difficulty}</div>
          </div>
        </div>

        {/* Inference Time */}
        {data.inference_time && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Inference Time</div>
            <div className="text-white font-semibold">{(data.inference_time * 1000).toFixed(1)}ms</div>
          </div>
        )}

        {/* Model Confidence Distribution */}
        {data.all_probabilities && data.options && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-400 font-medium text-sm">MODEL CONFIDENCE DISTRIBUTION</span>
            </div>
            <div className="space-y-3">
              {data.options.map((option: string, index: number) => {
                const probability = data.all_probabilities[index];
                const isCorrect = index === data.answer_index;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isCorrect && <span className="text-green-400 text-sm">✓</span>}
                        <span className="text-gray-300 text-sm">
                          {index + 1}. {option.substring(0, 50)}...
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm font-medium">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCorrect ? 'bg-green-500' : 'bg-blue-500'
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
      </div>
    );
  };

  const renderWelcomeMessage = () => {
    if (messages.length > 1) return null;

    const exampleQuestions = [
      {
        question: "What is the time complexity of binary search?",
        category: "Time Complexity",
        icon: "⏱️"
      },
      {
        question: "How does hash table collision resolution work?",
        category: "Hash Tables", 
        icon: "🔗"
      },
      {
        question: "Explain the difference between BFS and DFS",
        category: "Graph Algorithms",
        icon: "🌐"
      },
      {
        question: "What is dynamic programming?",
        category: "Algorithms",
        icon: "🧠"
      },
      {
        question: "How do you detect a cycle in a linked list?",
        category: "Linked Lists",
        icon: "🔄"
      },
      {
        question: "What is the space complexity of merge sort?",
        category: "Sorting",
        icon: "📊"
      }
    ];

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">DSA Assistant</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get instant answers to your Data Structures and Algorithms questions. 
              I can help with time complexity, algorithms, data structures, and coding concepts.
            </p>
          </div>
        </div>

        {/* Example Questions Grid */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Try asking me about:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => setInputValue(example.question)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-left transition-all duration-200 hover:border-blue-500 group"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{example.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-blue-400 font-medium mb-1 uppercase tracking-wide">
                      {example.category}
                    </div>
                    <div className="text-gray-200 text-sm leading-relaxed group-hover:text-white transition-colors">
                      {example.question}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-medium mb-2">💡 Tips for better results:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Be specific about the data structure or algorithm</li>
            <li>• Ask about time/space complexity, implementation details, or use cases</li>
            <li>• Use technical terms like "binary tree", "hash table", "dynamic programming"</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderProbabilityBars = (data: any) => {
    if (!data?.all_probabilities || !data?.options) return null;

    return (
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-medium mb-3">Model Confidence Distribution:</h4>
        {data.options.map((option: string, index: number) => {
          const probability = data.all_probabilities[index];
          const isCorrect = index === data.answer_index;
          return (
            <div key={index} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">
                  {isCorrect ? '✓' : ' '} {index + 1}. {option.substring(0, 50)}...
                </span>
                <span className="text-sm text-gray-400">{(probability * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isCorrect ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${probability * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DSA Chat Assistant</h1>
            <p className="text-gray-400 text-sm">Ask questions about Data Structures and Algorithms</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600 ml-3' : 'bg-gray-700 mr-3'
                }`}>
                  {message.type === 'user' ? 
                    <User className="h-4 w-4 text-white" /> : 
                    <Bot className="h-4 w-4 text-white" />
                  }
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <div className="text-sm">
                    {message.type === 'user' ? (
                      <div>{message.content}</div>
                    ) : (
                      renderBotResponse(message)
                    )}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Welcome Message for First Visit */}
          {messages.length === 1 && renderWelcomeMessage()}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-400 text-sm">Analyzing your question...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Autocomplete */}
          {showAutocomplete && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
              {autocomplete.words.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-300 mb-2">Suggested words:</div>
                  <div className="flex flex-wrap gap-2">
                    {autocomplete.words.map((word, index) => (
                      <button
                        key={index}
                        onClick={() => addWord(word)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {autocomplete.questions.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-300 mb-2">Similar questions:</div>
                  <div className="space-y-2">
                    {autocomplete.questions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(question)}
                        className="block w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
                      >
                        {index + 1}. {question.substring(0, 80)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about DSA concepts, time complexity, algorithms..."
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "What is the time complexity of binary search?",
              "Explain hash table collision resolution",
              "How does merge sort work?",
              "What is a balanced binary tree?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}