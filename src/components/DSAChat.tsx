import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Clock, Target, Zap, MessageSquare } from 'lucide-react';

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
      content: 'Hello! I\'m your DSA assistant. Ask me anything about Data Structures and Algorithms!',
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

  // Your Flask API URL - update this to match your backend
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
  }, [inputValue]);

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
        content: 'Sorry, I couldn\'t connect to the server. Please make sure the Flask server is running and try again.',
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
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold text-white mb-2">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-gray-300">{line}</div>;
      }
      return <div key={index} className="text-gray-300 mb-1">{line}</div>;
    });
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
                      <div>
                        {formatMessage(message.content)}
                        {message.data && renderProbabilityBars(message.data)}
                      </div>
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