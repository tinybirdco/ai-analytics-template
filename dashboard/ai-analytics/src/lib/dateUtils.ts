// Helper function to format date
export const formatDate = (date: Date): string => {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Helper function to get last day of month
const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// Helper function to get first day of quarter
const getFirstDayOfQuarter = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
};

// Helper function to get last day of quarter
const getLastDayOfQuarter = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
};

// Map spelled-out numbers to digits
const numberMap: { [key: string]: number } = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  'eighty': 80, 'ninety': 90, 'hundred': 100
};

// Extract number from string (e.g., "3 months" -> 3, "three months" -> 3)
const extractNumber = (str: string): number => {
  // First try to find a numeric value
  const numericMatch = str.match(/(\d+)/);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }

  // Then try to find spelled-out numbers
  const words = str.split(/\s+/);
  for (const word of words) {
    if (word in numberMap) {
      return numberMap[word];
    }
  }

  // If no number found, default to 1
  return 1;
};

export function extractDatesFromQuery(query: string): { start_date: string; end_date: string } {
  const now = new Date();
  const queryLower = query.toLowerCase();

  // Handle relative time expressions
  if (queryLower.includes('last')) {
    if (queryLower.includes('week')) {
      const weeks = extractNumber(queryLower);
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - (weeks * 7));
      return { start_date: formatDate(startDate), end_date: formatDate(now) };
    }
    if (queryLower.includes('month')) {
      const months = extractNumber(queryLower);
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - months);
      return { start_date: formatDate(startDate), end_date: formatDate(now) };
    }
    if (queryLower.includes('year')) {
      const years = extractNumber(queryLower);
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - years);
      return { start_date: formatDate(startDate), end_date: formatDate(now) };
    }
    if (queryLower.includes('day')) {
      const days = extractNumber(queryLower);
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
      return { start_date: formatDate(startDate), end_date: formatDate(now) };
    }
  }

  // Handle specific time ranges
  if (queryLower.includes('from') || queryLower.includes('between')) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const startMonth = months.findIndex(month => queryLower.includes(month));
    const endMonth = months.findIndex(month => queryLower.includes(month), startMonth + 1);
    
    if (startMonth !== -1 && endMonth !== -1) {
      const startDate = new Date(now.getFullYear(), startMonth, 1);
      const endDate = new Date(now.getFullYear(), endMonth + 1, 0);
      return { start_date: formatDate(startDate), end_date: formatDate(endDate) };
    }
  }

  // Handle quarters
  if (queryLower.includes('q1') || queryLower.includes('quarter 1')) {
    return { start_date: formatDate(new Date(now.getFullYear(), 0, 1)), end_date: formatDate(new Date(now.getFullYear(), 2, 31)) };
  }
  if (queryLower.includes('q2') || queryLower.includes('quarter 2')) {
    return { start_date: formatDate(new Date(now.getFullYear(), 3, 1)), end_date: formatDate(new Date(now.getFullYear(), 5, 30)) };
  }
  if (queryLower.includes('q3') || queryLower.includes('quarter 3')) {
    return { start_date: formatDate(new Date(now.getFullYear(), 6, 1)), end_date: formatDate(new Date(now.getFullYear(), 8, 30)) };
  }
  if (queryLower.includes('q4') || queryLower.includes('quarter 4')) {
    return { start_date: formatDate(new Date(now.getFullYear(), 9, 1)), end_date: formatDate(new Date(now.getFullYear(), 11, 31)) };
  }

  // Handle future predictions
  if (queryLower.includes('next')) {
    if (queryLower.includes('month')) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start_date: formatDate(nextMonth), end_date: formatDate(getLastDayOfMonth(nextMonth)) };
    }
    if (queryLower.includes('quarter')) {
      const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, 1);
      return { start_date: formatDate(getFirstDayOfQuarter(nextQuarter)), end_date: formatDate(getLastDayOfQuarter(nextQuarter)) };
    }
    if (queryLower.includes('year')) {
      const nextYear = new Date(now.getFullYear() + 1, 0, 1);
      return { start_date: formatDate(nextYear), end_date: formatDate(new Date(now.getFullYear() + 1, 11, 31)) };
    }
  }

  // Default to last month if no specific time expression is found
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - 1);
  return { start_date: formatDate(startDate), end_date: formatDate(now) };
} 