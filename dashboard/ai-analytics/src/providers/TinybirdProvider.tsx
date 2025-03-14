'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface TinybirdContextType {
  token: string | null;
  orgName: string | null;
  setToken: (token: string) => void;
  setOrgName: (orgName: string) => void;
}

const TinybirdContext = createContext<TinybirdContextType | null>(null);

const queryClient = new QueryClient();

export function TinybirdProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  return (
    <TinybirdContext.Provider value={{ token, orgName, setToken, setOrgName }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TinybirdContext.Provider>
  );
}

export function useTinybirdToken() {
  const context = useContext(TinybirdContext);
  if (!context) {
    throw new Error('useTinybirdToken must be used within TinybirdProvider');
  }
  return context;
} 