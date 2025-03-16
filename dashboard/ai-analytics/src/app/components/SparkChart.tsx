'use client';

import {
    Card,
    SparkAreaChart,
    LineChart,
    BarChart,
    AreaChart,
  } from '@tremor/react';

  
  // Create consistent color mapping with divergent colors
  const colorMap = {
    'gpt-4': 'orange',
    'gpt-3.5-turbo': 'cyan',
    'gpt-4-turbo': 'amber',
    'claude-2': 'teal',
    // Add more models as needed
  };

  // Default colors for unknown models
  const defaultColors = ['orange', 'cyan', 'amber', 'teal', 'lime', 'pink'];

  type ChartType = 'area' | 'line' | 'bar' | 'stacked-bar' | 'stacked-area';

  interface SparkChartProps {
    data: Array<{
      date: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }>;
    categories: string[];
    chartType?: ChartType;
    title: string;
    value: string;
  }

  export default function SparkChart({ 
    data,
    categories,
    chartType = 'line',
    title,
    value
  }: SparkChartProps) {
    const ChartComponent = {
      'stacked-bar': BarChart,
      'stacked-area': AreaChart,
      'area': SparkAreaChart,
      'line': LineChart,
      'bar': BarChart
    }[chartType];

    const isStacked = chartType.startsWith('stacked-');

    // Map colors consistently with TimeseriesChart
    const colors = categories.map(category => 
      colorMap[category as keyof typeof colorMap] || 
      defaultColors[categories.indexOf(category) % defaultColors.length]
    );

    return (
      <Card className="h-full w-full rounded-none" style={{ boxShadow: 'none' }}>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          {title}
        </p>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {value}
        </p>
        <div className="mt-6">
          <ChartComponent
            data={data}
            index="date"
            categories={categories}
            showGradient={true}
            colors={colors}
            className="h-28 w-full"
            showXAxis={true}
            showYAxis={true}
            showLegend={false}
            showGridLines={false}
            showAnimation={true}
            curveType="monotone"
            stack={isStacked}
          />
        </div>
      </Card>
    );
  }