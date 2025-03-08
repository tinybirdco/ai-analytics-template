'use client';

import { Tab, TabGroup, TabList } from '@tremor/react';
import { useGenericCounter } from '@/hooks/useTinybirdData';
import { useSearchParams, useRouter } from 'next/navigation';
import BarList from './BarList';
import { useState, useEffect, useMemo } from 'react';
import FilterChips from './FilterChips';

const tabs = [
  { name: 'Model', key: 'model' },
  { name: 'Provider', key: 'provider' },
  { name: 'Organization', key: 'organization' },
  { name: 'Project', key: 'project' },
  { name: 'Environment', key: 'environment' },
  { name: 'User', key: 'user' }
];

interface TabbedPaneProps {
  filters: Record<string, string>;
  onFilterUpdate: (dimension: string, name: string, values: string[]) => void;
}

export default function TabbedPane({ filters, onFilterUpdate }: TabbedPaneProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDimension = searchParams.get('dimension') || tabs[0].key;
  const [selectedTab, setSelectedTab] = useState<string>(initialDimension);
  const [barListData, setBarListData] = useState<Array<{ name: string; value: number }>>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Get all filters except current tab's filter
  const queryFilters = useMemo(() => {
    const filtered = { ...filters };
    delete filtered[selectedTab];
    return filtered;
  }, [filters, selectedTab]);

  const { data, isLoading, error } = useGenericCounter(selectedTab, queryFilters);

  // Add effect to sync with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(selectedTab);
    if (paramValue) {
      setSelectedValues(paramValue.split(','));
    } else {
      setSelectedValues([]);
    }
  }, [selectedTab, searchParams]);

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedValues(newSelection);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (newSelection.length > 0) {
      params.set(selectedTab, newSelection.join(','));
    } else {
      params.delete(selectedTab);
    }
    router.push(`?${params.toString()}`);
    
    // Notify parent to update filters
    onFilterUpdate(selectedTab, tabs.find(t => t.key === selectedTab)?.name || selectedTab, newSelection);
  };

  const handleTabChange = async (index: number) => {
    const tab = tabs[index];
    const dimension = tab.key;
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('dimension', dimension);
    router.push(`?${params.toString()}`);
    
    setSelectedTab(dimension);
  };

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
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>
      </TabGroup>
    </div>
  );
} 