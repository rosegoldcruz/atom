'use client';

import React from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <TopStatusBar />
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Learn</h1>
                <p className="text-xs sm:text-sm text-gray-400">Educational resources</p>
              </div>
              
              <div className="space-y-4">
                <div className="card p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-2">Getting Started</h2>
                  <p className="text-gray-400 text-sm mb-3">Learn the basics of arbitrage trading</p>
                  <button className="button button-primary text-sm px-4 py-2">Start Tutorial</button>
                </div>
                <div className="card p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-2">Strategy Guide</h2>
                  <p className="text-gray-400 text-sm mb-3">Understand different strategies</p>
                  <button className="button button-secondary text-sm px-4 py-2">Read More</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
