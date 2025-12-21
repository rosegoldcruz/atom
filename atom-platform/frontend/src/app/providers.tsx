'use client';

import { ReactNode } from 'react';
import { EventStreamProvider } from '@/contexts/EventStreamContext';
import { SystemStateProvider } from '@/contexts/SystemStateContext';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <EventStreamProvider>
        <SystemStateProvider>
          {children}
        </SystemStateProvider>
      </EventStreamProvider>
    </AuthProvider>
  );
}