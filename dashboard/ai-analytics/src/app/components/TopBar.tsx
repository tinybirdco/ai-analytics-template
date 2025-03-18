'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import FilterChips from './FilterChips';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useRef, useState } from 'react';
import DateRangeSelector from './DateRangeSelector';
import { Calculator, Settings } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import ApiKeyInput from './ApiKeyInput';
import { Dialog, DialogPanel } from '@tremor/react';

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
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <button
          onClick={openCostPrediction}
          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Calculator className="w-4 h-4 mr-2" />
          AI calculator
        </button>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Filter by..."
            className="px-4 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            onKeyDown={handleSearch}
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
        <DateRangeSelector />
        <div className="flex flex-wrap gap-2">
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
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {orgName || 'Admin User'}
        </span>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
              Sign In
            </button>
          </SignInButton>
          {/* <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900">
              Sign Up
            </button>
          </SignUpButton> */}
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