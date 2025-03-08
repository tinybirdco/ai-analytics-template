'use client';

import SparkChartContainer from '../containers/SparkChartContainer';

interface MetricsCardsProps {
  filters: Record<string, string>;
}

export default function MetricsCards({ filters }: MetricsCardsProps) {
  return (
    <div className="h-full grid grid-rows-2">
      <SparkChartContainer 
        chartType="line" 
        metric="avg_duration"
        title="Average Duration"
        filters={filters}
      />
      <SparkChartContainer 
        chartType="stacked-bar" 
        metric="total_requests"
        title="Total Requests"
        filters={filters}
      />
      <SparkChartContainer 
        chartType="stacked-area" 
        metric="total_tokens"
        title="Total Tokens"
        filters={filters}
      />
    </div>
  );
} 