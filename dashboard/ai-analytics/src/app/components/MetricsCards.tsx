'use client';

import SparkChartContainer from '../containers/SparkChartContainer';

interface MetricsCardsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  isLoading: boolean;
}

export default function MetricsCards({ data, isLoading }: MetricsCardsProps) {
  return (
    <div className="h-full grid grid-rows-2">
      <SparkChartContainer 
        data={data}
        isLoading={isLoading}
        chartType="line" 
        metric="avg_duration"
        title="Average Duration"
        className="pt-2"
      />
      <SparkChartContainer 
        data={data}
        isLoading={isLoading}
        chartType="stacked-bar" 
        metric="total_requests"
        title="Total Requests"
      />
      <SparkChartContainer 
        data={data}
        isLoading={isLoading}
        chartType="stacked-area" 
        metric="total_tokens"
        title="Total Tokens"
      />
    </div>
  );
} 