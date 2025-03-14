'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import FilterChips from './FilterChips';

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

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
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
      
      <div className="flex items-center space-x-4">
        {/* Auth buttons */}
        <div className="flex items-center space-x-2">
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
    </div>
  );
} 