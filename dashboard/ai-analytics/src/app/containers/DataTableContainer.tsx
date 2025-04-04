// dashboard/ai-analytics/src/app/containers/DataTableContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { useLLMMessages } from '@/hooks/useTinybirdData';
import { Search, Sparkles } from 'lucide-react';

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
      similarity_threshold: 0.6
    } : {})
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchInput.trim() || null);
  };
  
  // Handle input change and trigger search when input becomes empty
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    
    // If the input becomes empty, clear the search
    if (!newValue.trim()) {
      setSearchText(null);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow" data-table-search>
            <button
              type="submit"
              className="absolute inset-y-0 left-0 flex items-center px-4 text-white hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search conversations semantically..."
              className="w-full h-[48px] px-4 pl-10 pr-12 py-2 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle focus:outline-none focus:ring-1 focus:ring-white placeholder:text-tremor-content dark:placeholder:text-dark-tremor-content placeholder:text-sm font-['Roboto'] dark:placeholder:text-[#8D8D8D] placeholder:focus:opacity-0"
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center px-4 text-white hover:text-white"
            >
              <Sparkles className={`w-4 h-4 search-input-right-icon ${isGeneratingEmbedding ? 'animate' : ''}`} />
            </button>
          </div>
          {/* {searchText && (
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
          )} */}
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