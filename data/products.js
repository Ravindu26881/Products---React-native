// API endpoint for products
const API_URL = 'https://products-api-production-124f.up.railway.app';

// Fetch products from API
export const fetchAllProducts = async () => {
  try {
    const response = await fetch(API_URL + '/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return error
  }
};

export const fetchProductsByStoreId = async (id) => {
  try {
    const response = await fetch(API_URL + '/stores/' + id + '/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return error
  }
};