'use client';

/**
 * MetaMask Connector Component
 * UI component for MetaMask wallet connection
 * Following AEON platform standards and Vercel best practices
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from './web3-provider';
import { Wallet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface MetaMaskConnectorProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export default function MetaMaskConnector({ 
  onConnectionChange, 
  className = '' 
}: MetaMaskConnectorProps) {
  const {
    isConnected,
    account,
    balance,
    isCorrectNetwork,
    isLoading,
    error,
    connectWallet,
    switchNetwork,
    disconnect,
    clearError,
  } = useWeb3();

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const handleConnect = async () => {
    if (isConnecting || isLoading) return;
    
    setIsConnecting(true);
    clearError();
    
    try {
      console.log('Attempting to connect to MetaMask...');
      const success = await connectWallet();
      
      if (success) {
        console.log('MetaMask connected successfully');
      } else {
        console.log('Failed to connect to MetaMask');
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    console.log('MetaMask disconnected');
  };

  const handleSwitchNetwork = async () => {
    try {
      const success = await switchNetwork();
      if (success) {
        console.log('Switched to Base Sepolia network');
      }
    } catch (error) {
      console.error('Network switch error:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if MetaMask is installed
  if (typeof window !== 'undefined' && !window.ethereum) {
    return (
      <Card className={`p-6 bg-gray-900/50 border-gray-800 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">MetaMask not detected</span>
          </div>
          <p className="text-gray-400 text-sm text-center">
            Please install the MetaMask browser extension to continue
          </p>
          <Button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            variant="outline"
            className="border-gray-700 hover:border-gray-600"
          >
            Install MetaMask
          </Button>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`p-6 bg-gray-900/50 border-gray-800 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Connection Error</span>
          </div>
          <p className="text-gray-400 text-sm text-center">{error}</p>
          <Button
            onClick={clearError}
            variant="outline"
            className="border-gray-700 hover:border-gray-600"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gray-900/50 border-gray-800 ${className}`}>
      {isConnected ? (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-400">Connected</span>
              </div>
              {!isCorrectNetwork && (
                <Badge variant="destructive" className="text-xs">
                  Wrong Network
                </Badge>
              )}
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              Disconnect
            </Button>
          </div>

          {/* Account Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-white font-mono text-sm">
                {account ? formatAddress(account) : 'No account'}
              </span>
            </div>
            {balance && (
              <div className="text-gray-400 text-sm">
                Balance: {balance} ETH
              </div>
            )}
          </div>

          {/* Network Switch Button */}
          {!isCorrectNetwork && (
            <Button
              onClick={handleSwitchNetwork}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching Network...
                </>
              ) : (
                'Switch to Base Sepolia'
              )}
            </Button>
          )}

          {/* Success indicator for correct network */}
          {isCorrectNetwork && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Connected to Base Sepolia</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-400 text-sm">
              Connect with MetaMask to start using ATOM
            </p>
          </div>
          
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isConnecting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
