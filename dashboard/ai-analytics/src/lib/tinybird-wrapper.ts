import type { LanguageModelV1 } from '@ai-sdk/provider';

type TinybirdConfig = {
  event?: string;
  organization?: string;
  project?: string;
  environment?: string;
  user?: string;
  chatId?: string;
};

export function wrapModelWithTinybird(
  model: LanguageModelV1,
  tinybirdHost: string,
  tinybirdToken: string,
  config: TinybirdConfig = {}
) {
  const originalDoGenerate = model.doGenerate;
  const originalDoStream = model.doStream;

  const logToTinybird = async (
    messageId: string,
    startTime: Date,
    status: 'success' | 'error',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[],
    result?: { text?: string; usage?: { promptTokens?: number; completionTokens?: number } },
    error?: Error
  ) => {
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    const event = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      message_id: messageId,
      cost: calculateCost(model.modelId || 'unknown', result?.usage),
      model: model.modelId || 'unknown',
      provider: 'openai',
      duration,
      llm_api_duration_ms: duration,
      response: status === 'success' ? {
        id: messageId,
        object: 'chat.completion',
        usage: {
          prompt_tokens: result?.usage?.promptTokens || 0,
          completion_tokens: result?.usage?.completionTokens || 0,
          total_tokens: (result?.usage?.promptTokens || 0) + (result?.usage?.completionTokens || 0),
        },
        choices: [{ message: { content: result?.text ?? '' } }],
      } : undefined,
      messages: args[0]?.prompt ? [{ role: 'user', content: args[0].prompt }].map(m => ({
        role: String(m.role),
        content: String(m.content)
      })) : [],
      proxy_metadata: {
        organization: config.organization || '',
        project: config.project || '',
        environment: config.environment || '',
        chat_id: config.chatId || '',
      },
      user: config.user || 'unknown',
      standard_logging_object_status: status,
      standard_logging_object_response_time: duration,
      log_event_type: config.event || 'chat_completion',
      id: messageId,
      call_type: 'completion',
      cache_hit: false,
      ...(status === 'error' && {
        exception: error?.message || 'Unknown error',
        traceback: error?.stack || '',
      }),
    };

    // Send to Tinybird
    fetch(`${tinybirdHost}/v0/events?name=llm_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tinybirdToken}`,
      },
      body: JSON.stringify(event),
    }).catch(console.error);
  };

  model.doGenerate = async function (...args) {
    const startTime = new Date();
    const messageId = crypto.randomUUID();
    
    try {
      const result = await originalDoGenerate.apply(this, args);
      await logToTinybird(messageId, startTime, 'success', args, result);
      return result;
    } catch (error) {
      await logToTinybird(messageId, startTime, 'error', args, undefined, error as Error);
      throw error;
    }
  };

  model.doStream = async function (...args) {
    const startTime = new Date();
    const messageId = crypto.randomUUID();
    
    try {
      const result = await originalDoStream.apply(this, args);
      await logToTinybird(messageId, startTime, 'success', args, { text: '', usage: { promptTokens: 0, completionTokens: 0 } });
      return result;
    } catch (error) {
      await logToTinybird(messageId, startTime, 'error', args, undefined, error as Error);
      throw error;
    }
  };

  return model;
}

// Function to calculate cost based on model and token usage
function calculateCost(
  modelId: string, 
  usage?: { promptTokens?: number; completionTokens?: number }
): number {
  if (!usage) return 0;
  
  // Default to 0 if no tokens used
  const promptTokens = usage.promptTokens || 0;
  const completionTokens = usage.completionTokens || 0;
  
  // Cost per 1K tokens (in USD)
  // These values are approximate and may need to be updated
  const modelCosts: Record<string, { prompt: number; completion: number }> = {
    'gpt-4o': { prompt: 0.03, completion: 0.06 },
    'gpt-4o-mini': { prompt: 0.015, completion: 0.03 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
    'gpt-3.5-turbo-0125': { prompt: 0.0015, completion: 0.002 },
    'gpt-3.5-turbo-1106': { prompt: 0.0015, completion: 0.002 },
    'gpt-3.5-turbo-instruct': { prompt: 0.0015, completion: 0.002 },
    'claude-3-opus': { prompt: 0.015, completion: 0.075 },
    'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
    'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
    'claude-2.1': { prompt: 0.008, completion: 0.024 },
    'claude-2.0': { prompt: 0.008, completion: 0.024 },
    'claude-instant': { prompt: 0.0008, completion: 0.0024 },
    'gemini-pro': { prompt: 0.00025, completion: 0.0005 },
    'gemini-1.5-pro': { prompt: 0.00025, completion: 0.0005 },
    'gemini-1.5-flash': { prompt: 0.00025, completion: 0.0005 },
    'mixtral-8x7b': { prompt: 0.00027, completion: 0.00027 },
    'llama-3-70b': { prompt: 0.0009, completion: 0.0009 },
    'llama-3-8b': { prompt: 0.0002, completion: 0.0002 },
    'llama-2-70b': { prompt: 0.0009, completion: 0.0009 },
    'llama-2-13b': { prompt: 0.0002, completion: 0.0002 },
    'llama-2-7b': { prompt: 0.0002, completion: 0.0002 },
    'mistral-large': { prompt: 0.008, completion: 0.024 },
    'mistral-medium': { prompt: 0.0027, completion: 0.0081 },
    'mistral-small': { prompt: 0.002, completion: 0.006 },
    'unknown': { prompt: 0.001, completion: 0.002 }, // Default fallback
  };
  
  // Get the cost rates for this model, or use the default
  const rates = modelCosts[modelId] || modelCosts['unknown'];
  
  // Calculate total cost
  const promptCost = (promptTokens / 1000) * rates.prompt;
  const completionCost = (completionTokens / 1000) * rates.completion;
  
  return Number((promptCost + completionCost).toFixed(6));
} 