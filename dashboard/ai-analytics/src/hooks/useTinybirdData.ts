import { useQuery } from '@tanstack/react-query';
import { fetchLLMUsage, fetchGenericCounter, fetchLLMMessages } from '@/services/tinybird';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { useState, useEffect } from 'react';

export function useLLMUsage(filters: Record<string, string | undefined> = {}) {
  const { token, apiUrl } = useTinybirdToken();

  return useQuery({
    queryKey: ['llm-usage', filters],
    queryFn: () => fetchLLMUsage(token!, apiUrl!, filters),
    enabled: !!token && !!apiUrl
  });
}

export function useGenericCounter(params: Record<string, string | undefined> = {}) {
  const { token, apiUrl } = useTinybirdToken();

  return useQuery({
    queryKey: ['generic-counter', params],
    queryFn: () => fetchGenericCounter(token!, apiUrl!, params),
    enabled: !!token && !!apiUrl
  });
}

export function useLLMMessages(filters: Record<string, string | number[] | string | number | undefined>) {
  const { token, apiUrl } = useTinybirdToken();

  return useQuery({
    queryKey: ['llm-messages', filters],
    queryFn: () => fetchLLMMessages(token!, apiUrl!, filters),
    enabled: !!token && !!apiUrl
  });
}

import { searchLLMMessagesByVector } from '@/services/tinybird';

export function useLLMVectorSearch(
  searchText: string | null,
  filters: Record<string, string>
) {
  const { token, apiUrl } = useTinybirdToken();
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  // const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);

  // Generate embedding when search text changes
  useEffect(() => {
    async function generateEmbedding() {
      if (!searchText) {
        setEmbedding(null);
        return;
      }
      
      // setIsGeneratingEmbedding(true);
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
      } 
      // finally {
      //   setIsGeneratingEmbedding(false);
      // }
    }
    
    generateEmbedding();
  }, [searchText]);

  return useQuery({
    queryKey: ['llm-vector-search', searchText, embedding, filters],
    queryFn: () => searchLLMMessagesByVector(token!, apiUrl!, { 
      ...filters, 
      embedding: embedding || undefined,
      similarity_threshold: 0.6, // Adjust as needed
    }),
    enabled: !!token && !!apiUrl && !!embedding,
  });
}