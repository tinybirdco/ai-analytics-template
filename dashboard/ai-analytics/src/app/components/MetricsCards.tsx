'use client';

import SparkChartContainer from '../containers/SparkChartContainer';

export default function MetricsCards() {
  return (
    <div className="h-full grid grid-rows-3">
      <SparkChartContainer 
        chartType="line" 
        metric="avg_duration"
        title="Average Duration"
      />
      <SparkChartContainer 
        chartType="stacked-bar" 
        metric="total_requests"
        title="Total Requests"
      />
      <SparkChartContainer 
        chartType="stacked-area" 
        metric="total_tokens"
        title="Total Tokens"
      />
    </div>
  );
} 