'use client';

import TopBar from './components/TopBar';
import TimeseriesChartContainer from './containers/TimeseriesChartContainer';
import MetricsCards from './components/MetricsCards';
import DataTable from './components/DataTable';
import TabbedPane from './components/TabbedPane';
import { useState } from 'react';
import { useFilters } from '@/hooks/useTinybirdData';

interface Selection {
  dimension: string;
  dimensionName: string;
  values: string[];
}

export default function Dashboard() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const setFilters = useFilters((state) => state.setFilters);

  const handleFilterUpdate = (dimension: string, dimensionName: string, values: string[]) => {
    setSelections(prev => {
      const otherSelections = prev.filter(s => s.dimension !== dimension);
      const newSelections = values.length > 0 
        ? [...otherSelections, { dimension, dimensionName, values }]
        : otherSelections;

      // Update global filters using the new selections
      const newFilters = newSelections.reduce((acc, { dimension, values }) => ({
        ...acc,
        [dimension]: values.join(',')
      }), {});

      setFilters(newFilters);
      return newSelections;
    });
  };

  const handleRemoveFilter = (dimension: string, value: string) => {
    setSelections(prev => {
      const newSelections = prev.map(selection => {
        if (selection.dimension === dimension) {
          const newValues = selection.values.filter(v => v !== value);
          if (newValues.length === 0) {
            return null;
          }
          return {
            ...selection,
            values: newValues
          };
        }
        return selection;
      }).filter((s): s is Selection => s !== null);

      // Update global filters immediately
      const newFilters = newSelections.reduce((acc, { dimension, values }) => ({
        ...acc,
        [dimension]: values.join(',')
      }), {});

      // Update filters first
      setFilters(newFilters);

      // Then update URL
      const params = new URLSearchParams(window.location.search);
      if (newSelections.length === 0) {
        params.delete(dimension);
      } else {
        const selection = newSelections.find(s => s.dimension === dimension);
        if (selection) {
          params.set(dimension, selection.values.join(','));
        } else {
          params.delete(dimension);
        }
      }
      window.history.replaceState({}, '', `?${params.toString()}`);

      return newSelections;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <TopBar
        selections={selections}
        onRemoveFilter={handleRemoveFilter}
      />
      
      <main className="flex-1 grid grid-rows-[60%_40%]">
        {/* Upper Section - 60% height */}
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          {/* Timeseries Chart */}
          <div className=" border-b border-r border-gray-700">
            <TimeseriesChartContainer />
          </div>
          
          {/* Metrics Cards */}
          <div className="border-b border-gray-700">
            <MetricsCards />
          </div>
        </div>
        
        {/* Lower Section - 40% height */}
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          {/* Data Table with Search */}
          <div className="border-r border-gray-700">
            <DataTable />
          </div>
          
          {/* Tabbed Pane */}
          <div className="border-none border-gray-700">
            <TabbedPane onFilterUpdate={handleFilterUpdate} />
          </div>
        </div>
      </main>
    </div>
  );
}