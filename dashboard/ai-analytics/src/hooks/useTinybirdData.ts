import { useQuery } from '@tanstack/react-query';
import { fetchLLMUsage, fetchGenericCounter } from '@/services/tinybird';

export function useLLMUsage(filters: Record<string, string>) {
  return useQuery({
    queryKey: ['llm-usage', filters],
    queryFn: () => fetchLLMUsage(filters)
  });
}

export function useGenericCounter(dimension: string, filters: Record<string, string>) {
  return useQuery({
    queryKey: ['generic-counter', dimension, filters],
    queryFn: () => fetchGenericCounter({ ...filters, dimension })
  });
} 