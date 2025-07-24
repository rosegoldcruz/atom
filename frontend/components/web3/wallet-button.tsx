'use client';

/**
 * Wallet Button Component
 * Compact wallet connection button for navigation
 * Following AEON platform standards and Vercel best practices
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWeb3 } from './web3-provider';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletButtonProps {
  className?: string;
}

export default function WalletButton({ className = '' }: WalletButtonProps) {
  const {
    isConnected,
    account,
    balance,
    isCorrectNetwork,
    isLoading,
    connectWallet,
    switchNetwork,
    disconnect,
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard');
    }
  };

  const openEtherscan = () => {
    if (account) {
      window.open(`https://sepolia-explorer.base.org/address/${account}`, '_blank');
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      const success = await switchNetwork();
      if (success) {
        toast.success('Switched to Base Sepolia');
      } else {
        toast.error('Failed to switch network');
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  // Not connected state
  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className={`bg-blue-600 hover:bg-blue-700 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Connected state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border-gray-700 hover:border-gray-600 ${className}`}
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <Wallet className="h-4 w-4" />
              <span className="font-mono text-sm">
                {account ? formatAddress(account) : 'Connected'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
        {/* Account Info */}
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Account</span>
            {!isCorrectNetwork && (
              <Badge variant="destructive" className="text-xs">
                Wrong Network
              </Badge>
            )}
          </div>
          <div className="font-mono text-sm text-white mt-1">
            {account ? formatAddress(account) : 'No account'}
          </div>
          {balance && (
            <div className="text-xs text-gray-400 mt-1">
              {balance} ETH
            </div>
          )}
        </div>

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <>
            <DropdownMenuItem
              onClick={handleSwitchNetwork}
              className="text-yellow-400 hover:bg-yellow-400/10"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Switch to Base Sepolia
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
          </>
        )}

        {/* Actions */}
        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-800">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openEtherscan} className="hover:bg-gray-800">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
