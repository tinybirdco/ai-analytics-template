import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { wrapModelWithTinybird } from '@/lib/tinybird-wrapper';
import { fetchAvailableDimensions } from '@/lib/dimensions';

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
        project: 'llm-tracker',
        organization: 'llm-tracker',
        chatId: generateRandomChatId(),
        user: hashApiKeyUser(apiKey),
      }
    );

    // Fetch available dimensions
    const availableDimensions = await fetchAvailableDimensions();
    
    // Create the schema outside the function call
    const filterSchema = z.object({
      model: z.enum((availableDimensions?.data?.[0]?.model || ['gpt-4']) as [string, ...string[]]).optional(),
      provider: z.enum((availableDimensions?.data?.[0]?.provider || ['openai']) as [string, ...string[]]).optional(),
      environment: z.enum((availableDimensions?.data?.[0]?.environment || ['production']) as [string, ...string[]]).optional(),
      organization: z.enum((availableDimensions?.data?.[0]?.organizations || ['']) as [string, ...string[]]).optional(),
      project: z.enum((availableDimensions?.data?.[0]?.project || ['']) as [string, ...string[]]).optional(),
      date_range: z.enum(['last month', 'last week'] as [string, ...string[]]).optional(),
    });

    const systemPromptText = `You are a filter parser for an analytics dashboard. Convert natural language into filter key-value pairs.
    Available dimensions: ${Object.keys(availableDimensions?.data?.[0] || {}).join(', ')}.
    Common values: ${JSON.stringify(availableDimensions?.data?.[0] || {}, null, 2)}.
    Return only valid values from the provided dimensions, fix typos when necessary.`;
    console.log(systemPromptText);
    

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

// Function to generate a random chatId
function generateRandomChatId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `search_${timestamp}_${randomPart}`;
}

// Function to hash the last 10 characters of the API key for user identification
function hashApiKeyUser(apiKey: string): string {
  // Get the last 10 characters of the API key
  const lastTenChars = apiKey.slice(-10);
  
  // Simple hash function (not cryptographically secure, but sufficient for this purpose)
  let hash = 0;
  for (let i = 0; i < lastTenChars.length; i++) {
    const char = lastTenChars.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a positive hex string and take first 8 characters
  const positiveHash = Math.abs(hash).toString(16);
  return `user_${positiveHash.substring(0, 8)}`;
}