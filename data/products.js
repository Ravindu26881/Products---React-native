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

// Fetch single product by ID from a specific store
export const fetchProductById = async (storeId, productId) => {
  try {
    const response = await fetch(API_URL + '/stores/' + storeId + '/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    const product = products.find(p => p._id === productId || p.id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const sendOrder = async (storeId, products, userId) => {
  try {
    const response = await fetch(API_URL + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId: storeId,
        userId: userId,
        products: products,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    return await response.json(); // parse response as JSON
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(API_URL + '/orders/' + orderId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    return await response.json(); // parse response as JSON
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

