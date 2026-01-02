'use client';

import React, { useMemo } from 'react';
import { useEventStream } from '@/contexts/EventStreamContext';
import { AtomEvent } from '../../../../shared/event-schema';
import { 
  SignalIcon, 
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface OpportunityPayload {
  asset_in?: string;
  asset_out?: string;
  chain?: string;
  spread_bps?: number;
  dex_path?: string[];
  liquidity_estimate?: number;
  confidence_score?: number;
}

interface ExecutionPayload {
  actual_profit?: number;
  revert_reason?: string;
}

export function OpportunityPulse() {
  const { events } = useEventStream();

  const recentOpportunities = useMemo(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    return events
      .filter((e: AtomEvent) => 
        e.event_type === 'opportunity.detected' &&
        e.timestamp.unix_ms > fiveMinutesAgo
      )
      .slice(-10); // Last 10 opportunities
  }, [events]);

  const recentExecutions = useMemo(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    return events
      .filter((e: AtomEvent) => 
        (e.event_type === 'execution.confirmed' || e.event_type === 'execution.reverted') &&
        e.timestamp.unix_ms > fiveMinutesAgo
      )
      .slice(-5); // Last 5 executions
  }, [events]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-atom-success';
    if (confidence >= 0.7) return 'text-atom-warning';
    return 'text-atom-error';
  };

  const getSpreadColor = (spreadBps: number) => {
    if (spreadBps >= 50) return 'text-atom-success';
    if (spreadBps >= 20) return 'text-atom-warning';
    return 'text-atom-error';
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Live Opportunities</h2>
        <SignalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-atom-info" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Recent Opportunities - Mobile optimized */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">Recent</h3>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {recentOpportunities.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <SignalIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No recent opportunities</p>
              </div>
            ) : (
              recentOpportunities.map((opportunity: AtomEvent, index: number) => {
                const payload = opportunity.payload as OpportunityPayload;
                return (
                  <div key={index} className="glass p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-white truncate">
                          {payload.asset_in}/{payload.asset_out}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                          {payload.chain}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <span className={`text-xs sm:text-sm font-bold ${getSpreadColor(payload.spread_bps || 0)}`}>
                          {(payload.spread_bps || 0).toFixed(1)}
                        </span>
                        <ShieldCheckIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${getConfidenceColor(payload.confidence_score || 0)}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                      <span className="truncate">{(payload.dex_path || []).join(' → ')}</span>
                      <span className="flex-shrink-0 ml-2">${((payload.liquidity_estimate || 0) / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Stats - Mobile grid */}
        <div className="border-t border-white border-opacity-10 pt-3 sm:pt-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold text-atom-success">
                {recentOpportunities.length}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Opps</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-atom-info">
                {recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.confirmed').length}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Done</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-atom-warning">
                {recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.reverted').length}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}