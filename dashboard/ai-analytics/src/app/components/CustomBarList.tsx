'use client';

import { Card } from '@tremor/react';
import { useState, useMemo, useEffect } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Check } from 'lucide-react';

interface BarListItem {
  name: string;
  value: number;
  icon?: React.ReactNode;
}

interface CustomBarListProps {
  data: BarListItem[];
  valueFormatter?: (value: number) => string;
  onSelectionChange?: (selectedItems: string[]) => void;
  initialSelectedItems?: string[];
}

const defaultFormatter = (number: number) =>
  `${Intl.NumberFormat('us').format(number).toString()}`;

export default function CustomBarList({
  data,
  valueFormatter = defaultFormatter,
  onSelectionChange,
  initialSelectedItems = []
}: CustomBarListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems);

  // Update selected items when initialSelectedItems changes
  useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  // Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => 
      item.name.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Calculate total value for header
  const totalValue = useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );
  const hasMoreItems = data.length > 5;

  const handleBarClick = (itemName: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName];
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Custom bar rendering with icons and improved styling
  const renderCustomBarList = (items: BarListItem[]) => (
    <div className="mt-4">
      {items.map((item) => {
        // Calculate percentage for bar width (max 92% to leave room for text)
        const maxValue = Math.max(...items.map(i => i.value));
        const percentage = maxValue > 0 ? (item.value / maxValue) * 92 : 0;
        const isSelected = selectedItems.includes(item.name);
        
        return (
          <div 
            key={item.name} 
            className={`flex flex-col cursor-pointer py-2 transition-all duration-200 hover:bg-tremor-brand-subtle dark:hover:bg-dark-tremor-brand-subtle`}
            onClick={() => handleBarClick(item.name)}
          >
            <div className="flex items-center w-full py-1">
              <div className="flex items-center min-w-0 flex-1">
                {item.icon && (
                  <div className="mr-2.5 flex-shrink-0 color-[#C6C6C6]">
                    {item.icon}
                  </div>
                )}
                <p className="truncate small-font" style={{ fontFamily: 'var(--font-family-base)' }}>
                  {item.name}
                </p>
                {isSelected && (
                  <Check className="ml-2 h-4 w-4 text-[var(--accent)]" />
                )}
              </div>
              <p className="flex-shrink-0 text-right small-font">
                {valueFormatter(item.value)}
              </p>
            </div>
            <div className="w-full h-1.5 bg-tremor-brand-emphasis dark:bg-dark-tremor-brand-emphasis overflow-hidden">
              <div 
                className="h-full bg-[var(--accent)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Card 
        className="h-full w-full rounded-lg shadow-none p-4" 
        style={{ boxShadow: 'none' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h3 className="small-font" style={{ fontFamily: 'var(--font-family-base)' }}>Cost Breakdown</h3>
            {selectedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                {selectedItems.length} selected
              </span>
            )}
          </div>
          <p className="text-tremor-metric">
            {valueFormatter(totalValue)}
          </p>
        </div>
        
        {renderCustomBarList(data.slice(0, 5))}
        
        {hasMoreItems && (
          <div className="mt-4 pt-2 pb-4 flex justify-center">
            <button
              className="group flex h-[48px] items-center justify-center gap-2 py-[14px] px-4 bg-transparent hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-white border border-white default-font"
              onClick={() => setIsOpen(true)}
            >
              View All ({data.length})
              {selectedItems.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                  {selectedItems.length} selected
                </span>
              )}
            </button>
          </div>
        )}
        
        <Dialog
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSearchQuery(''); // Clear search when closing
          }}
          static={true}
          className="z-[100]"
        >
          <div className="fixed inset-0 bg-[#0A0A0A] bg-opacity-80" />
          <DialogPanel className="!bg-[#262626] flex flex-col relative z-10 rounded-none p-0" style={{ width: '575px', minWidth: '575px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-0">
              <div className="flex items-center">
                <h2 className="title-font">All Items</h2>
                {selectedItems.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                    {selectedItems.length} selected
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery(''); // Clear search when closing
                }}
                className="settings-button"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 pt-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // The search is already handled by the filteredItems logic
                      // No need for additional action
                    }
                  }}
                  placeholder="Search items..."
                  className="w-full h-[48px] px-4 pr-12 py-2 bg-[#353535] focus:outline-none focus:ring-1 focus:ring-white placeholder:text-[#8D8D8D] text-[#F4F4F4] placeholder:text-sm font-['Roboto']"
                />
                <button 
                  onClick={() => {
                    // The search is already handled by the filteredItems logic
                    // No need for additional action
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C6C6C6] hover:text-white transition-colors"
                >
                  <RiSearchLine className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 h-[400px] overflow-y-auto">
                {filteredItems.length > 0 ? (
                  renderCustomBarList(filteredItems)
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#C6C6C6] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-[#C6C6C6]">No results found for &quot;{searchQuery}&quot;</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-sm text-[var(--accent)] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </Card>
    </>
  );
} 