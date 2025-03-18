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

  // Custom bar rendering with icons
  const renderCustomBarList = (items: BarListItem[]) => (
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        // Calculate percentage for bar width (max 92% to leave room for text)
        const maxValue = Math.max(...items.map(i => i.value));
        const percentage = maxValue > 0 ? (item.value / maxValue) * 92 : 0;
        
        return (
          <div 
            key={item.name} 
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors"
            onClick={() => handleBarClick(item.name)}
          >
            <div className="flex items-center w-full">
              <div className="flex items-center min-w-0 flex-1">
                {item.icon && (
                  <div className="mr-2 flex-shrink-0">
                    {item.icon}
                  </div>
                )}
                <p className="truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  {item.name}
                </p>
              </div>
              <p className="ml-2 flex-shrink-0 text-right text-tremor-default text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                {valueFormatter(item.value)}
              </p>
            </div>
            <div className="w-full h-1 mt-1">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
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
      <Card className="h-full w-full rounded-none border-0" style={{ boxShadow: '-1px 0 0 0 rgb(55 65 81)' }}>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {valueFormatter(totalValue)}
        </p>
        {renderCustomBarList(data.slice(0, 5))}
        {hasMoreItems && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background">
            <button
              className="flex items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background px-2.5 py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
              onClick={() => setIsOpen(true)}
            >
              Show more
            </button>
          </div>
        )}
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          static={true}
          className="z-[100]"
        >
          <DialogPanel className="overflow-hidden p-0">
            <div className="px-6 pb-4 pt-6">
              <TextInput
                icon={RiSearchLine}
                placeholder="Search..."
                className="rounded-tremor-small"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <div className="flex items-center justify-between pt-4">
                <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  Name
                </p>
                <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                  Cost
                </p>
              </div>
            </div>
            <div className="h-96 overflow-y-scroll px-6">
              {filteredItems.length > 0 ? (
                renderCustomBarList(filteredItems)
              ) : (
                <p className="flex h-full items-center justify-center text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  No results.
                </p>
              )}
            </div>
            <div className="mt-4 border-t border-tremor-border bg-tremor-background-muted p-6 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
              <button
                className="flex w-full items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
                onClick={() => setIsOpen(false)}
              >
                Go back
              </button>
            </div>
          </DialogPanel>
        </Dialog>
      </Card>
    </>
  );
} 