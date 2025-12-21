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

export default function LiveActivityPage() {
  const { events, isConnected } = useEventStream();
  const [filter, setFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
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

  const formatEventDescription = (event: any) => {
    switch (event.event_type) {
      case 'opportunity.detected':
        return `${event.payload.asset_in}/${event.payload.asset_out} spread: ${event.payload.spread_bps.toFixed(1)} bps`;
      case 'execution.confirmed':
        return `Profit: $${event.payload.actual_profit?.toFixed(2)} | Gas: ${event.payload.actual_gas?.toFixed(4)} ETH`;
      case 'execution.reverted':
        return `Reason: ${event.payload.revert_reason} | Gas used: ${event.payload.gas_used?.toFixed(4)} ETH`;
      case 'safety.triggered':
        return `${event.payload.trigger_type} - Action: ${event.payload.action_taken}`;
      case 'system.status.changed':
        return `${event.payload.previous_status} → ${event.payload.current_status}`;
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
    <div className="min-h-screen bg-gradient-to-br from-atom-primary to-atom-secondary">
      <div className="flex h-screen">
        {/* Sidebar */}
        <SideNav />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top status bar */}
          <TopStatusBar />
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Live Activity Feed
                    </h1>
                    <p className="text-gray-400">
                      Real-time event stream from the ATOM platform
                    </p>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isConnected ? 'bg-atom-success animate-pulse' : 'bg-atom-error'
                    }`} />
                    <span className="text-sm text-gray-400">
                      {isConnected ? 'Live Stream' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-400">
                    Filter Events:
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="select text-sm"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Showing {filteredEvents.length} events</span>
                  </div>
                </div>
              </div>

              {/* Event Feed */}
              <div className="space-y-2">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <SignalIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">
                      {isConnected ? 'Waiting for events...' : 'Connecting to event stream...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredEvents.slice(-100).reverse().map((event, index) => (
                      <div
                        key={event.event_id}
                        className={`event-item ${getEventColor(event.event_type, event.severity)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 ${getEventColor(event.event_type, event.severity).split(' ')[1]}`}>
                            {getEventIcon(event.event_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-white capitalize">
                                {event.event_type.replace('.', ' ')}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                  {formatTime(event.timestamp.iso)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  event.severity === 'success' ? 'bg-green-600' :
                                  event.severity === 'error' ? 'bg-red-600' :
                                  event.severity === 'warning' ? 'bg-yellow-600' :
                                  'bg-gray-600'
                                }`}>
                                  {event.severity}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-2">
                              {formatEventDescription(event)}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Source: {event.source}</span>
                              <span>Chain: {event.payload.chain || 'N/A'}</span>
                              {event.payload.confidence_score && (
                                <span>Confidence: {(event.payload.confidence_score * 100).toFixed(0)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Summary */}
              <div className="mt-8 card">
                <h2 className="text-xl font-bold text-white mb-4">Event Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-atom-info">
                      {events.filter(e => e.event_type === 'opportunity.detected').length}
                    </div>
                    <div className="text-xs text-gray-400">Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-atom-success">
                      {events.filter(e => e.event_type === 'execution.confirmed').length}
                    </div>
                    <div className="text-xs text-gray-400">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-atom-error">
                      {events.filter(e => e.event_type === 'execution.reverted').length}
                    </div>
                    <div className="text-xs text-gray-400">Reverted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-atom-warning">
                      {events.filter(e => e.event_type === 'safety.triggered').length}
                    </div>
                    <div className="text-xs text-gray-400">Safety</div>
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