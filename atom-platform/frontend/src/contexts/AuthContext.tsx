'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  walletAddress?: string;
  strategyProfile?: 'Conservative' | 'Balanced' | 'Aggressive';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
  updateStrategyProfile: (profile: 'Conservative' | 'Balanced' | 'Aggressive') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - in production, this would come from your backend
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@atom.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D0C3e9e9C4e4b1a',
    strategyProfile: 'Balanced',
    isActive: true
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // Mock authentication check
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In production, validate token with backend
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock login - in production, call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock successful login
      const authToken = 'mock-jwt-token';
      localStorage.setItem('auth_token', authToken);
      setUser(mockUser);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const connectWallet = async (address: string): Promise<void> => {
    if (user) {
      setUser({
        ...user,
        walletAddress: address
      });
    }
  };

  const updateStrategyProfile = async (profile: 'Conservative' | 'Balanced' | 'Aggressive'): Promise<void> => {
    if (user) {
      setUser({
        ...user,
        strategyProfile: profile
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    connectWallet,
    updateStrategyProfile
  };

  return (
    <AuthContext.Provider value={value}>
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