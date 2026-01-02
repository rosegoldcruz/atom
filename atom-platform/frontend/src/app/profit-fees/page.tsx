'use client';

import React from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';

export default function ProfitFeesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <TopStatusBar />
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Profit & Fees</h1>
                <p className="text-xs sm:text-sm text-gray-400">Track your earnings</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="card p-3 sm:p-4">
                    <div className="text-xs text-gray-400 mb-1">Total Profit</div>
                    <div className="text-lg sm:text-2xl font-bold text-atom-success">$0.00</div>
                  </div>
                  <div className="card p-3 sm:p-4">
                    <div className="text-xs text-gray-400 mb-1">Total Fees</div>
                    <div className="text-lg sm:text-2xl font-bold text-atom-error">$0.00</div>
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
