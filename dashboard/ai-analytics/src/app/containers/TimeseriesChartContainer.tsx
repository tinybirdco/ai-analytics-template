'use client';

import TimeseriesChart from '../components/TimeseriesChart';
import { useLLMUsage } from '@/hooks/useTinybirdData';

interface TimeseriesChartContainerProps {
  data: any;
  isLoading: boolean;
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
}

export default function TimeseriesChartContainer({ 
  data, 
  isLoading, 
  filters,
  onFiltersChange 
}: TimeseriesChartContainerProps) {
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-[60vh] overflow-hidden">
      <TimeseriesChart 
        data={data} 
        filters={filters} 
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
} 