// API endpoint for products
const API_URL = 'https://products-api-production-124f.up.railway.app/stores';

// Fetch products from API
export const fetchStores = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return error
  }
};