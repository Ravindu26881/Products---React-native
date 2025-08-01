// API endpoint for products
const API_URL = 'https://products-api-production-124f.up.railway.app/products';

// Fetch products from API
export const fetchProducts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return fallback data if API fails
    return [
      { _id: '1', name: 'No data', price: '0', category: 'error' },
      ];
  }
};

// Legacy dummy products (kept for reference)
export const products = [
  { id: 1, name: 'iPhone 15 Pro', price: '$999', category: 'Electronics' },
  { id: 2, name: 'MacBook Air', price: '$1199', category: 'Electronics' },
  { id: 3, name: 'AirPods Pro', price: '$249', category: 'Electronics' },
  { id: 4, name: 'iPad Air', price: '$599', category: 'Electronics' },
  { id: 5, name: 'Apple Watch', price: '$399', category: 'Electronics' },
  { id: 6, name: 'Samsung Galaxy S24', price: '$899', category: 'Electronics' },
  { id: 7, name: 'Sony WH-1000XM5', price: '$349', category: 'Electronics' },
  { id: 8, name: 'Nike Air Max 270', price: '$150', category: 'Shoes' },
  { id: 9, name: 'Adidas Ultraboost', price: '$180', category: 'Shoes' },
  { id: 10, name: 'Levi\'s 501 Jeans', price: '$89', category: 'Clothing' },
];