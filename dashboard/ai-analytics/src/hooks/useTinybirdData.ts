import { useQuery } from '@tanstack/react-query';
import { fetchLLMUsage, fetchGenericCounter, fetchLLMMessages } from '@/services/tinybird';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useState, useEffect } from 'react';

export function useLLMUsage(filters: Record<string, string>) {
  const { token } = useTinybirdToken();

  return useQuery({
    queryKey: ['llm-usage', filters],
    queryFn: () => fetchLLMUsage(token!, filters),
    enabled: !!token
  });
}

export function useGenericCounter(dimension: string, filters: Record<string, string>) {
  const { token } = useTinybirdToken();
  const allFilters = {
    ...filters,
    dimension
  };

  return useQuery({
    queryKey: ['generic-counter', dimension, filters],
    queryFn: () => fetchGenericCounter(token!, allFilters)
  });
}

export function useLLMMessages(filters: Record<string, string>) {
  const { token } = useTinybirdToken();

  return useQuery({
    queryKey: ['llm-messages', filters],
    queryFn: () => fetchLLMMessages(token!, filters),
    enabled: !!token
  });
}

import { searchLLMMessagesByVector } from '@/services/tinybird';

export function useLLMVectorSearch(
  searchText: string | null,
  filters: Record<string, string>
) {
  const { token } = useTinybirdToken();
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

  return useQuery({
    queryKey: ['llm-vector-search', searchText, embedding, filters],
    queryFn: () => searchLLMMessagesByVector(token!, { 
      ...filters, 
      embedding: embedding || undefined,
      similarity_threshold: 0.7, // Adjust as needed
    }),
    enabled: !!token && !!embedding,
  });
}