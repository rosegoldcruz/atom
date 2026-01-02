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
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        {/* Mobile Navigation - Bottom Fixed */}
        <SideNav />
        
        {/* Main content - Mobile First */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top status bar - Compact on Mobile */}
          <TopStatusBar />
          
          {/* Main content area - Mobile optimized padding */}
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header - Compact on mobile */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  Command Center
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Real-time arbitrage execution
                </p>
              </div>

              {/* Overview Cards - Stack on mobile */}
              <OverviewCards />

              {/* Main Dashboard - Single column mobile */}
              <div className="space-y-4 sm:space-y-6">
                {/* Live Opportunity Pulse - Full width mobile */}
                <OpportunityPulse />

                {/* Execution Snapshot - Full width mobile */}
                <ExecutionSnapshot />

                {/* Risk Panel - Full width mobile */}
                <RiskPanel />
              </div>

              {/* Educational Content - Simplified mobile */}
              <div className="mt-6 sm:mt-8 card">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">How It Works</h2>
                
                <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-atom-info rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg sm:text-xl">1</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Detect</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Scans DEX markets for opportunities
                    </p>
                  </div>
                  
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-atom-highlight rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg sm:text-xl">2</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Simulate</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Simulates for profitability
                    </p>
                  </div>
                  
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-atom-success rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg sm:text-xl">3</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Execute</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Flash loans execute or revert
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