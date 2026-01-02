'use client';

import React from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';

export default function BotsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <TopStatusBar />
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Execution Bots</h1>
                <p className="text-xs sm:text-sm text-gray-400">Bot fleet management</p>
              </div>
              
              {/* Bot cards will go here - mobile optimized */}
              <div className="card p-4 sm:p-6">
                <p className="text-gray-400 text-sm">Bot management interface - optimized for mobile</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
