'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
    <div className="flex flex-wrap gap-2 p-4 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle border-b border-tremor-border dark:border-dark-tremor-border">
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
  );
} 