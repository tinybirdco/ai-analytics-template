'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import FilterChips from './FilterChips';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useRef, useState } from 'react';
import DateRangeSelector from './DateRangeSelector';
import { CalculatorIcon, FilterIcon, SettingsIcon, SignInIcon } from './icons';
import { useModal } from '../context/ModalContext';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import ApiKeyInput from './ApiKeyInput';
import { Dialog, DialogPanel } from '@tremor/react';
import { Sparkles } from 'lucide-react';

interface Selection {
  dimension: string;
  dimensionName: string;
  values: string[];
}

interface TopBarProps {
  selections: Selection[];
  onRemoveFilter: (dimension: string, value: string) => void;
}

export default function TopBar({ selections, onRemoveFilter }: TopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgName } = useTinybirdToken();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { openCostPrediction } = useModal();
  const { openaiKey } = useApiKeyStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget.value;
      if (input.trim()) {
        // Check if API key is available
        if (!openaiKey) {
          alert('Please provide your OpenAI API key in settings to use this feature.');
          return;
        }
        
        setIsLoading(true);
        console.log('Searching for:', input);
        
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: input, apiKey: openaiKey }),
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const filters = await response.json();
          console.log('AI response:', filters);
          
          // Apply filters to URL
          const params = new URLSearchParams(searchParams.toString());
          
          // Process each filter from the AI response
          Object.entries(filters).forEach(([key, value]) => {
            if (!value) return; // Skip empty values
            
            // For date_range, handle special case
            if (key === 'date_range') {
              // TODO: Handle date range logic here if needed
              return;
            }
            
            // For regular dimensions, add to URL params
            params.set(key, value as string);
          });
          
          // Update the URL with new filters
          const newUrl = `?${params.toString()}`;
          console.log('Updating URL to:', newUrl);
          router.push(newUrl);
          
          // Clear input
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleRemoveFilter = (dimension: string, value: string) => {
    // Get current params
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(dimension)?.split(',') || [];
    
    // Remove the value
    const newValues = currentValues.filter(v => v !== value);
    
    // Update or remove the param
    if (newValues.length > 0) {
      params.set(dimension, newValues.join(','));
    } else {
      params.delete(dimension);
    }
    
    // Update URL
    router.push(`?${params.toString()}`);
    
    // Notify parent
    onRemoveFilter(dimension, value);
  };

  // Helper function to get dimension display name
  // const getDimensionName = (dimension: string): string => {
  //   const tab = tabs.find(t => t.key === dimension);
  //   return tab ? tab.name : dimension.charAt(0).toUpperCase() + dimension.slice(1);
  // };

  return (
    <div className="flex items-center justify-between p-4 pb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={openCostPrediction}
          className="ai-calculator-button"
        >
          <span className="font-roboto text-base font-normal">
            AI Cost Calculator
          </span>
          <FilterIcon fill="#0a0a0a" />
        </button>
        <div className="relative w-[288px] pl-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask AI..."
            className="w-full h-[48px] px-4 pr-12 py-2 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle focus:outline-none focus:ring-1 focus:ring-white placeholder:text-tremor-content dark:placeholder:text-dark-tremor-content placeholder:text-sm font-['Roboto'] dark:placeholder:text-[#C6C6C6]"
            onKeyDown={handleSearch}
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
            ) : (
              <button type="submit" onClick={() => handleSearch({ key: 'Enter' } as any)}>
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <DateRangeSelector />
        <div className="flex flex-wrap">
          {selections.map((selection) => (
            selection.values.map((value) => (
              <FilterChips
                key={`${selection.dimension}-${value}`}
                dimension={selection.dimensionName}
                value={value}
                onRemove={() => handleRemoveFilter(selection.dimension, value)}
              />
            ))
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="settings-button"
        >
          <SettingsIcon />
        </button>
        {/* <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {orgName || 'Admin User'}
        </span> */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="settings-button">
              <SignInIcon />
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      
      {/* Settings Modal */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        static={true}
      >
        <DialogPanel className="max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <ApiKeyInput />
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
} 