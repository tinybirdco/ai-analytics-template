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
  unit?: string;
}

export default function SparkChartContainer({ 
  data,
  isLoading,
  chartType = 'area',
  metric,
  title,
  className,
  unit = ''
}: SparkChartContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transformedData: any;
  let categories: string[] = [];
  let formattedValue: string = '';
  let metricValue: number = 0;
  let dates: string[] = [];

  if (!isLoading) {
    // Get unique dates and categories
    dates = [...new Set(data.data.map((d: DataPoint) => d.date))].sort();
    categories = [...new Set(data.data.map((d: DataPoint) => d.category))];

    // Transform data for the chart
    transformedData = dates.map(date => {
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
    metricValue = data.data.reduce((sum, curr) => sum + curr[metric], 0);
    formattedValue = metric === 'avg_duration' 
      ? `${(metricValue / data.data.length).toFixed(2)} s`
      : metric === 'total_tokens'
        ? `${metricValue.toLocaleString()} tokens`
        : metricValue.toLocaleString();
  }

  return (
    <SparkChart 
      data={transformedData}
      categories={categories}
      title={title}
      value={formattedValue}
      chartType={chartType}
      className={className}
      unit={unit}
      isLoading={isLoading}
    />
  );
} 