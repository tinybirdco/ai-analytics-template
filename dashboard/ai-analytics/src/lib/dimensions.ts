export const fetchAvailableDimensions = async (token: string | null, apiUrl: string | null) => {
  if (!token) {
    console.error('No Tinybird token available');
    return null;
  }
  
  try {
    const url = `${apiUrl}/v0/pipes/llm_dimensions.json`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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