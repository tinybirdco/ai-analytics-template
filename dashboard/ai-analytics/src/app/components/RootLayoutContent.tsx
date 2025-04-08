'use client';

import { ReactNode, useEffect } from 'react';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useModal } from '../context/ModalContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import CostPredictionModal from './CostPredictionModal';
import { FloatingNotification } from '@/components/ui/floating-notification';
import { useSearchParams } from 'next/navigation';
import { getApiUrlFromHost, extractHostFromToken } from '@/lib/tinybird-utils';

interface RootLayoutContentProps {
  children: ReactNode;
  initialToken: string;
  initialOrgName: string;
}

export function RootLayoutContent({ children, initialToken, initialOrgName }: RootLayoutContentProps) {
  const { setToken, setOrgName, setApiUrl } = useTinybirdToken();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  // Set the initial values from the server
  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      // Extract host from token if it's a JWT
      try {
        const host = extractHostFromToken(tokenParam);
        if (host) {
          // Convert host to API URL
          const apiUrl = getApiUrlFromHost(host);
          setApiUrl(apiUrl);
          setOrgName(host);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    } else {
      setToken(initialToken);
      setOrgName(initialOrgName);
      setApiUrl(process.env.NEXT_PUBLIC_TINYBIRD_API_URL || 'https://api.tinybird.co');
    }
  }, [tokenParam, initialToken, initialOrgName, setToken, setOrgName, setApiUrl]);

  return (
    <>
      {children}
      <ModalController filters={{}} />
      <FloatingNotification
        links={{
          github: 'https://github.com/tinybirdco/ai-analytics-template',
          tinybird: 'https://tinybird.co/templates/ai-analytics-template',
        }}
        hideSignIn={!!tokenParam}
      />
    </>
  );
}

function ModalController({ filters }: { filters: Record<string, string> }) {
  const { isCostPredictionOpen, openCostPrediction, closeCostPrediction } = useModal();

  useKeyboardShortcut('k', () => {
    if (!isCostPredictionOpen) {
      openCostPrediction();
    }
  }, true);

  return (
    <CostPredictionModal
      isOpen={isCostPredictionOpen}
      onClose={closeCostPrediction}
      currentFilters={filters}
    />
  );
} 