import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProblemSolver from './components/ProblemSolver';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProblemProvider } from './contexts/ProblemContext';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/solve/:problemId" element={<ProblemSolver />} />
      </Routes>
    </div>
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