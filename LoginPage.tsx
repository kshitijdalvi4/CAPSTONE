import React from 'react';
import { Code2, Brain, Trophy, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Code2 className="h-16 w-16 text-blue-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">CodeOptimizer</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master algorithmic thinking through interactive problem solving. 
            Build your coding skills with personalized guidance and real-time feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Why CodeOptimizer?</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-blue-400 mr-3" />
                <span className="text-gray-300">Interactive learning with MCQs and hints</span>
              </div>
              <div className="flex items-center">
                <Target className="h-6 w-6 text-green-400 mr-3" />
                <span className="text-gray-300">Personalized difficulty progression</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
                <span className="text-gray-300">Performance analytics and insights</span>
              </div>
              <div className="flex items-center">
                <Code2 className="h-6 w-6 text-purple-400 mr-3" />
                <span className="text-gray-300">Multi-language code editor</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Get Started</h3>
            <div className="space-y-4">
              <button
                onClick={() => login('google')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={() => login('leetcode')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Code2 className="w-5 h-5 mr-3" />
                Continue with LeetCode
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-600">
              <p className="text-sm text-gray-400 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span>500+ Problems</span>
            <span>•</span>
            <span>Real-time Analytics</span>
            <span>•</span>
            <span>Multi-language Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}