import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProblemSolver from './components/ProblemSolver';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProblemProvider } from './contexts/ProblemContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-900">
              <Navigation />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/solve/:problemId" element={<ProblemSolver />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          }
        />
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProblemProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ProblemProvider>
    </AuthProvider>
  );
}

export default App;
