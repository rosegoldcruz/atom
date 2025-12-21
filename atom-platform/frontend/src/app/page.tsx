'use client';

import React from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { OpportunityPulse } from '@/components/dashboard/OpportunityPulse';
import { ExecutionSnapshot } from '@/components/dashboard/ExecutionSnapshot';
import { RiskPanel } from '@/components/dashboard/RiskPanel';

export default function DashboardPage() {
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
                  Command Center
                </h1>
                <p className="text-gray-400">
                  Real-time arbitrage execution and monitoring dashboard
                </p>
              </div>

              {/* Overview Cards */}
              <OverviewCards />

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Live Opportunity Pulse */}
                <div className="xl:col-span-2">
                  <OpportunityPulse />
                </div>

                {/* Execution Snapshot */}
                <ExecutionSnapshot />

                {/* Risk Panel */}
                <div className="xl:col-span-3">
                  <RiskPanel />
                </div>
              </div>

              {/* Educational Content */}
              <div className="mt-8 card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">How It Works</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-atom-info rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Detect</h3>
                    <p className="text-gray-400 text-sm">
                      System continuously scans DEX markets for arbitrage opportunities
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-atom-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Simulate</h3>
                    <p className="text-gray-400 text-sm">
                      Each opportunity is simulated to ensure profitability before execution
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-atom-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Execute</h3>
                    <p className="text-gray-400 text-sm">
                      Atomic flash loan transactions execute safely or revert with no loss
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