'use client';

import {
  BarChart,
  Card,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@tremor/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import CustomTooltip from './CustomTooltip';
import { useState } from 'react';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const valueFormatter = (number: number) => 
  Intl.NumberFormat('us').format(number).toString();

interface TimeseriesData {
  date: string;
  category: string;  // model name
  total_requests: number;
  total_errors: number;
  total_tokens: number;
  total_completion_tokens: number;
  total_prompt_tokens: number;
  total_cost: number;
  avg_duration: number;
  avg_response_time: number;
}

interface TimeseriesChartProps {
  data: {
    data: TimeseriesData[];
  };
  filters: Record<string, string>;
  onFiltersChange?: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

export default function TimeseriesChart({ data, filters, onFiltersChange, isLoading = false }: TimeseriesChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgName } = useTinybirdToken();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Default colors for unknown models
  const defaultColors = [
    '#27F795',  // 100% opacity
    '#27F795CC', // 80% opacity
    '#27F79599', // 60% opacity
    '#27F79566', // 40% opacity
    '#27F79533'  // 20% opacity
  ];

  // Define tab interface
  interface TabData {
    name: string;
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    categories: string[];
    colors: string[];
    summary: Array<{
      name: string;
      total: number;
      color: string;
      opacity: number;
    }>;
  }

  // Define tabs regardless of loading state
  const tabs: TabData[] = [
    {
      name: 'Model',
      key: 'model',
      data: [],
      categories: [],
      colors: defaultColors,
      summary: [],
    },
    {
      name: 'Provider',
      key: 'provider',
      data: [],
      categories: [],
      colors: defaultColors,
      summary: [],
    },
    {
      name: 'Environment',
      key: 'environment',
      data: [],
      categories: [],
      colors: defaultColors,
      summary: [],
    }
  ];

  if (!orgName) {
    tabs.push({
      name: 'Organization',
      key: 'organization',
      data: [],
      categories: [],
      colors: defaultColors,
      summary: [],
    });
  }

  // Determine the default index - use 'model' if no column_name is specified
  const defaultIndex = tabs.findIndex(t => t.key === (searchParams.get('column_name') || 'model'));

  // Only process data if we're not loading and data is available
  if (!isLoading && data?.data) {
    const dates = [...new Set(data.data.map(d => d.date))].sort();
    const models = [...new Set(data.data.map(d => d.category))];

    // Use the same approach for all tabs - just use default colors in sequence
    const transformedData = dates.map(date => {
      const dayData = data.data.filter(d => d.date === date);
      const formattedDate = new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      });
      return {
        date: formattedDate,
        originalDate: date,
        ...models.reduce((acc, model) => ({
          ...acc,
          [model]: dayData.find(d => d.category === model)?.total_cost || 0,
          [`${model}_opacity`]: selectedDate === null || selectedDate === formattedDate ? 1 : 0.3
        }), {})
      };
    });

    // Update tabs with real data
    tabs.forEach(tab => {
      tab.data = transformedData;
      tab.categories = models;
      tab.summary = models.map((model, index) => ({
        name: model,
        total: data.data
          .filter(d => d.category === model)
          .reduce((sum, item) => sum + item.total_cost, 0),
        color: `bg-[${defaultColors[index % defaultColors.length]}]`,
        opacity: selectedDate ? 0.3 : 1
      }));
    });
  }

  const handleTabChange = (index: number) => {
    const tab = tabs[index];
    // Update URL without causing a page reload
    const params = new URLSearchParams(searchParams);
    params.set('column_name', tab.key);
    router.replace(`?${params.toString()}`, { scroll: false });
    
    // Create new filters object
    const newFilters = { ...filters, column_name: tab.key };
    // Pass the new filters up to parent component
    onFiltersChange?.(newFilters);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (v: any) => {
    if (v) {
      setSelectedDate(v.date);
    } else {
      setSelectedDate(null);
    }
  };
  
  // Add $ sign to the value formatter for costs
  const costValueFormatter = (number: number) => 
    `$${valueFormatter(number)}`;
  
  return (
    <Card 
      className="h-full p-0 rounded-none border-0" 
      style={{ 
        background: 'var(--background)',  // Match page background
        boxShadow: 'none'  // Remove shadow
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <TabGroup 
            className="h-full flex flex-col"
            onIndexChange={handleTabChange}
            defaultIndex={defaultIndex >= 0 ? defaultIndex : 0}
          >
            <div className="flex-none md:flex md:items-center md:justify-between pl-4">
              <TabList className="w-auto border-none">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}>
                    {tab.name}
                  </Tab>
                ))}
              </TabList>
              <div className="hidden md:flex md:items-center px-4">
                <span
                  className="shrink-0 animate-pulse rounded-tremor-full bg-[#27F795]/30 p-1"
                  aria-hidden={true}
                >
                  <span className="block size-2 rounded-tremor-full bg-[var(--accent)]" />
                </span>
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content ml-2 font-['Roboto']">
                  Updated just now
                </p>
              </div>
            </div>
            <TabPanels className="flex-1 min-h-0 overflow-hidden px-6 pt-8">
              {tabs.map((tab) => (
                <TabPanel key={tab.name} className="h-full flex flex-col">
                  {isLoading && (
                    <div className="w-full h-full flex items-center justify-center bg-[#262626]">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent)]"></div>
                    </div>
                  )}
                  {!isLoading && !data?.data && (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-[#C6C6C6]">No data available</p>
                    </div>
                  )}
                  {!isLoading && data?.data && (
                    <>
                      <ul className="flex-none flex overflow-x-auto gap-8 pb-2">
                        {tab.summary.map((item) => (
                          <li key={item.name} className="flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={classNames(
                                  item.color,
                                  'w-4 h-4 shrink-0',
                                )}
                                aria-hidden={true}
                              />
                              <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong" style={{ fontFamily: 'var(--font-family-mono)' }}>
                                ${valueFormatter(item.total)}
                              </p>
                            </div>
                            <p className="text-xs text-[#C6C6C6] whitespace-nowrap mt-2 ml-6">
                              {item.name}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="flex-1 min-h-0 pb-6">
                        <BarChart
                          data={tab.data}
                          index="date"
                          categories={tab.categories}
                          colors={tab.colors}
                          stack={true}
                          showLegend={false}
                          yAxisWidth={45}
                          valueFormatter={costValueFormatter}
                          className="h-[calc(100%-24px)] mt-10 hidden md:block"
                          showTooltip={true}
                          showAnimation={false}
                          showXAxis={true}
                          onValueChange={handleValueChange}
                          customTooltip={(props) => (
                            <CustomTooltip
                              date={props.payload?.[0]?.payload.date}
                              unit="$"
                              entries={props.payload?.map(entry => ({
                                name: String(entry.name || ''),
                                value: Array.isArray(entry.value) ? entry.value[0] || 0 : entry.value || 0,
                                color: entry.color || '#27F795'
                              })) || []}
                            />
                          )}
                        />
                      </div>
                    </>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </Card>
  );
}