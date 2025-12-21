'use client';

import React, { useMemo } from 'react';
import { useEventStream } from '@/contexts/EventStreamContext';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function RiskPanel() {
  const { events } = useEventStream();

  const riskStats = useMemo(() => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Recent safety triggers
    const safetyTriggers = events.filter(e => 
      e.event_type === 'safety.triggered' &&
      e.timestamp.unix_ms > oneHourAgo
    );

    // Recent reverts
    const reverts = events.filter(e => 
      e.event_type === 'execution.reverted' &&
      e.timestamp.unix_ms > oneDayAgo
    );

    // Recent rejected opportunities (simulations that failed constraints)
    const simulations = events.filter(e => 
      e.event_type === 'simulation.completed' &&
      e.timestamp.unix_ms > oneHourAgo
    );
    
    const rejectedOpportunities = simulations.filter(e => 
      !e.payload.passes_constraints
    ).length;

    // Gas spike pauses
    const gasSpikeTriggers = safetyTriggers.filter(e => 
      e.payload.trigger_type === 'GAS_SPIKE'
    ).length;

    // MEV risk blocks
    const mevRiskTriggers = safetyTriggers.filter(e => 
      e.payload.trigger_type === 'MEV_RISK'
    ).length;

    return {
      safetyTriggers: safetyTriggers.length,
      reverts: reverts.length,
      rejectedOpportunities,
      gasSpikePauses: gasSpikeTriggers,
      mevRiskBlocks: mevRiskTriggers,
      recentTriggers: safetyTriggers.slice(-5)
    };
  }, [events]);

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'GAS_SPIKE':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'MEV_RISK':
        return <ShieldExclamationIcon className="w-4 h-4" />;
      case 'REVERT_STREAK':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShieldCheckIcon className="w-4 h-4" />;
    }
  };

  const getTriggerColor = (type: string) => {
    switch (type) {
      case 'GAS_SPIKE':
        return 'text-atom-warning';
      case 'MEV_RISK':
        return 'text-atom-error';
      case 'REVERT_STREAK':
        return 'text-atom-error';
      default:
        return 'text-atom-info';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Risk Shield</h2>
        <ShieldCheckIcon className="w-6 h-6 text-atom-success" />
      </div>

      <div className="space-y-6">
        {/* Protection Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-atom-success" />
              <span className="text-sm text-gray-400">Protected</span>
            </div>
            <div className="text-2xl font-bold text-atom-success">
              {riskStats.reverts}
            </div>
            <div className="text-xs text-gray-500">Trades reverted</div>
          </div>

          <div className="glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-atom-warning" />
              <span className="text-sm text-gray-400">Blocked</span>
            </div>
            <div className="text-2xl font-bold text-atom-warning">
              {riskStats.rejectedOpportunities}
            </div>
            <div className="text-xs text-gray-500">Unsafe ops</div>
          </div>

          <div className="glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-atom-info" />
              <span className="text-sm text-gray-400">Paused</span>
            </div>
            <div className="text-2xl font-bold text-atom-info">
              {riskStats.gasSpikePauses}
            </div>
            <div className="text-xs text-gray-500">Gas spikes</div>
          </div>

          <div className="glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldExclamationIcon className="w-5 h-5 text-atom-error" />
              <span className="text-sm text-gray-400">MEV Risk</span>
            </div>
            <div className="text-2xl font-bold text-atom-error">
              {riskStats.mevRiskBlocks}
            </div>
            <div className="text-xs text-gray-500">Risk blocks</div>
          </div>
        </div>

        {/* Recent Triggers */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Safety Triggers</h3>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {riskStats.recentTriggers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent triggers</p>
              </div>
            ) : (
              riskStats.recentTriggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-2 glass rounded">
                  <div className="flex items-center space-x-2">
                    <div className={`${getTriggerColor(trigger.payload.trigger_type)}`}>
                      {getTriggerIcon(trigger.payload.trigger_type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {trigger.payload.trigger_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Action: {trigger.payload.action_taken}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(trigger.timestamp.unix_ms)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Status */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-atom-success" />
              <span className="text-sm text-gray-300">Protection Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-atom-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-atom-success">
                Active
              </span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            System automatically protects against gas spikes, MEV attacks, and execution failures
          </div>
        </div>

        {/* Circuit Breaker Status */}
        <div className="border-t border-white border-opacity-10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-atom-warning" />
              <span className="text-sm text-gray-300">Circuit Breaker</span>
            </div>
            <div className="text-sm font-medium text-atom-success">
              Armed
            </div>
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
              <div 
                className="bg-atom-success h-2 rounded-full" 
                style={{ width: '85%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Normal Operation</span>
              <span>85% Threshold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}