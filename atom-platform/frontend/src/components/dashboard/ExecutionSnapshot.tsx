'use client';

import React, { useMemo } from 'react';
import { useEventStream } from '@/contexts/EventStreamContext';
import { AtomEvent } from '../../../../shared/event-schema';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export function ExecutionSnapshot() {
  const { events } = useEventStream();

  const executionStats = useMemo(() => {
    const recentExecutions = events.filter((e: AtomEvent) => 
      e.event_type === 'execution.submitted' ||
      e.event_type === 'execution.confirmed' ||
      e.event_type === 'execution.reverted'
    );

    const pending = recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.submitted').length;
    const confirmed = recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.confirmed').length;
    const reverted = recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.reverted').length;

    const recentConfirmed = events
      .filter((e: AtomEvent) => e.event_type === 'execution.confirmed')
      .slice(-1)[0];

    const recentReverted = events
      .filter((e: AtomEvent) => e.event_type === 'execution.reverted')
      .slice(-1)[0];

    return {
      pending,
      confirmed,
      reverted,
      recentConfirmed,
      recentReverted,
      total: recentExecutions.length,
      successRate: recentExecutions.length > 0 ? (confirmed / recentExecutions.length) * 100 : 0
    };
  }, [events]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Executions</h2>
        <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 text-atom-info" />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Pending Executions - Mobile optimized */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 flex items-center">
              <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Pending
            </h3>
            <span className="text-base sm:text-lg font-bold text-atom-warning">{executionStats.pending}</span>
          </div>
          
          {executionStats.pending > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-300">In Mempool</span>
                <span className="text-atom-warning">{executionStats.pending}</span>
              </div>
              <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
                <div 
                  className="bg-atom-warning h-2 rounded-full animate-pulse" 
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity - Mobile compact */}
        <div className="border-t border-white border-opacity-10 pt-3 sm:pt-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">Recent</h3>
          
          <div className="space-y-2 sm:space-y-3">
            {/* Last Confirmed */}
            {executionStats.recentConfirmed && (
              <div className="flex items-center justify-between p-2 sm:p-3 glass rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-atom-success flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                      Confirmed
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {formatTimeAgo(executionStats.recentConfirmed.timestamp.unix_ms)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs sm:text-sm font-bold text-atom-success">
                    +${(executionStats.recentConfirmed.payload as any).actual_profit?.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Last Reverted */}
            {executionStats.recentReverted && (
              <div className="flex items-center justify-between p-2 sm:p-3 glass rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-atom-error flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                      Reverted
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {formatTimeAgo(executionStats.recentReverted.timestamp.unix_ms)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No recent activity */}
            {!executionStats.recentConfirmed && !executionStats.recentReverted && (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics - Mobile grid */}
        <div className="border-t border-white border-opacity-10 pt-3 sm:pt-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-atom-success">
                {executionStats.confirmed}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-atom-error">
                {executionStats.reverted}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-atom-info">
                {executionStats.total}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}