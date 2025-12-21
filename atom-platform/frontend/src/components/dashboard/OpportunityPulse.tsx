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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Live Opportunity Pulse</h2>
        <SignalIcon className="w-6 h-6 text-atom-info" />
      </div>

      <div className="space-y-4">
        {/* Recent Opportunities */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Opportunities</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentOpportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <SignalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent opportunities</p>
              </div>
            ) : (
              recentOpportunities.map((opportunity: AtomEvent, index: number) => {
                const payload = opportunity.payload as OpportunityPayload;
                return (
                  <div key={index} className="glass p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white">
                          {payload.asset_in}/{payload.asset_out}
                        </span>
                        <span className="text-xs text-gray-400">
                          {payload.chain}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${getSpreadColor(payload.spread_bps || 0)}`}>
                          {(payload.spread_bps || 0).toFixed(1)} bps
                        </span>
                        <ShieldCheckIcon className={`w-4 h-4 ${getConfidenceColor(payload.confidence_score || 0)}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{(payload.dex_path || []).join(' → ')}</span>
                      <span>${((payload.liquidity_estimate || 0) / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Executions</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentExecutions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <ClockIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">No recent executions</p>
              </div>
            ) : (
              recentExecutions.map((execution: AtomEvent, index: number) => {
                const payload = execution.payload as ExecutionPayload;
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        execution.event_type === 'execution.confirmed' 
                          ? 'bg-atom-success' 
                          : 'bg-atom-error'
                      }`} />
                      <span className="text-gray-300">
                        {execution.event_type === 'execution.confirmed' ? 'Confirmed' : 'Reverted'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {execution.event_type === 'execution.confirmed' ? (
                        <span className="text-atom-success">
                          +${payload.actual_profit?.toFixed(2) || '0.00'}
                        </span>
                      ) : (
                        <span className="text-atom-error text-xs">
                          {payload.revert_reason}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-atom-success">
                {recentOpportunities.length}
              </div>
              <div className="text-xs text-gray-400">Opportunities</div>
            </div>
            <div>
              <div className="text-lg font-bold text-atom-info">
                {recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.confirmed').length}
              </div>
              <div className="text-xs text-gray-400">Executed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-atom-warning">
                {recentExecutions.filter((e: AtomEvent) => e.event_type === 'execution.reverted').length}
              </div>
              <div className="text-xs text-gray-400">Reverted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}