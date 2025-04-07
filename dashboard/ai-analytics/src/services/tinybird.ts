import { useTinybirdToken } from '@/providers/TinybirdProvider';

export interface TinybirdParams {
  start_date?: string;
  end_date?: string;
  organization?: string;
  project?: string;
  column_name?: string;
  dimension?: string;
}

export interface LLMMessagesParams {
  start_date?: string;
  end_date?: string;
  organization?: string;
  project?: string;
  model?: string;
  provider?: string;
  environment?: string;
  user?: string;
  embedding?: number[];
  similarity_threshold?: number;
}

export interface LLMVectorSearchParams {
  embedding?: number[];
  similarity_threshold?: number;
  organization?: string;
  project?: string;
  model?: string;
  provider?: string;
  environment?: string;
  user?: string;
}

export async function fetchLLMUsage(token: string, apiUrl: string, filters: Record<string, string | undefined> = {}) {
  console.log('Tinybird token in service:', token);
  console.log('Tinybird API URL in service:', apiUrl);
  
  if (!token) throw new Error('No Tinybird token available');
  
  const searchParams = new URLSearchParams();
  
  // Handle column_name separately as it's used for grouping
  if (filters.column_name) {
    searchParams.set('column_name', filters.column_name);
  }

  // Handle all other filter parameters
  const filterParams = ['model', 'provider', 'organization', 'project', 'environment', 'user'];
  filterParams.forEach(param => {
    if (filters[param as keyof Record<string, string | undefined>]) {
      // Pass the comma-separated string directly - Tinybird will handle it as an array
      searchParams.set(param, filters[param as keyof Record<string, string | undefined>]!);
    }
  });

  // Handle date range
  if (filters.start_date) searchParams.set('start_date', filters.start_date);
  if (filters.end_date) searchParams.set('end_date', filters.end_date);

  const url = `${apiUrl}/v0/pipes/llm_usage.json?${searchParams.toString()}`;
  console.log('Tinybird request URL:', url);
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('Tinybird response status:', response.status);
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Tinybird error:', error);
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function fetchGenericCounter(token: string, apiUrl: string, params: TinybirdParams) {
  if (!token) throw new Error('No Tinybird token available');
  
  const searchParams = new URLSearchParams();
  
  // Add all params to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      // Pass the comma-separated string directly - Tinybird will handle it as an array
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(
    `${apiUrl}/v0/pipes/generic_counter.json?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function fetchLLMMessages(token: string, apiUrl: string, params: LLMMessagesParams = {}) {
  if (!token) throw new Error('No Tinybird token available');
  
  // Determine if we should use POST (for embeddings) or GET (for regular queries)
  const hasEmbedding = params.embedding && params.embedding.length > 0;
  
  // Use vector search pipe if embedding is provided, otherwise use regular pipe
  const pipeName = 'llm_messages';
  const baseUrl = `${apiUrl}/v0/pipes/${pipeName}.json`;
  
  let response;
  
  if (hasEmbedding) {
    // Use POST for embedding queries to avoid URL length limitations
    console.log('Using POST for Tinybird request with embeddings');
    
    // Create request body with all parameters
    const requestBody: Record<string, string | number | number[] | boolean> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // For embedding, pass it directly as an array
        if (key === 'embedding') {
          requestBody[key] = value as number[];
        } else {
          // Pass the comma-separated string directly - Tinybird will handle it as an array
          requestBody[key] = value.toString();
        }
      }
    });
    
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } else {
    // Use GET for regular queries
    const searchParams = new URLSearchParams();
    
    // Add all params to search params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Pass the comma-separated string directly - Tinybird will handle it as an array
        searchParams.set(key, value.toString());
      }
    });
    
    const url = `${baseUrl}?${searchParams.toString()}`;
    console.log('Tinybird LLM Messages request URL:', url);
    
    response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  console.log('Tinybird LLM Messages response status:', response.status);
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Tinybird error:', error);
    throw new Error('Network response was not ok');
  }
  
  return response.json();
}

export async function searchLLMMessagesByVector(
  token: string, 
  apiUrl: string,
  params: LLMVectorSearchParams = {}
) {
  if (!token) throw new Error('No Tinybird token available');
  
  const searchParams = new URLSearchParams();
  
  // Add embedding as a JSON string if provided
  if (params.embedding && params.embedding.length > 0) {
    searchParams.set('embedding', JSON.stringify(params.embedding));
  }
  
  // Add similarity threshold if provided
  if (params.similarity_threshold) {
    searchParams.set('similarity_threshold', params.similarity_threshold.toString());
  }
  
  // Add all other params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && key !== 'embedding' && key !== 'similarity_threshold') {
      // Pass the comma-separated string directly - Tinybird will handle it as an array
      searchParams.set(key, value.toString());
    }
  });

  const url = `${apiUrl}/v0/pipes/llm_messages_vector_search.json?${searchParams.toString()}`;
  console.log('Tinybird Vector Search request URL:', url);
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('Tinybird Vector Search response status:', response.status);
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Tinybird error:', error);
    throw new Error('Network response was not ok');
  }

  return response.json();
}