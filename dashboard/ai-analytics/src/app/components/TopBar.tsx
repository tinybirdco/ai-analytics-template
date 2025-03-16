'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import FilterChips from './FilterChips';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useRef, useState } from 'react';

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

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget.value;
      if (input.trim()) {
        setIsLoading(true);
        console.log('Searching for:', input);
        
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: input }),
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
          console.error('Error during search:', error);
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
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {orgName || 'Admin User'}
        </span>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask AI..."
            className="px-4 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
            onKeyDown={handleSearch}
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
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
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  );
} 