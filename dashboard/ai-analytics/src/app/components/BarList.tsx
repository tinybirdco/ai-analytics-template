'use client';

import { useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { BarList as TremorBarList, Card, Dialog, DialogPanel, TextInput } from '@tremor/react';

interface BarListItem {
  name: string;
  value: number;
}

interface BarListProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  valueFormatter?: (value: number) => string;
  onSelectionChange?: (selectedItems: string[]) => void;
}

const defaultFormatter = (number: number) =>
  `${Intl.NumberFormat('us').format(number).toString()}`;

export default function BarList({ 
  data, 
  valueFormatter = defaultFormatter,
  onSelectionChange
}: BarListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const renderBarList = (items: BarListItem[]) => (
    <TremorBarList<BarListItem>
      data={items}
      valueFormatter={valueFormatter}
      className="mt-4"
      onValueChange={(item: BarListItem) => handleBarClick(item.name)}
    />
  );

  return (
    <>
      <Card className="h-full w-full rounded-none border-0" style={{ boxShadow: '-1px 0 0 0 rgb(55 65 81)' }}>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Total
        </p>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {valueFormatter(totalValue)}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            
          </p>
          <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
            Count
          </p>
        </div>
        {renderBarList(data.slice(0, 5))}
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
                  Count
                </p>
              </div>
            </div>
            <div className="h-96 overflow-y-scroll px-6">
              {filteredItems.length > 0 ? (
                renderBarList(filteredItems)
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