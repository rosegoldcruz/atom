'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useEventStream } from './EventStreamContext';

interface SystemState {
  status: 'LIVE' | 'PAUSED' | 'DEGRADED' | 'PROTECTED';
  gasPrice: number;
  aeonState: 'Scanning' | 'Simulating' | 'Executing' | 'Cooling';
  safetyMode: boolean;
  lastUpdate: number;
}

interface SystemStateContextType {
  systemState: SystemState;
  isSystemLive: boolean;
  shouldDimUI: boolean;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

interface SystemStateProviderProps {
  children: ReactNode;
}

export function SystemStateProvider({ children }: SystemStateProviderProps) {
  const { events } = useEventStream();
  const [systemState, setSystemState] = useState<SystemState>({
    status: 'LIVE',
    gasPrice: 20,
    aeonState: 'Scanning',
    safetyMode: false,
    lastUpdate: Date.now()
  });

  // Process system events to update state
  useEffect(() => {
    const systemEvents = events.filter(event => 
      event.event_type === 'system.status.changed' ||
      event.event_type === 'safety.triggered'
    );

    if (systemEvents.length > 0) {
      const latestEvent = systemEvents[systemEvents.length - 1];
      
      if (latestEvent.event_type === 'system.status.changed') {
        setSystemState(prev => ({
          ...prev,
          status: latestEvent.payload.current_status,
          lastUpdate: latestEvent.timestamp.unix_ms
        }));
      } else if (latestEvent.event_type === 'safety.triggered') {
        setSystemState(prev => ({
          ...prev,
          safetyMode: latestEvent.payload.action_taken === 'PAUSE',
          lastUpdate: latestEvent.timestamp.unix_ms
        }));
      }
    }
  }, [events]);

  // Update gas price periodically (mock implementation)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemState(prev => ({
        ...prev,
        gasPrice: 20 + Math.random() * 30 // Mock gas price between 20-50 gwei
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const isSystemLive = systemState.status === 'LIVE';
  const shouldDimUI = systemState.status !== 'LIVE';

  const value: SystemStateContextType = {
    systemState,
    isSystemLive,
    shouldDimUI
  };

  return (
    <SystemStateContext.Provider value={value}>
      <div className={shouldDimUI ? 'filter brightness-50' : ''}>
        {children}
      </div>
    </SystemStateContext.Provider>
  );
}

export function useSystemState() {
  const context = useContext(SystemStateContext);
  if (context === undefined) {
    throw new Error('useSystemState must be used within a SystemStateProvider');
  }
  return context;
}