'use client';

import { useLLMUsage } from '@/hooks/useTinybirdData';
import TimeseriesChart from '../components/TimeseriesChart';

export default function TimeseriesChartContainer() {
  const { data, isLoading, error } = useLLMUsage();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <TimeseriesChart data={data} />;
} 