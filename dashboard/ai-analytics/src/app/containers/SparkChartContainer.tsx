'use client';

import { useLLMUsage } from '@/hooks/useTinybirdData';
import SparkChart from '../components/SparkChart';
import { type ChartType } from '@tremor/react';

interface SparkChartContainerProps {
  chartType?: ChartType;
  metric: 'avg_duration' | 'total_requests' | 'total_tokens';
  title: string;
}

export default function SparkChartContainer({ 
  chartType = 'area',
  metric,
  title 
}: SparkChartContainerProps) {
  const { data, isLoading, error } = useLLMUsage();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // Get unique dates and categories
  const dates = [...new Set(data.data.map(d => d.date))].sort();
  const categories = [...new Set(data.data.map(d => d.category))];

  // Transform data for the chart
  const transformedData = dates.map(date => {
    const dayData = data.data.filter(d => d.date === date);
    return {
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      }),
      ...categories.reduce((acc, category) => ({
        ...acc,
        [category]: dayData.find(d => d.category === category)?.[metric] || 0
      }), {})
    };
  });

  // Calculate metric average/total
  const metricValue = data.data.reduce((sum, curr) => sum + curr[metric], 0);
  const formattedValue = metric === 'avg_duration' 
    ? `${(metricValue / data.data.length).toFixed(2)}ms`
    : metric === 'total_tokens'
      ? `${metricValue.toLocaleString()} tokens`
      : metricValue.toLocaleString();

  return (
    <SparkChart 
      data={transformedData}
      categories={categories}
      title={title}
      value={formattedValue}
      chartType={chartType}
    />
  );
} 