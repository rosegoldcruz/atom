'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useWebSocket from 'react-use-websocket';
import { AtomEvent } from '../../../shared/event-schema';

interface EventStreamContextType {
  events: AtomEvent[];
  isConnected: boolean;
  subscribe: (eventTypes: string[]) => void;
  unsubscribe: (eventTypes: string[]) => void;
  getRecentEvents: (count: number) => AtomEvent[];
}

const EventStreamContext = createContext<EventStreamContextType | undefined>(undefined);

interface EventStreamProviderProps {
  children: ReactNode;
}

export function EventStreamProvider({ children }: EventStreamProviderProps) {
  const [events, setEvents] = useState<AtomEvent[]>([]);
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  
  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to all events by default
      sendMessage(JSON.stringify({
        type: 'subscribe',
        events: ['all']
      }));
    },
    onClose: () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    },
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    reconnectAttempts: 10
  });

  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'event' && data.data) {
          const event = data.data as AtomEvent;
          
          setEvents(prev => {
            const newEvents = [...prev, event];
            // Keep only last 1000 events to prevent memory issues
            return newEvents.slice(-1000);
          });
        }
      } catch (error) {
        console.error('Failed to process WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const subscribe = (eventTypes: string[]) => {
    setSubscribedEvents(prev => {
      const combined = [...prev, ...eventTypes];
      return Array.from(new Set(combined));
    });
    sendMessage(JSON.stringify({
      type: 'subscribe',
      events: eventTypes
    }));
  };

  const unsubscribe = (eventTypes: string[]) => {
    setSubscribedEvents(prev => prev.filter(type => !eventTypes.includes(type)));
    // Note: Actual unsubscription would require server-side support
  };

  const getRecentEvents = (count: number): AtomEvent[] => {
    return events.slice(-count);
  };

  const value: EventStreamContextType = {
    events,
    isConnected: readyState === 1, // WebSocket.OPEN
    subscribe,
    unsubscribe,
    getRecentEvents
  };

  return (
    <EventStreamContext.Provider value={value}>
      {children}
    </EventStreamContext.Provider>
  );
}

export function useEventStream() {
  const context = useContext(EventStreamContext);
  if (context === undefined) {
    throw new Error('useEventStream must be used within an EventStreamProvider');
  }
  return context;
}