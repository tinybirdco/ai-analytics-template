'use client';

import { ReactNode, useEffect } from 'react';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useModal } from '../context/ModalContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import CostPredictionModal from './CostPredictionModal';
import { FloatingNotification } from '@/components/ui/floating-notification';
import { useSearchParams } from 'next/navigation';

interface RootLayoutContentProps {
  children: ReactNode;
  initialToken: string;
  initialOrgName: string;
}

// Function to convert host to API URL
function getApiUrlFromHost(host: string): string {
  // Map of host patterns to API URLs
  const hostToApiUrl: Record<string, string> = {
    'gcp-europe-west2': 'https://api.europe-west2.gcp.tinybird.co',
    'gcp-europe-west3': 'https://api.tinybird.co',
    'gcp-us-east4': 'https://api.us-east.tinybird.co',
    'gcp-northamerica-northeast2': 'https://api.northamerica-northeast2.gcp.tinybird.co',
    'aws-eu-central-1': 'https://api.eu-central-1.aws.tinybird.co',
    'aws-eu-west-1': 'https://api.eu-west-1.aws.tinybird.co',
    'aws-us-east-1': 'https://api.us-east.aws.tinybird.co',
    'aws-us-west-2': 'https://api.us-west-2.aws.tinybird.co',
  };

  // Check if the host matches any of the patterns
  for (const [pattern, apiUrl] of Object.entries(hostToApiUrl)) {
    if (host.includes(pattern)) {
      return apiUrl;
    }
  }

  // Default to the standard API URL if no match is found
  return 'https://api.tinybird.co';
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
        const base64Url = tokenParam.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.host) {
          // Convert host to API URL
          const apiUrl = getApiUrlFromHost(payload.host);
          setApiUrl(apiUrl);
          setOrgName(payload.host);
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