'use client';

import SparkChartContainer from '../containers/SparkChartContainer';

interface MetricsCardsProps {
  filters: Record<string, string>;
}

export default function MetricsCards({ filters }: MetricsCardsProps) {
  return (
    <div className="h-full grid grid-rows-3">
      <SparkChartContainer 
        chartType="line" 
        metric="avg_duration"
        title="Average Duration"
        style={{ boxShadow: '0 10px 0 0 rgb(55 65 81)' }}
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