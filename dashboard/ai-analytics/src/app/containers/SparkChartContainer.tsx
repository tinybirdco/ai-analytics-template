'use client';

import { useLLMUsage } from '@/hooks/useTinybirdData';
import SparkChart from '../components/SparkChart';
import { type ChartType } from '@tremor/react';

interface SparkChartContainerProps {
  chartType?: ChartType;
}

export default function SparkChartContainer({ chartType = 'area' }: SparkChartContainerProps) {
  const { data, isLoading, error } = useLLMUsage();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <SparkChart data={data} chartType={chartType} />;
} 