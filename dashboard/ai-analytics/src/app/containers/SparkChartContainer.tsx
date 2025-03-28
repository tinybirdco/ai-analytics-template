'use client';

import SparkChart from '../components/SparkChart';

interface DataPoint {
  date: string;
  category: string;
  avg_duration: number;
  total_requests: number;
  total_tokens: number;
}

interface SparkChartData {
  data: DataPoint[];
}

interface SparkChartContainerProps {
  data: SparkChartData;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartType?: any;
  metric: 'avg_duration' | 'total_requests' | 'total_tokens';
  title: string;
  className?: string;
}

export default function SparkChartContainer({ 
  data,
  isLoading,
  chartType = 'area',
  metric,
  title,
  className
}: SparkChartContainerProps) {
  if (isLoading) return <div>Loading...</div>;

  // Get unique dates and categories
  const dates = [...new Set(data.data.map((d: DataPoint) => d.date))].sort();
  const categories = [...new Set(data.data.map((d: DataPoint) => d.category))];

  // Transform data for the chart
  const transformedData = dates.map(date => {
    const dayData = data.data.filter((d: DataPoint) => d.date === date);
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
      className={className}
    />
  );
} 