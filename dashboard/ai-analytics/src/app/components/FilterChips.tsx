'use client';

import { X } from 'lucide-react';

interface FilterChip {
  dimension: string;
  value: string;
  onRemove: (value: string) => void;
}

export default function FilterChips({ dimension, value, onRemove }: FilterChip) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#393939] font-['Roboto'] text-sm text-[#C6C6C6] hover:text-[var(--accent)] border border-transparent hover:bg-transparent hover:border hover:border-[var(--accent)] transition-colors">
      <span>{dimension}: {value}</span>
      <button
        onClick={() => onRemove(value)}
        aria-label={`Remove ${dimension} filter for ${value}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
} 