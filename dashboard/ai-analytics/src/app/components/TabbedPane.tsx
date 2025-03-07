'use client';

import { Tab, TabGroup, TabList } from '@tremor/react';
import { useFilters, useGenericCounter } from '@/hooks/useTinybirdData';
import { useSearchParams, useRouter } from 'next/navigation';
import BarList from './BarList';
import { useState, useEffect } from 'react';

const tabs = [
  { name: 'Model', key: 'model' },
  { name: 'Provider', key: 'provider' },
  { name: 'Organization', key: 'organization' },
  { name: 'Project', key: 'project' },
  { name: 'Environment', key: 'environment' },
  { name: 'User', key: 'user' }
];

export default function TabbedPane() {
  const setFilters = useFilters((state) => state.setFilters);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDimension = searchParams.get('dimension') || tabs[0].key;
  const [selectedTab, setSelectedTab] = useState<string>(initialDimension);
  const [barListData, setBarListData] = useState<Array<{ name: string; value: number }>>([]);

  // Set initial filter
  useEffect(() => {
    setFilters({ dimension: initialDimension });
  }, []);

  const { data, isLoading, error, refetch } = useGenericCounter(selectedTab);

  // Update barListData when data changes
  useEffect(() => {
    if (data?.data) {
      const newData = data.data.map((item: any) => ({
        name: item.category || 'Unknown',
        value: item.count
      }));
      setBarListData(newData);
    }
  }, [data]);

  const handleTabChange = async (index: number) => {
    const tab = tabs[index];
    const dimension = tab.key;
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('dimension', dimension);
    router.push(`?${params.toString()}`);
    
    // Update selected tab
    setSelectedTab(dimension);
    
    // Update filters and trigger new request
    setFilters({ dimension });
    await refetch();
  };

  return (
    <div className="h-full">
      <TabGroup 
        defaultIndex={tabs.findIndex(t => t.key === selectedTab)}
        onChange={handleTabChange}
      >
        <TabList className="flex space-x-2">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${selected 
                  ? 'bg-tremor-background text-tremor-content-strong shadow'
                  : 'text-tremor-content hover:bg-tremor-background-subtle'}`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </TabList>
        <div className="mt-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading data</div>
          ) : (
            <BarList 
              data={barListData}
              valueFormatter={(value: number) => value.toLocaleString()}
            />
          )}
        </div>
      </TabGroup>
    </div>
  );
} 