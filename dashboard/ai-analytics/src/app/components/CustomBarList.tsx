'use client';

import { Card } from '@tremor/react';
import { useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { Dialog, DialogPanel, TextInput } from '@tremor/react';

interface BarListItem {
  name: string;
  value: number;
  icon?: React.ReactNode;
}

interface CustomBarListProps {
  data: BarListItem[];
  valueFormatter?: (value: number) => string;
  onSelectionChange?: (selectedItems: string[]) => void;
}

const defaultFormatter = (number: number) =>
  `${Intl.NumberFormat('us').format(number).toString()}`;

export default function CustomBarList({
  data,
  valueFormatter = defaultFormatter,
  onSelectionChange
}: CustomBarListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate total value for header
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
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
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        // Calculate percentage for bar width (max 92% to leave room for text)
        const maxValue = Math.max(...items.map(i => i.value));
        const percentage = maxValue > 0 ? (item.value / maxValue) * 92 : 0;
        const isSelected = selectedItems.includes(item.name);
        
        return (
          <div 
            key={item.name} 
            className={`flex flex-col cursor-pointer p-2 rounded-lg transition-all duration-200 ${
              isSelected 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
            }`}
            onClick={() => handleBarClick(item.name)}
          >
            <div className="flex items-center w-full mb-1.5">
              <div className="flex items-center min-w-0 flex-1">
                {item.icon && (
                  <div className="mr-2.5 flex-shrink-0">
                    {item.icon}
                  </div>
                )}
                <p className={`truncate text-sm font-medium ${
                  isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.name}
                </p>
              </div>
              <p className={`ml-2 flex-shrink-0 text-right text-sm font-semibold ${
                isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {valueFormatter(item.value)}
              </p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  isSelected ? 'bg-indigo-500' : 'bg-indigo-400'
                }`}
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
      <Card className="h-full w-full rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Breakdown</h3>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {valueFormatter(totalValue)}
          </p>
        </div>
        
        {renderCustomBarList(data.slice(0, 5))}
        
        {hasMoreItems && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <button
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              View All ({data.length})
            </button>
          </div>
        )}
        
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          static={true}
          className="z-[100]"
        >
          <DialogPanel className="max-w-md overflow-hidden rounded-lg">
            <div className="px-6 pb-4 pt-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Items</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <TextInput
                icon={RiSearchLine}
                placeholder="Search items..."
                className="rounded-md"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            </div>
            
            <div className="h-96 overflow-y-auto px-6 py-4">
              {filteredItems.length > 0 ? (
                renderCustomBarList(filteredItems)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </DialogPanel>
        </Dialog>
      </Card>
    </>
  );
} 