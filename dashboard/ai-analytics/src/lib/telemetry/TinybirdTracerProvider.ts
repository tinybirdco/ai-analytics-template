import {
  Tracer,
  SpanKind,
  SpanStatusCode,
  Context,
  Span,
  TimeInput,
  SpanOptions,
  SpanStatus,
  TracerProvider,
  diag,
  Link,
  AttributeValue,
} from '@opentelemetry/api';

interface TinybirdSpanEvent {
  name: string;
  attributes?: Record<string, AttributeValue>;
  timestamp?: TimeInput;
}

interface TinybirdSpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, AttributeValue>;
  events: TinybirdSpanEvent[];
  status: {
    code: string;
    message?: string;
  };
}

export class TinybirdTracer implements Tracer {
  private readonly name: string;
  private readonly version: string;
  private readonly tinybirdApiUrl: string;
  private readonly tinybirdApiKey: string;

  constructor(
    name: string,
    version: string = '1.0.0',
    tinybirdApiUrl: string,
    tinybirdApiKey: string
  ) {
    this.name = name;
    this.version = version;
    this.tinybirdApiUrl = tinybirdApiUrl;
    this.tinybirdApiKey = tinybirdApiKey;
  }

  startSpan(name: string, options?: SpanOptions, _context?: Context): Span {
    // Create a clean attributes object without undefined values
    const cleanAttributes: Record<string, AttributeValue> = {};
    
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanAttributes[key] = value as AttributeValue;
        }
      });
    }
    
    return new TinybirdSpanImpl(
      name,
      options?.kind || SpanKind.INTERNAL,
      this.tinybirdApiUrl,
      this.tinybirdApiKey,
      cleanAttributes
    );
  }

  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    optionsOrFn?: SpanOptions | F,
    fnOrContext?: F | Context,
    _contextOrNothing?: Context
  ): ReturnType<F> | undefined {
    let options: SpanOptions | undefined;
    let fn: F | undefined;

    if (typeof optionsOrFn === 'function') {
      fn = optionsOrFn as F;
      // We don't need to use the context
    } else {
      options = optionsOrFn as SpanOptions;
      fn = fnOrContext as F;
      // We don't need to use the context
    }

    const span = this.startSpan(name, options);
    
    if (typeof fn !== 'function') {
      return undefined;
    }
    
    try {
      return fn(span);
    } finally {
      span.end();
    }
  }
}

// Renamed from TinybirdSpan to TinybirdSpanImpl to avoid declaration merging
class TinybirdSpanImpl implements Span {
  private readonly _name: string;
  private readonly _kind: SpanKind;
  private readonly _startTime: number;
  private _endTime?: number;
  private _status: SpanStatus = { code: SpanStatusCode.UNSET };
  private _attributes: Record<string, AttributeValue> = {};
  private _events: TinybirdSpanEvent[] = [];
  private readonly _spanId: string;
  private readonly _traceId: string;
  private readonly _tinybirdApiUrl: string;
  private readonly _tinybirdApiKey: string;
  private _links: Link[] = []; // Add links array to store links

  constructor(
    name: string,
    kind: SpanKind,
    tinybirdApiUrl: string,
    tinybirdApiKey: string,
    attributes: Record<string, AttributeValue> = {}
  ) {
    this._name = name;
    this._kind = kind;
    this._startTime = Date.now();
    this._spanId = this.generateId(8);
    this._traceId = this.generateId(16);
    this._tinybirdApiUrl = tinybirdApiUrl;
    this._tinybirdApiKey = tinybirdApiKey;
    this._attributes = { ...attributes };
  }

  private generateId(length: number): string {
    return [...Array(length)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  setAttribute(key: string, value: AttributeValue): this {
    this._attributes[key] = value;
    return this;
  }

  setAttributes(attributes: Record<string, AttributeValue>): this {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined) {
        this._attributes[key] = value;
      }
    });
    return this;
  }

  addEvent(
    name: string, 
    attributesOrStartTime?: Record<string, AttributeValue> | TimeInput, 
    startTime?: TimeInput
  ): this {
    if (typeof attributesOrStartTime === 'number' || 
        attributesOrStartTime instanceof Date || 
        Array.isArray(attributesOrStartTime)) {
      this._events.push({
        name,
        timestamp: attributesOrStartTime as TimeInput,
      });
    } else if (attributesOrStartTime) {
      this._events.push({
        name,
        attributes: attributesOrStartTime as Record<string, AttributeValue>,
        timestamp: startTime,
      });
    } else {
      this._events.push({
        name,
        timestamp: startTime,
      });
    }
    return this;
  }

  addLink(link: Link): this {
    this._links.push(link);
    return this;
  }

  addLinks(links: Link[]): this {
    this._links.push(...links);
    return this;
  }

  setStatus(status: SpanStatus): this {
    this._status = status;
    return this;
  }

  updateName(_name: string): this {
    // Not implemented for simplicity
    return this;
  }

  end(endTime?: TimeInput): void {
    if (!endTime) {
      this._endTime = Date.now();
    } else if (endTime instanceof Date) {
      this._endTime = endTime.getTime();
    } else if (typeof endTime === 'number') {
      this._endTime = endTime;
    } else if (Array.isArray(endTime)) {
      // Handle HrTime: convert to milliseconds
      // HrTime is [seconds, nanoseconds]
      this._endTime = endTime[0] * 1000 + endTime[1] / 1000000;
    }
    
    this.sendToTinybird();
  }

  isRecording(): boolean {
    return this._endTime === undefined;
  }

  recordException(exception: Error, time?: TimeInput): void {
    const attributes: Record<string, AttributeValue> = {
      'exception.message': exception.message,
      'exception.stacktrace': exception.stack || ''
    };
    
    this.addEvent('exception', attributes, time);
  }

  spanContext() {
    return {
      traceId: this._traceId,
      spanId: this._spanId,
      traceFlags: 1, // SAMPLED
      isRemote: false,
    };
  }

  private async sendToTinybird() {
    try {
      const spanData: TinybirdSpanData = {
        traceId: this._traceId,
        spanId: this._spanId,
        name: this._name,
        kind: SpanKind[this._kind],
        startTime: this._startTime,
        endTime: this._endTime,
        attributes: this._attributes,
        events: this._events,
        status: {
          code: SpanStatusCode[this._status.code],
          message: this._status.message,
        },
      };

      // Get token counts, ensuring they are numbers
      const promptTokens = typeof spanData.attributes['ai.usage.promptTokens'] === 'number' 
        ? spanData.attributes['ai.usage.promptTokens'] 
        : 0;
      
      const completionTokens = typeof spanData.attributes['ai.usage.completionTokens'] === 'number'
        ? spanData.attributes['ai.usage.completionTokens']
        : 0;

      // Flatten the attributes for better querying in Tinybird
      const flattenedData = {
        ...spanData,
        // Extract important AI SDK attributes to top level
        model: spanData.attributes['ai.model.id'],
        provider: spanData.attributes['ai.model.provider'],
        operation: spanData.attributes['ai.operationId'],
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        duration: (spanData.endTime || Date.now()) - spanData.startTime,
        // Keep the original attributes as a JSON string
        attributesJson: JSON.stringify(spanData.attributes),
        eventsJson: JSON.stringify(spanData.events),
        linksJson: JSON.stringify(this._links), // Add links to the data
        timestamp: new Date().toISOString(),
      };

      console.log('Sending telemetry to Tinybird:', this._tinybirdApiUrl);
      
      const response = await fetch(`${this._tinybirdApiUrl}/v0/events?name=ai_telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._tinybirdApiKey}`
        },
        body: JSON.stringify(flattenedData),
      });

      console.log('Tinybird response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to send span to Tinybird: ${errorText}`);
        diag.error(`Failed to send span to Tinybird: ${errorText}`);
      } else {
        console.log('Successfully sent telemetry to Tinybird');
      }
    } catch (error) {
      console.error(`Error sending span to Tinybird:`, error);
      diag.error(`Error sending span to Tinybird: ${error}`);
    }
  }
}

export class TinybirdTracerProvider implements TracerProvider {
  private readonly serviceName: string;
  private readonly tinybirdApiUrl: string;
  private readonly tinybirdApiKey: string;

  constructor(
    serviceName: string,
    tinybirdApiUrl: string,
    tinybirdApiKey: string
  ) {
    this.serviceName = serviceName;
    this.tinybirdApiUrl = tinybirdApiUrl;
    this.tinybirdApiKey = tinybirdApiKey;
  }

  getTracer(name: string, version?: string): Tracer {
    return new TinybirdTracer(
      name,
      version,
      this.tinybirdApiUrl,
      this.tinybirdApiKey
    );
  }
} 