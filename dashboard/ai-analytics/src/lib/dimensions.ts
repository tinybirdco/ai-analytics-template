export const fetchAvailableDimensions = async () => {
  const TINYBIRD_API_URL = process.env.NEXT_PUBLIC_TINYBIRD_API_URL || 'http://localhost:7181';
  const TINYBIRD_API_KEY = process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;
  
  if (!TINYBIRD_API_KEY) {
    console.error('No Tinybird API key available');
    return null;
  }
  
  try {
    const url = `${TINYBIRD_API_URL}/v0/pipes/llm_dimensions.json`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TINYBIRD_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching dimensions:', error);
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Available dimensions:', data);
    return data;
  } catch (error) {
    console.error('Error fetching dimensions:', error);
    return null;
  }
}; 