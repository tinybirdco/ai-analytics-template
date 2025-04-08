/**
 * Tinybird utility functions for handling API URLs and tokens
 */

/**
 * Converts a Tinybird host to its corresponding API URL
 * @param host The Tinybird host (e.g., 'gcp-europe-west2')
 * @returns The corresponding API URL
 */
export function getApiUrlFromHost(host: string): string {
  // Map of host patterns to API URLs
  const hostToApiUrl: Record<string, string> = {
    'gcp-europe-west2': 'https://api.europe-west2.gcp.tinybird.co',
    'gcp-europe-west3': 'https://api.tinybird.co',
    'gcp-us-east4': 'https://api.us-east.tinybird.co',
    'gcp-northamerica-northeast2': 'https://api.northamerica-northeast2.gcp.tinybird.co',
    'aws-eu-central-1': 'https://api.eu-central-1.aws.tinybird.co',
    'aws-eu-west-1': 'https://api.eu-west-1.aws.tinybird.co',
    'aws-us-east-1': 'https://api.us-east.aws.tinybird.co',
    'aws-us-west-2': 'https://api.us-west-2.aws.tinybird.co',
  };

  // Check if the host matches any of the patterns
  for (const [pattern, apiUrl] of Object.entries(hostToApiUrl)) {
    if (host.includes(pattern)) {
      return apiUrl;
    }
  }

  // Default to the standard API URL if no match is found
  return 'https://api.tinybird.co';
}

/**
 * Extracts the host from a JWT token
 * @param token The JWT token
 * @returns The host from the token or null if extraction fails
 */
export function extractHostFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.host || null;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
} 