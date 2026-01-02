'use client';

import React, { useState } from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';
import { useAuth } from '@/contexts/AuthContext';
import {
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COOLDOWN';
  winRate: number;
  avgProfit: number;
  avgGas: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  lastExecution?: number;
  totalExecutions: number;
}

const mockStrategies: Strategy[] = [
  {
    id: 'stablecoin_rotation',
    name: 'Stablecoin Rotation',
    description: 'Arbitrage between USDC, USDT, and DAI across major DEXs',
    status: 'ACTIVE',
    winRate: 94.2,
    avgProfit: 18.50,
    avgGas: 2.31,
    riskRating: 'LOW',
    totalExecutions: 1247,
    lastExecution: Date.now() - 300000 // 5 minutes ago
  },
  {
    id: 'triangular_arbitrage',
    name: 'Triangular Arbitrage',
    description: 'Three-way arbitrage through ETH, USDC, and WBTC pairs',
    status: 'ACTIVE',
    winRate: 87.8,
    avgProfit: 24.30,
    avgGas: 3.12,
    riskRating: 'MEDIUM',
    totalExecutions: 892,
    lastExecution: Date.now() - 900000 // 15 minutes ago
  },
  {
    id: 'dex_spread_capture',
    name: 'DEX Spread Capture',
    description: 'Captures price differences between Uniswap V3 and other DEXs',
    status: 'PAUSED',
    winRate: 91.5,
    avgProfit: 15.20,
    avgGas: 2.85,
    riskRating: 'LOW',
    totalExecutions: 2156,
    lastExecution: Date.now() - 3600000 // 1 hour ago
  },
  {
    id: 'volatility_opportunist',
    name: 'Volatility Opportunist',
    description: 'Captures opportunities during high volatility periods',
    status: 'COOLDOWN',
    winRate: 76.3,
    avgProfit: 45.80,
    avgGas: 4.21,
    riskRating: 'HIGH',
    totalExecutions: 423,
    lastExecution: Date.now() - 7200000 // 2 hours ago
  }
];

export default function StrategiesPage() {
  const { user } = useAuth();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-atom-success';
      case 'PAUSED':
        return 'text-atom-warning';
      case 'COOLDOWN':
        return 'text-atom-error';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-atom-success';
      case 'MEDIUM':
        return 'text-atom-warning';
      case 'HIGH':
        return 'text-atom-error';
      default:
        return 'text-gray-400';
    }
  };

  const formatLastExecution = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        {/* Mobile bottom nav */}
        <SideNav />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top status bar */}
          <TopStatusBar />
          
          {/* Main content area - Mobile optimized */}
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header - Compact mobile */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  Strategies
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Your arbitrage strategies
                </p>
              </div>

              {/* Strategy List - Mobile stacked */}
              <div className="space-y-4">
                {mockStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`glass p-4 sm:p-6 rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                      selectedStrategy?.id === strategy.id ? 'ring-2 ring-atom-highlight' : ''
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-white flex-1">
                        {strategy.name}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
                        strategy.status === 'ACTIVE' ? 'bg-green-600' :
                        strategy.status === 'PAUSED' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full bg-white`} />
                        <span className="text-white">{strategy.status}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-400 mb-3">
                      {strategy.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                        <div className="text-base sm:text-lg font-bold text-atom-success">
                          {strategy.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Avg Profit</div>
                        <div className="text-base sm:text-lg font-bold text-atom-success">
                          ${strategy.avgProfit.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Risk</div>
                        <div className={`text-base sm:text-lg font-bold ${getRiskColor(strategy.riskRating)}`}>
                          {strategy.riskRating}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{strategy.totalExecutions} trades</span>
                      <span>{formatLastExecution(strategy.lastExecution)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Strategy Details - Mobile optimized */}
              {selectedStrategy && (
                <div className="mt-4 card p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {selectedStrategy.name}
                    </h2>
                    <CogIcon className="w-5 h-5 sm:w-6 sm:h-6 text-atom-info" />
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-gray-300">
                      {selectedStrategy.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass p-3 rounded">
                        <div className="text-xs text-gray-400">Total Trades</div>
                        <div className="text-lg font-bold text-white">
                          {selectedStrategy.totalExecutions}
                        </div>
                      </div>
                      <div className="glass p-3 rounded">
                        <div className="text-xs text-gray-400">Last Run</div>
                        <div className="text-lg font-bold text-gray-300">
                          {formatLastExecution(selectedStrategy.lastExecution)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedStrategy.status === 'ACTIVE' ? (
                        <button className="button button-warning w-full text-sm sm:text-base">
                          Pause Strategy
                        </button>
                      ) : (
                        <button className="button button-success w-full text-sm sm:text-base">
                          Activate Strategy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* How It Works - Simplified mobile */}
              <div className="mt-6 sm:mt-8 card p-4 sm:p-6">
                <h2 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4">How Strategies Work</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-atom-info rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">Risk Check</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Safety first
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-atom-highlight rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">Timing</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Optimal entry
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-atom-success rounded-lg flex items-center justify-center mx-auto mb-2">
                      <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">Validate</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Pre-simulate
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-atom-warning rounded-lg flex items-center justify-center mx-auto mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">Track</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Monitor P&L
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}