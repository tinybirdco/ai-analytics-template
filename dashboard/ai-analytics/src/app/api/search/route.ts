import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { wrapModelWithTinybird } from '@/lib/tinybird-wrapper';

const DIMENSIONS = {
  model: ['gpt-4', 'gpt-3.5-turbo', 'claude-2'],
  provider: ['openai', 'anthropic'],
  environment: ['production', 'staging', 'development'],
  date_range: {
    'last month': {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    'last week': {
      start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    }
  }
};

export async function POST(req: Request) {
  const { prompt, apiKey } = await req.json();
  
  if (!apiKey) {
    return Response.json({ error: 'OpenAI API key is required' }, { status: 400 });
  }

  try {
    const openai = createOpenAI({ apiKey: apiKey });
    const wrappedOpenAI = wrapModelWithTinybird(
      openai('gpt-3.5-turbo'),
      process.env.NEXT_PUBLIC_TINYBIRD_API_URL!,
      process.env.TINYBIRD_JWT_SECRET!,
      {
        event: 'search_filter',
        environment: process.env.NODE_ENV,
        project: 'ai-analytics',
        organization: 'your-org',
      }
    );

    // Create the schema outside the function call
    const filterSchema = z.object({
      model: z.enum(DIMENSIONS.model as [string, ...string[]]).optional(),
      provider: z.enum(DIMENSIONS.provider as [string, ...string[]]).optional(),
      environment: z.enum(DIMENSIONS.environment as [string, ...string[]]).optional(),
      date_range: z.enum(Object.keys(DIMENSIONS.date_range) as [string, ...string[]]).optional(),
    });

    const systemPromptText = `You are a filter parser for an analytics dashboard. Convert natural language into filter key-value pairs.
    Available dimensions: ${Object.keys(DIMENSIONS).join(', ')}.
    Common values: ${JSON.stringify(DIMENSIONS, null, 2)}.
    Return only valid values from the provided dimensions.`;

    const result = await generateObject({
      model: wrappedOpenAI,
      schema: filterSchema,
      prompt,
      systemPrompt: systemPromptText,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return Response.json(result.object);
  } catch (error) {
    console.error('Error processing search:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return Response.json({ error: 'Invalid OpenAI API key' }, { status: 401 });
    }
    
    return Response.json({ error: 'Failed to process search query' }, { status: 500 });
  }
}