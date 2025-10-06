import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Database, MessageCircle, Home } from 'lucide-react';
import MCQChat from './components/MCQChat';
import ModelUploader from './components/ModelUploader';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">CodeOptimizer NLP</h1>
              
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  MCQ Chat
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Upload Model
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<MCQChat />} />
          <Route path="/upload" element={<ModelUploader />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
