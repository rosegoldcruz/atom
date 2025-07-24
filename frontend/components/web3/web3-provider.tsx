'use client';

/**
 * Web3 Provider Component
 * Global state management for Web3 wallet connections
 * Following AEON platform standards and Vercel best practices
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { metamaskConnection } from '@/lib/metamask-connection';

interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  balance: string | null;
  isCorrectNetwork: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<boolean>;
  switchNetwork: () => Promise<boolean>;
  disconnect: () => void;
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [state, setState] = useState(metamaskConnection.getState());

  useEffect(() => {
    const unsubscribe = metamaskConnection.subscribe(setState);
    return unsubscribe;
  }, []);

  const isCorrectNetwork = metamaskConnection.isCorrectNetwork();

  const connectWallet = async (): Promise<boolean> => {
    try {
      const success = await metamaskConnection.connect();
      if (success && !isCorrectNetwork) {
        await metamaskConnection.switchToBaseSepolia();
      }
      return success;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  };

  const switchNetwork = async (): Promise<boolean> => {
    try {
      return await metamaskConnection.switchToBaseSepolia();
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  };

  const disconnect = () => {
    metamaskConnection.disconnect();
  };

  const clearError = () => {
    // This would need to be implemented in the metamaskConnection class
    // For now, we'll just trigger a state update
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: Web3ContextType = {
    isConnected: state.isConnected,
    account: state.account,
    chainId: state.chainId,
    balance: state.balance,
    isCorrectNetwork,
    isLoading: state.isLoading,
    error: state.error,
    connectWallet,
    switchNetwork,
    disconnect,
    clearError,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Hook for checking if MetaMask is installed
export function useMetaMaskInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(metamaskConnection.isMetaMaskInstalled());
  }, []);

  return isInstalled;
}
