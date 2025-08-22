import React from 'react';
import { Trophy, Target, Clock, TrendingUp, Code2, Brain, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Problems Solved', value: user?.solvedProblems || 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Accuracy Rate', value: `${user?.accuracy || 0}%`, icon: Target, color: 'text-green-400' },
    { label: 'Avg. Time', value: '12m 34s', icon: Clock, color: 'text-blue-400' },
    { label: 'Streak', value: '7 days', icon: TrendingUp, color: 'text-purple-400' }
  ];

  const recommendedProblems = [
    {
      id: '1',
      title: 'Two Sum',
      difficulty: 'Easy',
      tags: ['Array', 'Hash Table'],
      successRate: 89,
      estimatedTime: '15 min'
    },
    {
      id: '2',
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      tags: ['String', 'Stack'],
      successRate: 92,
      estimatedTime: '10 min'
    },
    {
      id: '3',
      title: 'Merge Two Sorted Lists',
      difficulty: 'Easy',
      tags: ['Linked List', 'Recursion'],
      successRate: 85,
      estimatedTime: '18 min'
    }
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 text-lg">Ready to optimize your coding skills today?</p>
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
              {recommendedProblems.map((problem) => (
                <div key={problem.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                     onClick={() => navigate(`/solve/${problem.id}`)}>
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
                      {problem.tags.map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-400 flex items-center space-x-4">
                      <span>{problem.successRate}% success rate</span>
                      <span>~{problem.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
              View All Problems
            </button>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="space-y-6">
          {/* Weak Areas */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Target className="h-5 w-5 text-red-400 mr-2" />
              Areas to Improve
            </h3>
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