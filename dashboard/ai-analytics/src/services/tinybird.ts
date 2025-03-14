import { useTinybirdToken } from '@/providers/TinybirdProvider';

const TINYBIRD_API_URL = process.env.NEXT_PUBLIC_TINYBIRD_API_URL;
const TINYBIRD_API_KEY = process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;

export interface TinybirdParams {
  start_date?: string;
  end_date?: string;
  organization?: string;
  project?: string;
  column_name?: string;
  dimension?: string;
}

export async function fetchLLMUsage(token: string, params: TinybirdParams = {}) {
  console.log('Tinybird token in service:', token);
  
  if (!token) throw new Error('No Tinybird token available');
  
  const searchParams = new URLSearchParams();
  
  // Handle column_name separately as it's used for grouping
  if (params.column_name) {
    searchParams.set('column_name', params.column_name);
  }

  // Handle all other filter parameters
  const filterParams = ['model', 'provider', 'organization', 'project', 'environment', 'user'];
  filterParams.forEach(param => {
    if (params[param as keyof TinybirdParams]) {
      searchParams.set(param, params[param as keyof TinybirdParams]!);
    }
  });

  // Handle date range
  if (params.start_date) searchParams.set('start_date', params.start_date);
  if (params.end_date) searchParams.set('end_date', params.end_date);

  const url = `${TINYBIRD_API_URL}/v0/pipes/llm_usage.json?${searchParams.toString()}`;
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

export async function fetchGenericCounter(token: string, params: TinybirdParams) {
  if (!token) throw new Error('No Tinybird token available');
  
  const searchParams = new URLSearchParams();
  
  // Add all params to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value.toString());
  });

  const response = await fetch(
    `${TINYBIRD_API_URL}/v0/pipes/generic_counter.json?${searchParams.toString()}`,
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