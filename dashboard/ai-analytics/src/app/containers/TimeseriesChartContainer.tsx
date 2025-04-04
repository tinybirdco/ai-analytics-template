'use client';

import TimeseriesChart from '../components/TimeseriesChart';

interface TimeseriesData {
  date: string;
  category: string;  // model name
  total_requests: number;
  total_errors: number;
  total_tokens: number;
  total_completion_tokens: number;
  total_prompt_tokens: number;
  total_cost: number;
  avg_duration: number;
  avg_response_time: number;
}

interface TimeseriesChartContainerProps {
  data: { data: TimeseriesData[] };
  isLoading: boolean;
  filters: Record<string, string | undefined>;
  onFiltersChange: (filters: Record<string, string | undefined>) => void;
}

export default function TimeseriesChartContainer({ 
  data, 
  isLoading, 
  filters,
  onFiltersChange
}: TimeseriesChartContainerProps) {
  // Return the original TimeseriesChart component
  return (
    <div className="w-full h-full">
      <TimeseriesChart 
        data={data} 
        isLoading={isLoading}
        filters={filters as Record<string, string>} 
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
} 