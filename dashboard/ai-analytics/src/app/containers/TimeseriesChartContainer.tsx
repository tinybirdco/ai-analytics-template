'use client';

import TimeseriesChart from '../components/TimeseriesChart';
import { useLLMUsage } from '@/hooks/useTinybirdData';

interface TimeseriesChartContainerProps {
  filters: Record<string, string>;
}

export default function TimeseriesChartContainer({ filters }: TimeseriesChartContainerProps) {
  const { data, isLoading, error } = useLLMUsage(filters);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <TimeseriesChart data={data} filters={filters} />;
} 