'use client';

import TimeseriesChart from '../components/TimeseriesChart';

interface TimeseriesChartContainerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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