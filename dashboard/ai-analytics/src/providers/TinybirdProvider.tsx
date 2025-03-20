'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface TinybirdContextType {
  token: string | null;
  orgName: string | null;
  setToken: (token: string) => void;
  setOrgName: (orgName: string) => void;
}

const TinybirdContext = createContext<TinybirdContextType | null>(null);
const queryClient = new QueryClient();

export function TinybirdProvider({ 
  children,
}: { 
  children: ReactNode;
}) {
  const [token, setTokenState] = useState<string | null>(null);
  const [orgName, setOrgNameState] = useState<string | null>(null);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
  }, []);

  const setOrgName = useCallback((newOrgName: string) => {
    setOrgNameState(newOrgName);
  }, []);

  const contextValue = useMemo(() => ({
    token,
    orgName,
    setToken,
    setOrgName
  }), [token, orgName, setToken, setOrgName]);

  return (
    <TinybirdContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TinybirdContext.Provider>
  );
} 

export function useTinybirdToken() {
  const context = useContext(TinybirdContext);
  if (!context) {
    throw new Error('useTinybirdToken must be used within a TinybirdProvider');
  }
  return context;
}