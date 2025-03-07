'use client';

import { Card } from '@tremor/react';
import SparkChartContainer from '../containers/SparkChartContainer';

export default function MetricsCards() {
  return (
    <div className="h-full grid grid-rows-3">
      <SparkChartContainer chartType="line" />
      <SparkChartContainer chartType="bar" />
      <SparkChartContainer chartType="area" />
    </div>
  );
} 