// src/app/context/ModalContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isCostPredictionOpen: boolean;
  openCostPrediction: () => void;
  closeCostPrediction: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isCostPredictionOpen, setIsCostPredictionOpen] = useState(false);

  const openCostPrediction = () => setIsCostPredictionOpen(true);
  const closeCostPrediction = () => setIsCostPredictionOpen(false);

  return (
    <ModalContext.Provider value={{ 
      isCostPredictionOpen, 
      openCostPrediction, 
      closeCostPrediction 
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}