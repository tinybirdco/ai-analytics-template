// lib/telemetry/index.ts
import { TinybirdTracerProvider } from './TinybirdTracerProvider';

// Singleton instance
let tracerProviderInstance: TinybirdTracerProvider | null = null;

export function getTracerProvider(): TinybirdTracerProvider {
  if (!tracerProviderInstance) {
    const tinybirdApiUrl = process.env.NEXT_PUBLIC_TINYBIRD_API_URL || 'http://localhost:7181';
    const tinybirdApiKey = process.env.NEXT_PUBLIC_TINYBIRD_API_KEY || '';
    
    tracerProviderInstance = new TinybirdTracerProvider(
      'ai-analytics',
      tinybirdApiUrl,
      tinybirdApiKey
    );
  }
  
  return tracerProviderInstance;
}