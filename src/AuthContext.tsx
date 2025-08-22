import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'leetcode';
  experience: 'beginner' | 'intermediate' | 'advanced';
  solvedProblems: number;
  accuracy: number;
}

interface AuthContextType {
  user: User | null;
  login: (provider: 'google' | 'leetcode') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (provider: 'google' | 'leetcode') => {
    // Mock login - in real app, this would handle OAuth
    setUser({
      id: '1',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400`,
      provider,
      experience: 'intermediate',
      solvedProblems: 127,
      accuracy: 85
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}