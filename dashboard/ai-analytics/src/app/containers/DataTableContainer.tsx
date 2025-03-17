// dashboard/ai-analytics/src/app/containers/DataTableContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { useLLMMessages } from '@/hooks/useTinybirdData';
import { Search } from 'lucide-react';

interface DataTableContainerProps {
  filters: Record<string, string>;
  isLoading?: boolean;
}

export default function DataTableContainer({ filters, isLoading = false }: DataTableContainerProps) {
  const [searchText, setSearchText] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);
  
  // Generate embedding when search text changes
  useEffect(() => {
    async function generateEmbedding() {
      if (!searchText) {
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
    }
    
    generateEmbedding();
  }, [searchText]);
  
  // Use the regular messages hook with embedding when available
  const messagesQuery = useLLMMessages({
    ...filters,
    ...(embedding ? {
      embedding: embedding,
      similarity_threshold: 0.3
    } : {})
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchInput.trim() || null);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search conversations semantically..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          {searchText && (
            <button
              type="button"
              className="px-3 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={() => {
                setSearchText(null);
                setSearchInput('');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <DataTable 
          data={messagesQuery.data} 
          isLoading={isLoading || messagesQuery.isLoading || isGeneratingEmbedding} 
          searchHighlight={searchText}
        />
      </div>
    </div>
  );
}