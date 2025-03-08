'use client';

import SparkChartContainer from '../containers/SparkChartContainer';

export default function MetricsCards() {
  return (
    <div className="h-full grid grid-rows-3">
      <SparkChartContainer 
        chartType="line" 
        metric="avg_duration"
        title="Average Duration"
        style={{ boxShadow: '0 10px 0 0 rgb(55 65 81)' }}
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