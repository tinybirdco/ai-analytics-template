// src/app/api/extract-cost-parameters/route.ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Define the schema for cost parameters
const costParametersSchema = z.object({
  model: z.string().nullable().optional(),
  promptTokenCost: z.number().nullable().optional(),
  completionTokenCost: z.number().nullable().optional(),
  discount: z.number().default(0).optional(),
  timeframe: z.string().default('last month').optional(),
  volumeChange: z.number().default(0).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

// Create a type from the schema
type CostParameters = z.infer<typeof costParametersSchema>;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Get today's date for the prompt
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const systemPromptText = `
      You are a cost prediction parameter extractor. Extract parameters from natural language queries about AI model cost predictions.
      
      Today's date is ${today}.
      
      Return values for these parameters:
      - model: The AI model mentioned (e.g., "gpt-4", "claude-sonnet")
      - promptTokenCost: Cost per prompt token (in USD)
      - completionTokenCost: Cost per completion token (in USD)
      - discount: Any discount percentage mentioned (0-100)
      - timeframe: Time period for analysis (e.g., "last month", "last week", "last 3 months", "last year")
      - volumeChange: Any volume change percentage mentioned (can be positive or negative)
      - start_date: The start date in YYYY-MM-DD format based on the timeframe
      - end_date: The end date in YYYY-MM-DD format (usually today: ${today})
      
      For timeframes, calculate the appropriate start_date:
      - "last week" = 7 days before today
      - "last month" = 1 month before today
      - "last 3 months" = 3 months before today
      - "last year" = 1 year before today
      
      If a parameter is not specified in the query, omit it from your response.
      Always include start_date and end_date based on the timeframe (default to "last month" if not specified).
    `;

    const result = await generateObject({
      model: openai('gpt-3.5-turbo'),
      schema: costParametersSchema,
      prompt: query,
      systemPrompt: systemPromptText,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Type assertion to handle the result object
    const extractedParams = result.object as CostParameters;
    
    // Apply defaults for missing parameters
    const processedResult = {
      model: extractedParams.model || null,
      promptTokenCost: extractedParams.promptTokenCost || null,
      completionTokenCost: extractedParams.completionTokenCost || null,
      discount: extractedParams.discount || 0,
      timeframe: extractedParams.timeframe || 'last month',
      volumeChange: extractedParams.volumeChange || 0,
      start_date: extractedParams.start_date || getDefaultStartDate('last month'),
      end_date: extractedParams.end_date || today
    };
    
    return NextResponse.json(processedResult);
  } catch (error) {
    console.error('Error extracting parameters:', error);
    return NextResponse.json({ error: 'Failed to extract parameters' }, { status: 500 });
  }
}

// Fallback function to calculate start date if the LLM doesn't provide one
function getDefaultStartDate(timeframe: string): string {
  const now = new Date();
  const startDate = new Date();
  
  if (timeframe === 'last week') {
    startDate.setDate(now.getDate() - 7);
  } else if (timeframe === 'last month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (timeframe === 'last 3 months') {
    startDate.setMonth(now.getMonth() - 3);
  } else if (timeframe === 'last year') {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    // Default to last month
    startDate.setMonth(now.getMonth() - 1);
  }
  
  return startDate.toISOString().split('T')[0];
}