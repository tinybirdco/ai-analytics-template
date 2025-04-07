/**
 * Generates a user hash from the last 10 characters of the API key
 * This matches the hashApiKeyUser function in the search route
 */
export function generateUserHash(apiKey: string): string {
  if (!apiKey) return '';
  
  // Get the last 10 characters of the API key
  const lastTenChars = apiKey.slice(-10);
  
  // Simple hash function (not cryptographically secure, but sufficient for this purpose)
  let hash = 0;
  for (let i = 0; i < lastTenChars.length; i++) {
    const char = lastTenChars.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a positive hex string and take first 8 characters
  const positiveHash = Math.abs(hash).toString(16);
  return `user_${positiveHash.substring(0, 8)}`;
} 