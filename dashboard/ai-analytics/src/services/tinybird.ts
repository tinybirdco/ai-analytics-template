const TINYBIRD_API_URL = process.env.NEXT_PUBLIC_TINYBIRD_API_URL;
const TINYBIRD_API_KEY = process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;

export interface TinybirdParams {
  start_date?: string;
  end_date?: string;
  organization?: string;
  project?: string;
  column_name?: string;
}

export async function fetchLLMUsage(params: TinybirdParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.start_date) searchParams.set('start_date', params.start_date);
  if (params.end_date) searchParams.set('end_date', params.end_date);
  if (params.organization) searchParams.set('organization', params.organization);
  if (params.project) searchParams.set('project', params.project);
  // Default to 'model' if column_name is not provided
  searchParams.set('column_name', params.column_name || 'model');

  const response = await fetch(
    `${TINYBIRD_API_URL}/v0/pipes/llm_usage.json?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${TINYBIRD_API_KEY}`,
      },
    }
  );

  return response.json();
} 