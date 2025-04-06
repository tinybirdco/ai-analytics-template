// dashboard/ai-analytics/src/app/containers/DataTableContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { useLLMMessages } from '@/hooks/useTinybirdData';
import { Search } from 'lucide-react';

interface DataTableContainerProps {
  isLoading: boolean;
  filters: Record<string, string | undefined>;
}

export default function DataTableContainer({ isLoading, filters }: DataTableContainerProps) {
  const [searchText, setSearchText] = useState('');
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);

  // Fetch messages with filters and embedding
  const { data, isLoading: isDataLoading } = useLLMMessages({
    ...filters,
    embedding: embedding ? JSON.stringify(embedding) : undefined
  });

  // Generate embedding when search text changes
  useEffect(() => {
    const generateEmbedding = async () => {
      if (!searchText.trim()) {
        setEmbedding(null);
        return;
      }

      setIsGeneratingEmbedding(true);
      try {
        const response = await fetch('/api/generate-embedding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: searchText }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate embedding');
        }

        const data = await response.json();
        setEmbedding(data.embedding);
      } catch (error) {
        console.error('Error generating embedding:', error);
        setEmbedding(null);
      } finally {
        setIsGeneratingEmbedding(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      generateEmbedding();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  // Combine loading states
  const isTableLoading = isLoading || isDataLoading || isGeneratingEmbedding;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          {isGeneratingEmbedding && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <DataTable
          data={data?.data || []}
          isLoading={isTableLoading}
        />
      </div>
    </div>
  );
}