'use client';

import {
    Card,
    SparkAreaChart,
    LineChart,
    BarChart,
    AreaChart,
  } from '@tremor/react';
import CustomTooltip from './CustomTooltip';
import { useState } from 'react';

  // Default colors for all categories
  const defaultColors = [
    '#27F795',  // 100% opacity
    '#27F795CC', // 80% opacity
    '#27F79599', // 60% opacity
    '#27F79566', // 40% opacity
    '#27F79533'  // 20% opacity
  ];

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
    className?: string;
    unit?: string;
    isLoading?: boolean;
  }

  export default function SparkChart({ 
    data,
    categories,
    chartType = 'line',
    title,
    value,
    className,
    unit = '',
    isLoading = false
  }: SparkChartProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
      setMousePosition({
        x: e.clientX + 10, // Add 10px offset to prevent tooltip from covering cursor
        y: e.clientY - 10
      });
    };

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
      <Card className={`h-full w-full rounded-none p-4 pb-5 ${className}`} style={{ boxShadow: 'none' }}>
        {isLoading ? (
          <div className="h-[148px] w-full flex items-center justify-center bg-[#262626]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : !data?.length ? (
          <div className="h-[148px] w-full flex items-center justify-center">
            <p className="text-[#C6C6C6]">No data available</p>
          </div>
        ) : (
          <>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content" style={{ fontFamily: 'var(--font-family-base)' }}>
              {title}
            </p>
            <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong pt-[6px]">
              {value}
            </p>
            <div className="mt-[20px] relative" onMouseMove={handleMouseMove}>
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
                showGridLines={true}
                showAnimation={false}
                curveType="monotone"
                stack={isStacked}
                yAxisWidth={60}
                customTooltip={(props) => (
                  <div style={{ 
                    position: 'fixed', 
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`,
                    zIndex: 9999,
                    pointerEvents: 'none'
                  }}>
                    <CustomTooltip
                      date={props.payload?.[0]?.payload.date}
                      unit={unit}
                      entries={props.payload?.map(entry => ({
                        name: String(entry.name),
                        value: Array.isArray(entry.value) ? entry.value[0] || 0 : entry.value || 0,
                        color: entry.color || '#27F795'
                      })) || []}
                    />
                  </div>
                )}
              />
            </div>
          </>
        )}
      </Card>
    );
  }