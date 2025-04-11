'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { format, subDays, subHours, subMonths, parse, isValid } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarIcon } from './icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTrackEvent } from '@/hooks/useTrackEvent';

interface DateRangeOption {
  label: string;
  getValue: () => { start: Date; end: Date };
}

interface DateRangeSelectorProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const track = useTrackEvent();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use refs for the popover triggers
  const rangePopoverTriggerRef = useRef<HTMLButtonElement>(null);
  const calendarPopoverTriggerRef = useRef<HTMLButtonElement>(null);
  
  // State for popover open/close
  const [isOpen, setIsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Other state
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isPredefinedRange, setIsPredefinedRange] = useState(true);
  
  // Time selection states
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("23");
  const [endMinute, setEndMinute] = useState("59");
  
  // Track if we've already initialized from URL
  const initializedRef = useRef(false);

  // Predefined date ranges - memoize to prevent recreation
  const dateRangeOptions = useMemo<DateRangeOption[]>(() => [
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
  ], []);

  // Helper function to parse date strings - memoize to prevent recreation
  const parseDate = useCallback((dateStr: string): Date | null => {
    const formats = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd\'T\'HH:mm:ss', 'yyyy-MM-dd HH:mm', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];
    
    for (const fmt of formats) {
      const date = parse(dateStr, fmt, new Date());
      if (isValid(date)) return date;
    }
    
    return null;
  }, []);

  // Initialize from URL params - add dependency array and use ref to prevent multiple runs
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
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
  }, [searchParams, dateRangeOptions, parseDate]);

  // Update URL params when date range changes - memoize to prevent recreation
  const updateUrlParams = useCallback((start: Date | null, end: Date | null) => {
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
  }, [router, searchParams, isPredefinedRange, startHour, startMinute, endHour, endMinute, onDateRangeChange]);

  // Handle predefined range selection - memoize to prevent recreation
  const handleRangeSelect = useCallback((option: DateRangeOption) => {
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

    track("set_date_range", {
      from: start.toISOString(),
      to: end.toISOString(),
    });
  }, [updateUrlParams]);

  // Handle calendar date selection - memoize to prevent recreation
  const handleCalendarSelect = useCallback((range: { from: Date | undefined; to?: Date | undefined }) => {
    if (!range.from) return;
    
    const start = range.from;
    const end = range.to || range.from;
    
    setDateRange({ start, end });
    // Format as "Jan 1 - Jan 15" for custom date ranges
    setSelectedRange(`${format(start, 'MMM d')} - ${format(end, 'MMM d')}`);
    setIsPredefinedRange(false);
  }, []);

  // Handle calendar popover close
  const handleCalendarPopoverOpenChange = useCallback((open: boolean) => {
    setCalendarOpen(open);
    if (!open && dateRange.start && dateRange.end) {
      updateUrlParams(dateRange.start, dateRange.end);
    }
  }, [dateRange, updateUrlParams]);

  // Memoize the open/close handlers to prevent recreation
  const handleRangePopoverOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <div className={`date-range-selector ${isOpen || calendarOpen ? 'ring-1 ring-white' : ''}`}>
      <div className="date-range-content">
        {/* Calendar Icon and Popover */}
        <Popover open={calendarOpen} onOpenChange={handleCalendarPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button 
              ref={calendarPopoverTriggerRef}
              variant="ghost" 
              className="p-0 h-auto"
            >
              <CalendarIcon opacity={isOpen ? 0.5 : 1} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[288px] p-0 bg-[#353535] default-font border-0 rounded-none" align="start" sideOffset={22} alignOffset={-16}>
            <div>
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.start || undefined,
                  to: dateRange.end || undefined,
                }}
                onSelect={(range) => {
                  if (range) handleCalendarSelect(range);
                }}
                className="border-0"
                classNames={{
                  months: "space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "flex items-center",
                  nav_button: "h-4 w-4 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-white flex-1 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#4CAF50] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "w-full h-9 p-0 font-normal aria-selected:opacity-100 relative hover:bg-[#3D3D3D] transition-colors",
                  day_range_start: "bg-[var(--accent)] text-[#0A0A0A] hover:bg-[var(--accent)] hover:text-[#0A0A0A] focus:bg-[var(--accent)] focus:text-[#0A0A0A]",
                  day_range_end: "bg-[var(--accent)] text-[#0A0A0A] hover:bg-[var(--accent)] hover:text-[#0A0A0A] focus:bg-[var(--accent)] focus:text-[#0A0A0A]",
                  day_selected: "bg-[var(--accent)] text-[#0A0A0A] hover:bg-[var(--accent)] hover:text-[#0A0A0A] focus:bg-[var(--accent)] focus:text-[#0A0A0A]",
                  day_today: "text-[var(--accent)] after:absolute after:content-[''] after:w-1 after:h-1 after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--accent)] after:rounded-none",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-[#267A52] aria-selected:text-[#F4F4F4]",
                  day_hidden: "invisible",
                }}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Text */}
        <span 
          className="date-range-text flex-grow cursor-pointer"
          onClick={() => {
            if (isPredefinedRange) {
              setIsOpen(true);
              setCalendarOpen(false);
            } else {
              setCalendarOpen(true);
              setIsOpen(false);
            }
          }}
        >
          {selectedRange || 'Select date range'}
        </span>

        {/* Chevron and Predefined Ranges Popover */}
        <Popover open={isOpen} onOpenChange={handleRangePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button 
              ref={rangePopoverTriggerRef}
              variant="ghost" 
              className="p-0 h-auto"
            >
              {isOpen ? (
                <ChevronUp className={`h-4 w-4 ${calendarOpen ? 'opacity-50' : ''}`} />
              ) : (
                <ChevronDown className={`h-4 w-4 ${calendarOpen ? 'opacity-50' : ''}`} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="min-w-[288px] pt-1 bg-[#353535] border-0 rounded-none p-0"
            align="start"
            alignOffset={-256}
            sideOffset={22}
          >
            <div>
              {dateRangeOptions.map((option) => (
                <div
                  key={option.label}
                  className={`cursor-pointer dropdown-font hover:text-white hover:bg-[#3D3D3D] transition-colors duration-150 ease-in-out ${
                    selectedRange === option.label ? '!text-white bg-[#3D3D3D]' : 'text-[#C6C6C6]'
                  }`}
                  onClick={() => handleRangeSelect(option)}
                >
                  <span className="block px-4 py-4">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 