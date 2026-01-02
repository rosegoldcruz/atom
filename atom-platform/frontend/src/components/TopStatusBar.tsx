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
        return <SignalIcon className="w-4 h-4 sm:w-5 sm:h-5 text-status-live" />;
      case 'PAUSED':
        return <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-status-paused" />;
      case 'PROTECTED':
        return <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-status-protected" />;
      case 'DEGRADED':
        return <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-status-degraded" />;
      default:
        return <SignalIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
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
    <div className="glass-dark px-3 py-2 sm:px-6 sm:py-3 border-b border-white border-opacity-10">
      {/* Mobile Layout - Compact */}
      <div className="flex items-center justify-between md:hidden">
        {/* Left - System Status (Prominent) */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {systemState.status}
          </span>
        </div>

        {/* Right - Connection + Gas */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <WifiIcon className={`w-3 h-3 ${isConnected ? 'text-atom-success' : 'text-atom-error'}`} />
          </div>
          <span className="text-gray-400">
            {systemState.gasPrice.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Desktop Layout - Full Info */}
      <div className="hidden md:flex items-center justify-between">
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

        {/* Right side - Time */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {new Date(systemState.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}