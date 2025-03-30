'use client';

interface FilterChip {
  dimension: string;
  value: string;
  onRemove: (value: string) => void;
}

export default function FilterChips({ dimension, value, onRemove }: FilterChip) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <span className="text-gray-500 dark:text-gray-400">{dimension}</span>
        <span className="text-gray-500 dark:text-gray-400">is</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        <button
          onClick={() => onRemove(value)}
          className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label={`Remove ${dimension} filter for ${value}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 