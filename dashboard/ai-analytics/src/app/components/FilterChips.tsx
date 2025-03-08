'use client';

interface FilterChip {
  dimension: string;
  value: string;
  onRemove: (value: string) => void;
}

export default function FilterChips({ dimension, value, onRemove }: FilterChip) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-800 border border-gray-700">
      <span className="text-gray-400">{dimension}</span>
      <span className="text-gray-400">is</span>
      <span className="font-medium text-white">{value}</span>
      <button
        onClick={() => onRemove(value)}
        className="ml-1 text-gray-400 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  );
} 