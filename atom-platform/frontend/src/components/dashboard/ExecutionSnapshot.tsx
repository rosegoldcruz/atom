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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Execution Snapshot</h2>
        <ArrowPathIcon className="w-6 h-6 text-atom-info" />
      </div>

      <div className="space-y-6">
        {/* Pending Executions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              Pending Executions
            </h3>
            <span className="text-lg font-bold text-atom-warning">{executionStats.pending}</span>
          </div>
          
          {executionStats.pending > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
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

        {/* Recent Activity */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
          
          <div className="space-y-3">
            {/* Last Confirmed */}
            {executionStats.recentConfirmed && (
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-atom-success" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Execution Confirmed
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(executionStats.recentConfirmed.timestamp.unix_ms)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-atom-success">
                    +${(executionStats.recentConfirmed.payload as any).actual_profit?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {((executionStats.recentConfirmed.payload as any).fees?.flash || 0).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            )}

            {/* Last Reverted */}
            {executionStats.recentReverted && (
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircleIcon className="w-5 h-5 text-atom-error" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Execution Reverted
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(executionStats.recentReverted.timestamp.unix_ms)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-atom-error">
                    {(executionStats.recentReverted.payload as any).revert_reason}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(executionStats.recentReverted.payload as any).gas_used?.toFixed(4)} ETH
                  </p>
                </div>
              </div>
            )}

            {/* No recent activity */}
            {!executionStats.recentConfirmed && !executionStats.recentReverted && (
              <div className="text-center py-6 text-gray-500">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-atom-success">
                {executionStats.confirmed}
              </div>
              <div className="text-xs text-gray-400">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-atom-error">
                {executionStats.reverted}
              </div>
              <div className="text-xs text-gray-400">Reverted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-atom-info">
                {executionStats.total}
              </div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
        </div>

        {/* Protection Status */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-atom-warning" />
              <span className="text-sm text-gray-300">Protection Active</span>
            </div>
            <span className="text-sm font-medium text-atom-success">
              {executionStats.successRate.toFixed(1)}% Success
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}