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
    const duration = endTime.getTime() - startTime.getTime();

    const event = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      message_id: messageId,
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