// src/app/api/extract-cost-parameters/route.ts
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { fetchAvailableDimensions } from '@/lib/dimensions';


// Format today's date with time in yyyy-MM-dd HH:mm:ss format
const formatDate = (date: Date): string => {
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() is 0-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const today = formatDate(new Date());
const todayDateOnly = today.split(' ')[0]; // Just the date part: yyyy-MM-dd

// Function to extract dates from natural language query
function extractDatesFromQuery(query: string): { start_date: string; end_date: string } {
  const now = new Date();
  const queryLower = query.toLowerCase();
  
  // Helper function to format date
  const formatDate = (date: Date): string => {
    const pad = (num: number): string => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Helper function to get first day of month
  const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
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

// Update the POST function to properly map meta with data
export async function POST(req: Request) {
  try {
    const { query, apiKey } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key is required' }, { status: 400 });
    }
    
    // Extract dates using our new function
    const { start_date, end_date } = extractDatesFromQuery(query);
    
    // Fetch pipe definition and available dimensions in parallel
    const [pipeDefinition, availableDimensions] = await Promise.all([
      fetchPipeDefinition(),
      fetchAvailableDimensions()
    ]);
    
    // Extract dimension values for the system prompt
    const dimensionValues: Record<string, { type: string, values: string[] }> = {};
    
    // Map meta with data for a more structured representation
    if (availableDimensions && availableDimensions.meta && availableDimensions.data && availableDimensions.data.length > 0) {
      const metaInfo = availableDimensions.meta;
      const dataValues = availableDimensions.data[0];
      
      // Create a structured object with meta information and data values
      metaInfo.forEach((meta: { name: string, type: string }) => {
        dimensionValues[meta.name] = {
          type: meta.type,
          values: dataValues[meta.name] || []
        };
      });
    }
    
    console.log('Structured dimension values:', dimensionValues);
    
    // Update system prompt to include formatted timestamp
    const systemPromptText = `
      You are a parameter extractor for an LLM cost calculator. Extract parameters from natural language queries about AI model cost predictions.
      
      Available dimensions and unique values:
      ${availableDimensions?.meta?.map((meta: { name: string, type: string }) => {
        const name = meta.name;
        const values = dimensionValues[name]?.values || [];
        return `- ${name.charAt(0).toUpperCase() + name.slice(1)}: ${JSON.stringify(values)}`;
      }).join('\n  ') || ''}

      Look for phrases like "filter by", "for", "in", "with", etc. to identify filtering parameters, guess the parameter name based on the available dimensions. Fix typos when necessary.

      Example:
      - Anthropic is not an organization, it's a provider.
      - gpt-4 is not a project, it's a model.
      - production is an environment, not a project.

      Today's date and time is ${today}. You MUST extract start_date and end_date from natural language expressions. Here's how to handle different time expressions:

      1. Relative time expressions:
         - "last week" → start_date: 7 days ago, end_date: today
         - "last month" → start_date: 1 month ago, end_date: today
         - "last 3 months" → start_date: 3 months ago, end_date: today
         - "last year" → start_date: 1 year ago, end_date: today
         - "last 2 years" → start_date: 2 years ago, end_date: today
         - "last 30 days" → start_date: 30 days ago, end_date: today
         - "last 6 weeks" → start_date: 6 weeks ago, end_date: today

      2. Specific time ranges:
         - "from January to March" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"
         - "between January 1st and March 31st" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"
         - "Q1 2024" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"
         - "first quarter" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"

      3. Future predictions:
         - "next month" → start_date: next month's first day, end_date: next month's last day
         - "next quarter" → start_date: next quarter's first day, end_date: next quarter's last day
         - "next year" → start_date: next year's first day, end_date: next year's last day

      4. Default behavior:
         - If no time expression is found, use "last month" as default
         - Always include both start_date and end_date
         - Format dates as "YYYY-MM-DD HH:mm:ss"
         - For end_date, use today's date if not specified

      Examples of natural language queries and expected date extraction:
      1. "Show costs for the last 3 months" → start_date: 3 months ago, end_date: today
      2. "What were our costs in Q1 2024" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"
      3. "Predict costs for next quarter" → start_date: next quarter's first day, end_date: next quarter's last day
      4. "Compare costs between January and March" → start_date: "2024-01-01 00:00:00", end_date: "2024-03-31 23:59:59"
      5. "Show me last year's costs" → start_date: 1 year ago, end_date: today
    `;
    console.log(systemPromptText);

    const costParametersSchema = z.object({
      promptTokenCost: z.number().nullable().optional(),
      completionTokenCost: z.number().nullable().optional(),
      discount: z.number().default(0).optional(),
      timeframe: z.string().default('last month').optional(),
      volumeChange: z.number().default(0).optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      group_by: z.string().optional(),
      model: z.enum((availableDimensions?.data?.[0]?.model || ['gpt-4']) as [string, ...string[]]).optional(),
      provider: z.enum((availableDimensions?.data?.[0]?.provider || ['openai']) as [string, ...string[]]).optional(),
      environment: z.enum((availableDimensions?.data?.[0]?.environment || ['production']) as [string, ...string[]]).optional(),
      organization: z.enum((availableDimensions?.data?.[0]?.organization || ['']) as [string, ...string[]]).optional(),
      project: z.enum((availableDimensions?.data?.[0]?.project || ['']) as [string, ...string[]]).optional(),
      user: z.string().optional()
    });
    type CostParameters = z.infer<typeof costParametersSchema>;

    const openai = createOpenAI({ apiKey: apiKey })

    const result = await generateObject({
      model: openai('gpt-3.5-turbo'),
      schema: costParametersSchema,
      prompt: query,
      systemPrompt: systemPromptText,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Type assertion to handle the result object
    const extractedParams = result.object as CostParameters;
    console.log('Extracted parameters:', extractedParams);
    
    // Ensure timeframe is correctly processed
    const timeframe = extractedParams.timeframe || 'last month';
    
    // Apply defaults for missing parameters
    const processedResult = {
      model: extractedParams.model || null,
      promptTokenCost: extractedParams.promptTokenCost || null,
      completionTokenCost: extractedParams.completionTokenCost || null,
      discount: extractedParams.discount || 0,
      timeframe: timeframe,
      volumeChange: extractedParams.volumeChange || 0,
      start_date: start_date,
      end_date: end_date,
      group_by: extractedParams.group_by || null,
      organization: extractedParams.organization || null,
      project: extractedParams.project || null,
      environment: extractedParams.environment || null,
      provider: extractedParams.provider || null,
      user: extractedParams.user || null,
      pipeDefinition: pipeDefinition,
      availableDimensions: dimensionValues
    };
    
    return NextResponse.json(processedResult);
  } catch (error) {
    console.error('Error extracting parameters:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to extract parameters' }, { status: 500 });
  }
}

// Improved function to calculate start date based on timeframe
function getDefaultStartDate(timeframe: string): string {
  const now = new Date();
  const startDate = new Date(now); // Clone the date
  
  // Convert timeframe to lowercase for case-insensitive comparison
  const normalizedTimeframe = timeframe.toLowerCase();
  
  if (normalizedTimeframe.includes('week')) {
    startDate.setDate(now.getDate() - 7);
  } else if (normalizedTimeframe.includes('month')) {
    // Check if it specifies a number of months
    const monthMatch = normalizedTimeframe.match(/(\d+)\s*month/);
    if (monthMatch && monthMatch[1]) {
      const months = parseInt(monthMatch[1], 10);
      startDate.setMonth(now.getMonth() - months);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
  } else if (normalizedTimeframe.includes('year')) {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    // Default to last month
    startDate.setMonth(now.getMonth() - 1);
  }
  
  // Format the date with the current time
  return formatDate(startDate);
}

// Fetch the llm_usage pipe definition
const fetchPipeDefinition = async () => {
  const TINYBIRD_API_URL = process.env.NEXT_PUBLIC_TINYBIRD_API_URL || 'http://localhost:7181';
  const TINYBIRD_API_KEY = process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;
  
  if (!TINYBIRD_API_KEY) {
    console.error('No Tinybird API key available');
    return null;
  }
  
  try {
    const url = `${TINYBIRD_API_URL}/v0/pipes/llm_usage`;
    console.log('Fetching pipe definition from:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TINYBIRD_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching pipe definition:', error);
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Pipe definition:', data.content);
    return data.content;
  } catch (error) {
    console.error('Error fetching pipe definition:', error);
    return null;
  }
};