'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { format, subDays, subHours, subMonths, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateRangeOption {
  label: string;
  getValue: () => { start: Date; end: Date };
}

interface DateRangeSelectorProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPredefinedRange, setIsPredefinedRange] = useState(true);
  
  // Time selection states
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("23");
  const [endMinute, setEndMinute] = useState("59");

  // Generate hours and minutes for dropdowns
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Predefined date ranges
  const dateRangeOptions: DateRangeOption[] = [
    {
      label: 'Last Hour',
      getValue: () => ({
        start: subHours(new Date(), 1),
        end: new Date(),
      }),
    },
    {
      label: 'Last 24 hours',
      getValue: () => ({
        start: subHours(new Date(), 24),
        end: new Date(),
      }),
    },
    {
      label: 'Last 7 days',
      getValue: () => ({
        start: subDays(new Date(), 7),
        end: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        start: subDays(new Date(), 30),
        end: new Date(),
      }),
    },
    {
      label: 'Last 6 months',
      getValue: () => ({
        start: subMonths(new Date(), 6),
        end: new Date(),
      }),
    },
    {
      label: 'Last 12 months',
      getValue: () => ({
        start: subMonths(new Date(), 12),
        end: new Date(),
      }),
    },
  ];

  // Initialize from URL params
  useEffect(() => {
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (start_date && end_date) {
      const startDate = parseDate(start_date);
      const endDate = parseDate(end_date);
      
      if (startDate && endDate) {
        setDateRange({ start: startDate, end: endDate });
        
        // Extract time components
        const startTimeParts = start_date.includes(' ') 
          ? start_date.split(' ')[1].split(':') 
          : start_date.includes('T') 
            ? start_date.split('T')[1].split(':') 
            : ['00', '00'];
        
        const endTimeParts = end_date.includes(' ') 
          ? end_date.split(' ')[1].split(':') 
          : end_date.includes('T') 
            ? end_date.split('T')[1].split(':') 
            : ['23', '59'];
        
        setStartHour(startTimeParts[0] || '00');
        setStartMinute(startTimeParts[1] || '00');
        setEndHour(endTimeParts[0] || '23');
        setEndMinute(endTimeParts[1] || '59');
        
        // Check if it matches any predefined range
        const matchingOption = dateRangeOptions.find(option => {
          const { start, end } = option.getValue();
          // Compare dates with some tolerance for seconds
          const startDiff = Math.abs(startDate.getTime() - start.getTime());
          const endDiff = Math.abs(endDate.getTime() - end.getTime());
          // Allow for a 2-minute difference to account for slight timing variations
          return startDiff < 120000 && endDiff < 120000;
        });

        if (matchingOption) {
          // Use the predefined label
          setSelectedRange(matchingOption.label);
          setIsPredefinedRange(true);
        } else {
          // Use the date format for custom ranges
          setSelectedRange(`${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`);
          setIsPredefinedRange(false);
        }
      }
    } else {
      // Default to last 30 days if no date params
      const option = dateRangeOptions.find(opt => opt.label === 'Last 30 days');
      if (option) {
        const { start, end } = option.getValue();
        setDateRange({ start, end });
        setSelectedRange('Last 30 days'); // Use the predefined label
        setIsPredefinedRange(true);
        
        // Set default time values
        setStartHour(format(start, 'HH'));
        setStartMinute(format(start, 'mm'));
        setEndHour(format(end, 'HH'));
        setEndMinute(format(end, 'mm'));
        
        updateUrlParams(start, end);
      }
    }
  });

  // Helper function to parse date strings
  const parseDate = (dateStr: string): Date | null => {
    // Try different formats, with the primary format first
    const formats = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd\'T\'HH:mm:ss', 'yyyy-MM-dd HH:mm', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];
    
    for (const fmt of formats) {
      const date = parse(dateStr, fmt, new Date());
      if (isValid(date)) return date;
    }
    
    return null;
  };

  // Update URL params when date range changes
  const updateUrlParams = (start: Date | null, end: Date | null) => {
    if (!start || !end) return;

    // Format with time
    let startWithTime, endWithTime;
    
    if (isPredefinedRange) {
      // For predefined ranges, use the dates as they are
      startWithTime = start;
      endWithTime = end;
    } else {
      // For custom ranges, apply the selected time
      startWithTime = new Date(start);
      startWithTime.setHours(parseInt(startHour), parseInt(startMinute));
      
      endWithTime = new Date(end);
      endWithTime.setHours(parseInt(endHour), parseInt(endMinute));
    }
    
    // Format dates for URL parameters with the correct format: yyyy-MM-dd HH:mm:ss
    const startDateStr = format(startWithTime, 'yyyy-MM-dd HH:mm:ss');
    const endDateStr = format(endWithTime, 'yyyy-MM-dd HH:mm:ss');
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('start_date', startDateStr);
    params.set('end_date', endDateStr);
    
    // Use router.replace to avoid adding to browser history
    router.replace(`?${params.toString()}`, { scroll: false });
    
    // Notify parent component about the date change
    if (onDateRangeChange) {
      onDateRangeChange(startDateStr, endDateStr);
    }
  };

  // Handle predefined range selection
  const handleRangeSelect = (option: DateRangeOption) => {
    const { start, end } = option.getValue();
    setDateRange({ start, end });
    setSelectedRange(option.label); // Use the predefined label (e.g., "Last 30 days")
    setIsPredefinedRange(true);
    
    // Update time values
    setStartHour(format(start, 'HH'));
    setStartMinute(format(start, 'mm'));
    setEndHour(format(end, 'HH'));
    setEndMinute(format(end, 'mm'));
    
    updateUrlParams(start, end);
    setIsOpen(false);
  };

  // Handle calendar date selection
  const handleCalendarSelect = (range: { from: Date | undefined; to?: Date | undefined }) => {
    if (!range.from) return;
    
    const start = range.from;
    const end = range.to || range.from;
    
    setDateRange({ start, end });
    // Format as "Jan 1 - Jan 15" for custom date ranges
    setSelectedRange(`${format(start, 'MMM d')} - ${format(end, 'MMM d')}`);
    setIsPredefinedRange(false);
    
    // Don't close the calendar or update URL params yet
    // Wait for the Apply button to be clicked
  };

  // Handle time change
  const handleTimeChange = () => {
    if (!dateRange.start || !dateRange.end) return;
    
    updateUrlParams(dateRange.start, dateRange.end);
    setCalendarOpen(false); // Only close the calendar when Apply is clicked
  };

  return (
    <div className="flex items-center">
      {isPredefinedRange ? (
        // Predefined range layout - Text with chevron on left, calendar on right
        <>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md rounded-r-none px-3 py-2 h-10",
                  "transition-all duration-200 ease-in-out"
                )}
              >
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium">
                  {selectedRange || 'Select date range'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md transition-all duration-200 ease-in-out">
              <div className="space-y-1 p-2">
                {dateRangeOptions.map((option) => (
                  <div
                    key={option.label}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 ease-in-out"
                    onClick={() => handleRangeSelect(option)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-l-0 rounded-l-none rounded-r-md px-2 h-10",
                  "transition-all duration-200 ease-in-out"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md transition-all duration-200 ease-in-out">
              <div className="p-0">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.start || undefined,
                    to: dateRange.end || undefined,
                  }}
                  onSelect={(range) => {
                    if (range) handleCalendarSelect(range);
                  }}
                  className="rounded-md border-0"
                  initialFocus
                />
                
                {/* Time selection */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start Time</Label>
                      <div className="flex gap-1">
                        <Select value={startHour} onValueChange={setStartHour}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {hours.map(hour => (
                              <SelectItem key={`start-hour-${hour}`} value={hour}>{hour}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={startMinute} onValueChange={setStartMinute}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {minutes.map(minute => (
                              <SelectItem key={`start-min-${minute}`} value={minute}>{minute}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End Time</Label>
                      <div className="flex gap-1">
                        <Select value={endHour} onValueChange={setEndHour}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {hours.map(hour => (
                              <SelectItem key={`end-hour-${hour}`} value={hour}>{hour}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={endMinute} onValueChange={setEndMinute}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {minutes.map(minute => (
                              <SelectItem key={`end-min-${minute}`} value={minute}>{minute}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-3 transition-colors duration-150 ease-in-out" 
                    onClick={handleTimeChange}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        // Custom range layout - Chevron on left, calendar on right
        <>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md rounded-r-none px-2 h-10",
                  "transition-all duration-200 ease-in-out"
                )}
              >
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md transition-all duration-200 ease-in-out">
              <div className="space-y-1 p-2">
                {dateRangeOptions.map((option) => (
                  <div
                    key={option.label}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 ease-in-out"
                    onClick={() => handleRangeSelect(option)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-l-0 rounded-l-none rounded-r-md px-3 py-2 h-10",
                  "transition-all duration-200 ease-in-out"
                )}
              >
                <span className="text-sm font-medium">
                  {selectedRange || 'Select date range'}
                </span>
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md transition-all duration-200 ease-in-out">
              <div className="p-0">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.start || undefined,
                    to: dateRange.end || undefined,
                  }}
                  onSelect={(range) => {
                    if (range) handleCalendarSelect(range);
                  }}
                  className="rounded-md border-0"
                  initialFocus
                />
                
                {/* Time selection */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start Time</Label>
                      <div className="flex gap-1">
                        <Select value={startHour} onValueChange={setStartHour}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {hours.map(hour => (
                              <SelectItem key={`start-hour-${hour}`} value={hour}>{hour}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={startMinute} onValueChange={setStartMinute}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {minutes.map(minute => (
                              <SelectItem key={`start-min-${minute}`} value={minute}>{minute}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End Time</Label>
                      <div className="flex gap-1">
                        <Select value={endHour} onValueChange={setEndHour}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {hours.map(hour => (
                              <SelectItem key={`end-hour-${hour}`} value={hour}>{hour}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={endMinute} onValueChange={setEndMinute}>
                          <SelectTrigger className="w-full transition-colors duration-150 ease-in-out">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="transition-opacity duration-150 ease-in-out">
                            {minutes.map(minute => (
                              <SelectItem key={`end-min-${minute}`} value={minute}>{minute}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-3 transition-colors duration-150 ease-in-out" 
                    onClick={handleTimeChange}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
} 