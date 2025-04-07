'use client';

import TopBar from './components/TopBar';
import TimeseriesChartContainer from './containers/TimeseriesChartContainer';
import MetricsCards from './components/MetricsCards';
import DataTableContainer from './containers/DataTableContainer';
import TabbedPane from './components/TabbedPane';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { tabs } from './constants';
import { useLLMUsage } from '@/hooks/useTinybirdData';
import ResizableSplitView from './components/ResizableSplitView';

interface Selection {
  dimension: string;
  dimensionName: string;
  values: string[];
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [filters, setFilters] = useState<Record<string, string | undefined>>({
    column_name: 'model'  // Set default column_name
  });
  const [selections, setSelections] = useState<Selection[]>([]);
  const searchParams = useSearchParams();
  
  // Shared LLM usage data
  const { data: llmData, isLoading } = useLLMUsage(filters);

  // Initialize from URL only once
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newSelections: Selection[] = [];
    const newFilters: Record<string, string> = {
      column_name: 'model'
    };

    // Check for user filter first
    const userFilter = params.get('user');
    if (userFilter) {
      // If user filter is active, set the user filter with the actual hash value
      newFilters.user = userFilter;
    }
    
    // Get column_name from URL if present (override default)
    const columnName = params.get('column_name');
    if (columnName) {
      newFilters.column_name = columnName;
    }
    
    // Add date range parameters to filters
    const startDate = params.get('start_date');
    const endDate = params.get('end_date');
    if (startDate) newFilters.start_date = startDate;
    if (endDate) newFilters.end_date = endDate;
    
    // Check each possible dimension from tabs
    tabs.forEach(tab => {
      const values = params.get(tab.key)?.split(',') || [];
      if (values.length > 0) {
        newSelections.push({
          dimension: tab.key,
          dimensionName: tab.name,
          values
        });
        newFilters[tab.key] = values.join(',');
      }
    });

    setSelections(newSelections);
    setFilters(newFilters);
  }, [searchParams]); // This should run whenever searchParams changes

  const handleFilterUpdate = (dimension: string, dimensionName: string, values: string[]) => {
    setSelections(prev => {
      const otherSelections = prev.filter(s => s.dimension !== dimension);
      return values.length > 0 
        ? [...otherSelections, { dimension, dimensionName, values }]
        : otherSelections;
    });

    setFilters(prev => {
      const newFilters = { ...prev };
      if (values.length > 0) {
        newFilters[dimension] = values.join(',');
      } else {
        delete newFilters[dimension];
      }
      return newFilters;
    });
  };

  const handleRemoveFilter = (dimension: string, value: string) => {
    setSelections(prev => {
      const newSelections = prev.map(selection => {
        if (selection.dimension === dimension) {
          const newValues = selection.values.filter(v => v !== value);
          if (newValues.length === 0) return null;
          return { ...selection, values: newValues };
        }
        return selection;
      }).filter((s): s is Selection => s !== null);

      setFilters(prev => {
        const newFilters = { ...prev };
        const selection = newSelections.find(s => s.dimension === dimension);
        if (selection) {
          newFilters[dimension] = selection.values.join(',');
        } else {
          delete newFilters[dimension];
        }
        return newFilters;
      });

      return newSelections;
    });
  };

  const handleTimeseriesFilterChange = (newFilters: Record<string, string | undefined>) => {
    // Preserve the user filter if it exists in the current filters
    if (filters.user) {
      newFilters.user = filters.user;
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="h-screen flex flex-col text-white">
      <TopBar
        selections={selections}
        onRemoveFilter={handleRemoveFilter}
      />
      
      <main className="flex-1 flex min-h-0">
        {/* Main Content - 2/3 width */}
        <div className="w-2/3 flex flex-col min-h-0">
          <div className="flex-1 w-full min-h-0 h-[calc(100vh-200px)]">
            <ResizableSplitView
              topComponent={
                <TimeseriesChartContainer 
                  filters={filters}
                  onFiltersChange={handleTimeseriesFilterChange}
                  data={llmData}
                  isLoading={isLoading}
                />
              }
              bottomComponent={
                <DataTableContainer 
                  isLoading={isLoading}
                  filters={filters} 
                />
              }
              initialTopHeight="60vh"
              minTopHeight="30vh"
              minBottomHeight="20vh"
            />
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="w-1/3 overflow-auto">
          <div className="mb-4">
            <MetricsCards 
              data={llmData} 
              isLoading={isLoading} 
            />
          </div>
          <div className="h-[calc(100vh-400px)]">
            <TabbedPane 
              filters={filters}
              onFilterUpdate={handleFilterUpdate} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}