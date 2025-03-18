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
}

export default function TimeseriesChart({ data, filters, onFiltersChange }: TimeseriesChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgName } = useTinybirdToken();

  // Add null check for data
  if (!data?.data) {
    return <div>Loading...</div>;
  }

  const dates = [...new Set(data.data.map(d => d.date))].sort();
  const models = [...new Set(data.data.map(d => d.category))];

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

  const transformedData = dates.map(date => {
    const dayData = data.data.filter(d => d.date === date);
    return {
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      }),
      ...models.reduce((acc, model) => ({
        ...acc,
        [model]: dayData.find(d => d.category === model)?.total_cost || 0
      }), {})
    };
  });

  const tabs = [
    {
      name: 'Model',
      key: 'model',
      data: transformedData,
      categories: models,
      colors: models.map(model => colorMap[model as keyof typeof colorMap] || defaultColors[models.indexOf(model) % defaultColors.length]),
      summary: models.map(model => ({
        name: model,
        total: data.data
          .filter(d => d.category === model)
          .reduce((sum, item) => sum + item.total_cost, 0),
        color: `bg-${colorMap[model as keyof typeof colorMap] || defaultColors[models.indexOf(model) % defaultColors.length]}-500`,
      })),
    },
    {
      name: 'Provider',
      key: 'provider',
      data: transformedData,
      categories: models,
      colors: defaultColors,
      summary: models.map(model => ({
        name: model,
        total: data.data
          .filter(d => d.category === model)
          .reduce((sum, item) => sum + item.total_cost, 0),
        color: `bg-${defaultColors[models.indexOf(model) % defaultColors.length]}-500`,
      })),
    },
    {
      name: 'Environment',
      key: 'environment',
      data: transformedData,
      categories: models,
      colors: defaultColors,
      summary: models.map(model => ({
        name: model,
        total: data.data
          .filter(d => d.category === model)
          .reduce((sum, item) => sum + item.total_cost, 0),
        color: `bg-${defaultColors[models.indexOf(model) % defaultColors.length]}-500`,
      })),
    }
  ];

  if (!orgName) {
    tabs.push({
      name: 'Organization',
      key: 'organization',
      data: transformedData,
      categories: models,
      colors: defaultColors,
      summary: models.map(model => ({
        name: model,
        total: data.data
          .filter(d => d.category === model)
          .reduce((sum, item) => sum + item.total_cost, 0),
        color: `bg-${defaultColors[models.indexOf(model) % defaultColors.length]}-500`,
      })),
    })
  }

  const handleTabChange = (index: number) => {
    const tab = tabs[index];
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('column_name', tab.key);
    router.push(`?${params.toString()}`);
    
    // Create new filters object
    const newFilters = { ...filters, column_name: tab.key };
    // Pass the new filters up to parent component
    onFiltersChange?.(newFilters);
  };

  // Determine the default index - use 'model' if no column_name is specified
  const defaultIndex = tabs.findIndex(t => t.key === (searchParams.get('column_name') || 'model'));
  
  return (
    <Card className="h-full p-0 rounded-none border-0" style={{ boxShadow: '-1px 0 0 0 rgb(55 65 81)' }}>
      <div className="flex h-full flex-col">
        <div className="flex-1 border-t border-tremor-border p-6 dark:border-dark-tremor-border overflow-hidden">
          <TabGroup 
            className="h-full flex flex-col"
            onIndexChange={handleTabChange}
            defaultIndex={defaultIndex >= 0 ? defaultIndex : 0}
          >
            <div className="flex-none md:flex md:items-center md:justify-between">
              <TabList
                variant="solid"
                className="w-full rounded-tremor-small md:w-[400px]"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className="w-full whitespace-nowrap px-3 justify-center ui-selected:text-tremor-content-strong ui-selected:dark:text-dark-tremor-content-strong"
                  >
                    {tab.name}
                  </Tab>
                ))}
              </TabList>
              <div className="hidden md:flex md:items-center md:space-x-2">
                <span
                  className="shrink-0 animate-pulse rounded-tremor-full bg-emerald-500/30 p-1"
                  aria-hidden={true}
                >
                  <span className="block size-2 rounded-tremor-full bg-emerald-500" />
                </span>
                <p className="mt-4 text-tremor-default text-tremor-content dark:text-dark-tremor-content md:mt-0">
                  Updated just now
                </p>
              </div>
            </div>
            <TabPanels className="flex-1 min-h-0 overflow-hidden">
              {tabs.map((tab) => (
                <TabPanel key={tab.name} className="h-full flex flex-col">
                  <ul className="flex-none mt-6 flex flex-wrap gap-x-20 gap-y-10">
                    {tab.summary.map((item) => (
                      <li key={item.name}>
                        <div className="flex items-center space-x-2">
                          <span
                            className={classNames(
                              item.color,
                              'size-3 shrink-0 rounded-sm',
                            )}
                            aria-hidden={true}
                          />
                          <p className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {valueFormatter(item.total)}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-tremor-default text-tremor-content dark:text-dark-tremor-content">
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
                      valueFormatter={valueFormatter}
                      className="h-[calc(100%-24px)] mt-10 hidden md:block"
                      showTooltip={true}
                      showAnimation={true}
                      showXAxis={true}
                    />
                    <BarChart
                      data={tab.data}
                      index="date"
                      categories={tab.categories}
                      colors={tab.colors}
                      stack={true}
                      showLegend={false}
                      showYAxis={false}
                      valueFormatter={valueFormatter}
                      className="h-[calc(100%-24px)] mt-6 md:hidden"
                      showTooltip={true}
                      showAnimation={true}
                      showXAxis={true}
                    />
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </Card>
  );
}