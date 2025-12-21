'use client';

import React from 'react';
import { useSystemState } from '@/contexts/SystemStateContext';
import { useEventStream } from '@/contexts/EventStreamContext';
import { 
  WifiIcon, 
  SignalIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon 
} from '@heroicons/react/24/outline';

export function TopStatusBar() {
  const { systemState, isSystemLive } = useSystemState();
  const { isConnected } = useEventStream();

  const getStatusIcon = () => {
    switch (systemState.status) {
      case 'LIVE':
        return <SignalIcon className="w-5 h-5 text-status-live" />;
      case 'PAUSED':
        return <ShieldExclamationIcon className="w-5 h-5 text-status-paused" />;
      case 'PROTECTED':
        return <ShieldCheckIcon className="w-5 h-5 text-status-protected" />;
      case 'DEGRADED':
        return <ShieldExclamationIcon className="w-5 h-5 text-status-degraded" />;
      default:
        return <SignalIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (systemState.status) {
      case 'LIVE':
        return 'text-status-live';
      case 'PAUSED':
        return 'text-status-paused';
      case 'PROTECTED':
        return 'text-status-protected';
      case 'DEGRADED':
        return 'text-status-degraded';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="glass-dark px-6 py-4 flex items-center justify-between border-b border-white border-opacity-10">
      {/* Left side - System status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-semibold ${getStatusColor()}`}>
              System {systemState.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <WifiIcon className="w-4 h-4 text-atom-success" />
            ) : (
              <WifiIcon className="w-4 h-4 text-atom-error opacity-50" />
            )}
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Network info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Gas: {systemState.gasPrice.toFixed(1)} gwei</span>
          <span>AEON: {systemState.aeonState}</span>
          {systemState.safetyMode && (
            <span className="text-atom-warning font-medium">Safety Mode</span>
          )}
        </div>
      </div>

      {/* Right side - Time and user */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-400">
          {new Date(systemState.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}