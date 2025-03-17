// dashboard/ai-analytics/src/app/api/generate-embedding/route.ts
import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

// Cache the model to avoid reloading it for every request
let embeddingPipeline: any = null;

async function getEmbeddingModel() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text must be a non-empty string' },
        { status: 400 }
      );
    }
    
    // Get the model
    const model = await getEmbeddingModel();
    
    // Generate embedding
    const output = await model(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    
    return NextResponse.json({ embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}