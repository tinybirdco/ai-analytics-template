import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { wrapModelWithTinybird, generateRandomChatId, hashApiKeyUser } from '@/lib/tinybird-wrapper';
import { z } from 'zod';

const filterSchema = z.object({
  model: z.string().optional(),
  provider: z.string().optional(),
  organization: z.string().optional(),
  project: z.string().optional(),
  environment: z.string().optional(),
  user: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const systemPromptText = `You are a helpful assistant that helps users filter their LLM usage data.
Your task is to extract filter parameters from the user's natural language query.
You should return a JSON object with the following optional fields:
- model: The model name to filter by
- provider: The provider name to filter by
- organization: The organization name to filter by
- project: The project name to filter by
- environment: The environment name to filter by
- user: The user name to filter by
- start_date: The start date in YYYY-MM-DD format
- end_date: The end date in YYYY-MM-DD format

Only include fields that are explicitly mentioned in the user's query.
If a field is not mentioned, omit it from the JSON object.
If no filters are mentioned, return an empty object.`;

export async function POST(req: Request) {
  try {
    const { prompt, apiKey } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'No prompt provided' }, { status: 400 });
    }

    if (!apiKey) {
      return Response.json({ error: 'No API key provided' }, { status: 400 });
    }

    const wrappedOpenAI = wrapModelWithTinybird(
      openai('gpt-3.5-turbo'),
      process.env.NEXT_PUBLIC_TINYBIRD_API_URL!,
      process.env.TINYBIRD_JWT_SECRET!,
      {
        event: 'search_filter',
        environment: process.env.NODE_ENV,
        project: 'llm-tracker',
        organization: 'tinybird',
        chatId: generateRandomChatId(),
        user: hashApiKeyUser(apiKey),
        systemPrompt: systemPromptText,
      }
    );

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