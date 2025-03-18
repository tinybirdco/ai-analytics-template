'use client';

import {
    Card,
    SparkAreaChart,
    LineChart,
    BarChart,
    AreaChart,
  } from '@tremor/react';

  // Default colors for all categories
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

    // Assign colors based on index in the categories array
    const colors = categories.map((_, index) => 
      defaultColors[index % defaultColors.length]
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
            showAnimation={false}
            curveType="monotone"
            stack={isStacked}
          />
        </div>
      </Card>
    );
  }