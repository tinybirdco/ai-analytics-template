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

      Today's date and time is ${today}, calculate relative start_date and end_date from natural language queries. Examples, but guess any timeframe:
      - "last week" = 7 days before today
      - "last n days" = n days before today
      - "last n weeks" = n weeks before today
      - "last month" = 1 month before today
      - "last n months" = n months before today
      - "last year" = 1 year before today
      - "last n years" = n years before today
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
    
    // Calculate start_date based on timeframe if not provided by the LLM
    let start_date = extractedParams.start_date;
    if (!start_date) {
      start_date = getDefaultStartDate(timeframe);
    } else {
      // Double-check that the start_date matches the timeframe
      const calculatedStartDate = getDefaultStartDate(timeframe);
      if (start_date !== calculatedStartDate) {
        console.log(`LLM provided start_date ${start_date} doesn't match calculated date ${calculatedStartDate} for timeframe ${timeframe}. Using calculated date.`);
        start_date = calculatedStartDate;
      }
    }
    
    // Apply defaults for missing parameters
    const processedResult = {
      model: extractedParams.model || null,
      promptTokenCost: extractedParams.promptTokenCost || null,
      completionTokenCost: extractedParams.completionTokenCost || null,
      discount: extractedParams.discount || 0,
      timeframe: timeframe,
      volumeChange: extractedParams.volumeChange || 0,
      start_date: start_date,
      end_date: extractedParams.end_date || today,
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