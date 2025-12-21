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
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary">
      <div className="flex h-screen">
        {/* Sidebar */}
        <SideNav />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top status bar */}
          <TopStatusBar />
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Strategy Management
                </h1>
                <p className="text-gray-400">
                  Configure and monitor your arbitrage strategies
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Strategy Grid */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Available Strategies</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Strategy Profile:</span>
                        <span className="text-sm font-medium text-atom-highlight">
                          {user?.strategyProfile || 'Balanced'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockStrategies.map((strategy) => (
                        <div
                          key={strategy.id}
                          className={`glass p-6 rounded-lg cursor-pointer transition-all duration-200 hover:bg-opacity-20 ${
                            selectedStrategy?.id === strategy.id ? 'ring-2 ring-atom-highlight' : ''
                          }`}
                          onClick={() => setSelectedStrategy(strategy)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                              {strategy.name}
                            </h3>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                              strategy.status === 'ACTIVE' ? 'bg-green-600' :
                              strategy.status === 'PAUSED' ? 'bg-yellow-600' : 'bg-red-600'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(strategy.status)}`} />
                              <span className="text-white">{strategy.status}</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 mb-4">
                            {strategy.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-400">Win Rate</div>
                              <div className="text-lg font-bold text-atom-success">
                                {strategy.winRate}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Avg Profit</div>
                              <div className="text-lg font-bold text-atom-success">
                                ${strategy.avgProfit.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Avg Gas</div>
                              <div className="text-lg font-bold text-atom-info">
                                ${strategy.avgGas.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Risk</div>
                              <div className={`text-lg font-bold ${getRiskColor(strategy.riskRating)}`}>
                                {strategy.riskRating}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Total: {strategy.totalExecutions} trades</span>
                            <span>Last: {formatLastExecution(strategy.lastExecution)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strategy Details */}
                <div>
                  {selectedStrategy ? (
                    <div className="card">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                          {selectedStrategy.name}
                        </h2>
                        <CogIcon className="w-6 h-6 text-atom-info" />
                      </div>

                      <div className="space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                          <p className="text-sm text-gray-300">
                            {selectedStrategy.description}
                          </p>
                        </div>

                        {/* Performance Metrics */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-3">Performance</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Win Rate</span>
                              <span className="text-sm font-bold text-atom-success">
                                {selectedStrategy.winRate}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Total Executions</span>
                              <span className="text-sm font-bold text-white">
                                {selectedStrategy.totalExecutions}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Last Execution</span>
                              <span className="text-sm text-gray-400">
                                {formatLastExecution(selectedStrategy.lastExecution)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Risk Profile */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-3">Risk Profile</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Risk Rating</span>
                              <span className={`text-sm font-bold ${getRiskColor(selectedStrategy.riskRating)}`}>
                                {selectedStrategy.riskRating}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">Avg Gas Cost</span>
                              <span className="text-sm text-gray-400">
                                ${selectedStrategy.avgGas.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-3">Controls</h3>
                          <div className="space-y-3">
                            {selectedStrategy.status === 'ACTIVE' ? (
                              <button className="button button-warning w-full">
                                Pause Strategy
                              </button>
                            ) : (
                              <button className="button button-success w-full">
                                Activate Strategy
                              </button>
                            )}
                            
                            <button className="button button-secondary w-full">
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Last 24h Executions</span>
                              <span className="text-white font-medium">
                                {Math.floor(selectedStrategy.totalExecutions / 30)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Avg Daily Profit</span>
                              <span className="text-atom-success">
                                ${(selectedStrategy.avgProfit * selectedStrategy.totalExecutions / 30).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card text-center py-12">
                      <CogIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        Select a Strategy
                      </h3>
                      <p className="text-gray-400">
                        Click on a strategy card to view detailed information and controls
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategy Explanation */}
              <div className="mt-8 card">
                <h2 className="text-xl font-bold text-white mb-4">How Strategies Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-atom-info rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">Risk Assessment</h3>
                    <p className="text-xs text-gray-400">
                      Each strategy is evaluated for risk before execution
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-atom-highlight rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">Timing</h3>
                    <p className="text-xs text-gray-400">
                      Strategies execute at optimal moments for maximum profit
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-atom-success rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">Validation</h3>
                    <p className="text-xs text-gray-400">
                      Every opportunity is simulated before execution
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-atom-warning rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">Profit Tracking</h3>
                    <p className="text-xs text-gray-400">
                      Performance metrics help optimize strategy selection
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