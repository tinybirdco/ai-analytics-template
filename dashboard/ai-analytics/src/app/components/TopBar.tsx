'use client';

import FilterChips from './FilterChips';

interface FilterSelection {
  dimension: string;
  dimensionName: string;
  values: string[];
}

interface TopBarProps {
  selections: FilterSelection[];
  onRemoveFilter: (dimension: string, value: string) => void;
}

export default function TopBar({ selections, onRemoveFilter }: TopBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle border-b border-tremor-border dark:border-dark-tremor-border">
      {selections.map(({ dimension, dimensionName, values }) => 
        values.map(value => (
          <FilterChips
            key={`${dimension}-${value}`}
            dimension={dimensionName}
            value={value}
            onRemove={() => onRemoveFilter(dimension, value)}
          />
        ))
      )}
    </div>
  );
} 