'use client';

import React, { useState } from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { SideNav } from '@/components/SideNav';
import { useEventStream } from '@/contexts/EventStreamContext';
import {
  SignalIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface OpportunityPayload {
  chain?: string;
  confidence_score?: number;
  asset_in?: string;
  asset_out?: string;
  spread_bps?: number;
}

interface ExecutionPayload {
  actual_profit?: number;
  actual_gas?: number;
  revert_reason?: string;
  gas_used?: number;
}

interface SafetyPayload {
  trigger_type?: string;
  action_taken?: string;
}

interface SystemPayload {
  previous_status?: string;
  current_status?: string;
}

type EventPayload = OpportunityPayload | ExecutionPayload | SafetyPayload | SystemPayload | any;

interface EventItem {
  event_id: string;
  event_type: string;
  source: string;
  timestamp: { iso: string };
  severity: string;
  payload: EventPayload;
}

export default function LiveActivityPage() {
  const { events, isConnected } = useEventStream();
  const [filter, setFilter] = useState<string>('all');

  const filteredEvents = events.filter((event: EventItem) => {
    if (filter === 'all') return true;
    return event.event_type === filter;
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'opportunity.detected':
        return <SignalIcon className="w-5 h-5" />;
      case 'execution.submitted':
        return <ClockIcon className="w-5 h-5" />;
      case 'execution.confirmed':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'execution.reverted':
        return <XCircleIcon className="w-5 h-5" />;
      case 'safety.triggered':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'system.status.changed':
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getEventColor = (eventType: string, severity?: string) => {
    switch (eventType) {
      case 'execution.confirmed':
      case 'profit.realized':
        return 'border-atom-success bg-green-500 bg-opacity-10';
      case 'execution.reverted':
        return 'border-atom-error bg-red-500 bg-opacity-10';
      case 'safety.triggered':
        return severity === 'critical' ? 'border-atom-error bg-red-500 bg-opacity-10' : 'border-atom-warning bg-yellow-500 bg-opacity-10';
      case 'opportunity.detected':
        return 'border-atom-info bg-blue-500 bg-opacity-10';
      default:
        return 'border-gray-500 bg-gray-500 bg-opacity-10';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatEventDescription = (event: EventItem) => {
    switch (event.event_type) {
      case 'opportunity.detected':
        const oppPayload = event.payload as OpportunityPayload;
        return `${oppPayload.asset_in}/${oppPayload.asset_out} spread: ${oppPayload.spread_bps?.toFixed(1)} bps`;
      case 'execution.confirmed':
        const execPayload = event.payload as ExecutionPayload;
        return `Profit: $${execPayload.actual_profit?.toFixed(2)} | Gas: ${execPayload.actual_gas?.toFixed(4)} ETH`;
      case 'execution.reverted':
        const revPayload = event.payload as ExecutionPayload;
        return `Reason: ${revPayload.revert_reason} | Gas used: ${revPayload.gas_used?.toFixed(4)} ETH`;
      case 'safety.triggered':
        const safetyPayload = event.payload as SafetyPayload;
        return `${safetyPayload.trigger_type} - Action: ${safetyPayload.action_taken}`;
      case 'system.status.changed':
        const sysPayload = event.payload as SystemPayload;
        return `${sysPayload.previous_status} → ${sysPayload.current_status}`;
      default:
        return JSON.stringify(event.payload);
    }
  };

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'opportunity.detected', label: 'Opportunities' },
    { value: 'execution.submitted', label: 'Submitted' },
    { value: 'execution.confirmed', label: 'Confirmed' },
    { value: 'execution.reverted', label: 'Reverted' },
    { value: 'safety.triggered', label: 'Safety Triggers' },
    { value: 'system.status.changed', label: 'System Status' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary pb-20">
      <div className="flex h-screen">
        {/* Mobile bottom nav */}
        <SideNav />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top status bar */}
          <TopStatusBar />
          
          {/* Main content area - Mobile optimized */}
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header - Compact mobile */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                      Live Activity
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Real-time event stream
                    </p>
                  </div>
                  
                  {/* Connection Status - Mobile friendly */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      isConnected ? 'bg-atom-success animate-pulse' : 'bg-atom-error'
                    }`} />
                    <span className="text-xs sm:text-sm text-gray-400">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter - Mobile optimized */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Filter:
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="select text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="text-xs sm:text-sm text-gray-400">
                    {filteredEvents.length} events
                  </div>
                </div>
              </div>

              {/* Event Feed - Mobile optimized */}
              <div className="space-y-2">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <SignalIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-600" />
                    <p className="text-gray-400 text-sm sm:text-lg">
                      {isConnected ? 'Waiting for events...' : 'Connecting...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {filteredEvents.slice(-100).reverse().map((event: EventItem, index: number) => (
                      <div
                        key={event.event_id}
                        className={`event-item ${getEventColor(event.event_type, event.severity)} p-3 sm:p-4`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className={`flex-shrink-0 ${getEventColor(event.event_type, event.severity).split(' ')[1]}`}>
                            {getEventIcon(event.event_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <p className="text-xs sm:text-sm font-medium text-white capitalize truncate">
                                {event.event_type.replace('.', ' ')}
                              </p>
                              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                <span className="text-[10px] sm:text-xs text-gray-400">
                                  {formatTime(event.timestamp.iso)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                              {formatEventDescription(event)}
                            </p>
                            
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500">
                              <span className="truncate">{event.source}</span>
                              {(event.payload as any)?.chain && (
                                <span>{(event.payload as any).chain}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Summary - Mobile grid */}
              <div className="mt-6 sm:mt-8 card p-4 sm:p-6">
                <h2 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4">Summary</h2>
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-atom-info">
                      {events.filter((e: EventItem) => e.event_type === 'opportunity.detected').length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Opps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-atom-success">
                      {events.filter((e: EventItem) => e.event_type === 'execution.confirmed').length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-atom-error">
                      {events.filter((e: EventItem) => e.event_type === 'execution.reverted').length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-atom-warning">
                      {events.filter((e: EventItem) => e.event_type === 'safety.triggered').length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Safety</div>
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