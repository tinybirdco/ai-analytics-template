import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

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
  const { prompt } = await req.json();

  const { object } = await generateObject({
    model: openai('gpt-3.5-turbo'),
    schema: z.object({
      model: z.enum(DIMENSIONS.model as [string, ...string[]]).optional(),
      provider: z.enum(DIMENSIONS.provider as [string, ...string[]]).optional(),
      environment: z.enum(DIMENSIONS.environment as [string, ...string[]]).optional(),
      date_range: z.enum(Object.keys(DIMENSIONS.date_range) as [string, ...string[]]).optional(),
    }),
    prompt,
    systemPrompt: `You are a filter parser for an analytics dashboard. Convert natural language into filter key-value pairs.
    Available dimensions: ${Object.keys(DIMENSIONS).join(', ')}.
    Common values: ${JSON.stringify(DIMENSIONS, null, 2)}.
    Return only valid values from the provided dimensions.`,
  });

  return Response.json(object);
}