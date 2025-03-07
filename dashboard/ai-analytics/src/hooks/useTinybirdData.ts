import { useQuery } from '@tanstack/react-query';
import { fetchLLMUsage, fetchGenericCounter, TinybirdParams } from '@/services/tinybird';
import { create } from 'zustand';

// Global filter state
interface FilterState {
  filters: TinybirdParams;
  setFilters: (filters: Partial<TinybirdParams>) => void;
}

export const useFilters = create<FilterState>((set) => ({
  filters: {},
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
}));

// Hook for LLM usage data
export function useLLMUsage() {
  const filters = useFilters((state) => state.filters);

  return useQuery({
    queryKey: ['llm-usage', filters],
    queryFn: () => fetchLLMUsage(filters),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Hook for generic counter data
export function useGenericCounter(dimension: string | null) {
  const filters = useFilters((state) => state.filters);

  return useQuery({
    queryKey: ['generic-counter', dimension, filters],
    queryFn: () => fetchGenericCounter({ ...filters, dimension }),
    staleTime: 30000,
    enabled: !!dimension // Only fetch when dimension is provided
  });
} 