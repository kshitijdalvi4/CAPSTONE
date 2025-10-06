import React from 'react';
import { Trophy, Target, Clock, TrendingUp, Code as Code2, Brain, Zap, Play, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import nlpService from '../services/nlpService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      setLoading(true);
      
      // Initialize NLP system
      const initResult = await nlpService.initializeSystem();
      if (initResult.success) {
        setIsInitialized(true);
        
        // Get recommended problems
        const problemsResult = await nlpService.getProblems({ limit: 3 });
        if (problemsResult.success) {
          setRecommendedProblems(problemsResult.problems);
        }
        
        // Get personalized recommendations
        const recsResult = await nlpService.getRecommendations({
          accuracy: 0,
          solvedProblems: 0
        });
        if (recsResult.success) {
          setRecommendations(recsResult.recommendations);
        }
      }
    } catch (error) {
      console.error('Failed to initialize system:', error);
    } finally {
      setLoading(false);
    }
  };
  const stats = [
    { label: 'Problems Solved', value: 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Accuracy Rate', value: '0%', icon: Target, color: 'text-green-400' },
    { label: 'Avg. Time', value: '12m 34s', icon: Clock, color: 'text-blue-400' },
    { label: 'Streak', value: '7 days', icon: TrendingUp, color: 'text-purple-400' }
  ];

  const weakAreas = [
    { topic: 'Dynamic Programming', score: 65, improvement: '+12%' },
    { topic: 'Graph Algorithms', score: 72, improvement: '+8%' },
    { topic: 'Tree Traversal', score: 78, improvement: '+15%' }
  ];

  const strongAreas = [
    { topic: 'Arrays & Strings', score: 94 },
    { topic: 'Hash Tables', score: 91 },
    { topic: 'Two Pointers', score: 88 }
  ];

  const sampleProblems = [
    {
      id: 'sample-1',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      tags: ['Array', 'Hash Table']
    },
    {
      id: 'sample-2', 
      title: 'Binary Search',
      difficulty: 'Easy',
      description: 'Given a sorted array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.',
      tags: ['Array', 'Binary Search']
    },
    {
      id: 'sample-3',
      title: 'Linked List Cycle',
      difficulty: 'Medium', 
      description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
      tags: ['Linked List', 'Two Pointers']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-blue-400">Initializing NLP system and loading personalized content...</span>
          </div>
        </div>
      )}

      {/* System Status */}
      {!loading && (
        <div className={`rounded-xl p-4 ${isInitialized ? 'bg-green-900/20 border border-green-600/30' : 'bg-red-900/20 border border-red-600/30'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-sm ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
              NLP System: {isInitialized ? 'Ready' : 'Not Initialized'}
            </span>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to CodeOptimizer!</h1>
        <p className="text-blue-100 text-lg mb-4">Ready to optimize your coding skills today?</p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/solve/sample-1')}
            className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Solving Problems
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Ask DSA Questions
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recommended Problems */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Brain className="h-6 w-6 text-blue-400 mr-2" />
                Recommended Problems
              </h2>
              <span className="text-sm text-gray-400">Based on your progress</span>
            </div>
            
            <div className="space-y-4">
              {(recommendedProblems.length > 0 ? recommendedProblems : sampleProblems).map((problem) => (
                <div key={problem.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                     onClick={() => navigate(`/solve/${problem._id || problem.id}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{problem.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-400 flex items-center space-x-4">
                      <span>{recommendedProblems.length > 0 ? 'Generated by AI' : 'Sample Problem'}</span>
                      <span>~15 min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/solve/sample-1')}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Start Problem Solving
            </button>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="space-y-6">
          {/* Weak Areas */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Target className="h-5 w-5 text-red-400 mr-2" />
              {recommendations ? 'Personalized Recommendations' : 'Areas to Improve'}
            </h3>
            
            {recommendations ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Recommended Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.recommendedTopics?.map((topic, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Difficulty</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    recommendations.suggestedDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    recommendations.suggestedDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recommendations.suggestedDifficulty}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Next Steps</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {recommendations.nextSteps?.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {weakAreas.map((area) => (
                  <div key={area.topic}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">{area.topic}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-400">{area.improvement}</span>
                        <span className="text-sm text-white">{area.score}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full" 
                        style={{ width: `${area.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strong Areas */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 text-green-400 mr-2" />
              Strong Areas
            </h3>
            <div className="space-y-3">
              {strongAreas.map((area) => (
                <div key={area.topic}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{area.topic}</span>
                    <span className="text-sm text-white">{area.score}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${area.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}