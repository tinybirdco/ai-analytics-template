import { useQuery } from '@tanstack/react-query';
import { fetchLLMUsage, TinybirdParams } from '@/services/tinybird';
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