import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProblemSolver from './components/ProblemSolver';
import DSAChat from './components/DSAChat';
import Navigation from './components/Navigation';
import { ProblemProvider } from './contexts/ProblemContext';

function App() {
  return (
    <ProblemProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<DSAChat />} />
            <Route path="/solve/:problemId" element={<ProblemSolver />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ProblemProvider>
  );
}

export default App;
