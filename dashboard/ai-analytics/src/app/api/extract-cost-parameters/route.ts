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
  end_date: z.string().optional(),
  group_by: z.string().optional(),
  organization: z.string().optional(),
  project: z.string().optional(),
  environment: z.string().optional(),
  provider: z.string().optional(),
  user: z.string().optional()
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
      - group_by: If the user wants to group by a specific dimension (e.g., "model", "provider", "organization", "project", "environment", "user")
      
      Filter parameters (extract if mentioned):
      - organization: Organization name to filter by (e.g., "quantum_systems", "acme_corp")
      - project: Project name to filter by (e.g., "chatbot", "recommendation_engine")
      - environment: Environment to filter by (e.g., "production", "staging", "development")
      - provider: Provider to filter by (e.g., "OpenAI", "Anthropic", "Cohere")
      - user: User to filter by (e.g., "john.doe", "api_user")
      
      For timeframes, calculate the appropriate start_date:
      - "last week" = 7 days before today
      - "last month" = 1 month before today
      - "last 3 months" = 3 months before today
      - "last year" = 1 year before today
      
      If a parameter is not specified in the query, omit it from your response.
      Always include start_date and end_date based on the timeframe (default to "last month" if not specified).
      
      Look for phrases like "filter by", "for", "in", "with", etc. to identify filter parameters.
      Examples:
      - "Show costs for organization quantum_systems" → organization: "quantum_systems"
      - "Predict costs for OpenAI models in production" → provider: "OpenAI", environment: "production"
      - "What if we switch to Claude with a 10% discount for the chatbot project" → model: "Claude", discount: 10, project: "chatbot"
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
      user: extractedParams.user || null
    };
    
    return NextResponse.json(processedResult);
  } catch (error) {
    console.error('Error extracting parameters:', error);
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
  
  return startDate.toISOString().split('T')[0];
}