'use client';

import TopBar from './components/TopBar';
import TimeseriesChartContainer from './containers/TimeseriesChartContainer';
import MetricsCards from './components/MetricsCards';
import DataTable from './components/DataTable';
import TabbedPane from './components/TabbedPane';
import { useState } from 'react';

interface Selection {
  dimension: string;
  dimensionName: string;
  values: string[];
}

export default function Dashboard() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Selection[]>([]);

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

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <TopBar
        selections={selections}
        onRemoveFilter={handleRemoveFilter}
      />
      
      <main className="flex-1 grid grid-rows-[60%_40%]">
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          <div className="border-b border-r border-gray-700">
            <TimeseriesChartContainer filters={filters} />
          </div>
          <div className="border-b border-gray-700">
            <MetricsCards filters={filters} />
          </div>
        </div>
        
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          <div className="border-r border-gray-700">
            <DataTable filters={filters} />
          </div>
          <div className="border-none border-gray-700">
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