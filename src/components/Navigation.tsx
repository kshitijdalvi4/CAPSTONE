import React from 'react';
import { Code2, User, LogOut, Home, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Code2 className="h-8 w-8 text-blue-400 mr-3" />
            <span className="text-xl font-bold text-white">CodeOptimizer</span>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-8 w-8 rounded-full"
            />
            <div className="text-sm">
              <div className="text-white font-medium">{user?.name}</div>
              <div className="text-gray-400">{user?.experience}</div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}