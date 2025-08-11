import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../utils/storage';

// Cart action types
const CART_ACTIONS = {
  LOAD_CART: 'LOAD_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
};

// Initial state
const initialState = {
  items: [],
  loading: true,
  totalItems: 0,
  totalPrice: 0,
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      const loadedItems = action.payload || [];
      return {
        ...state,
        items: loadedItems,
        loading: false,
        totalItems: calculateTotalItems(loadedItems),
        totalPrice: calculateTotalPrice(loadedItems),
      };

    case CART_ACTIONS.ADD_TO_CART: {
      const { product, quantity = 1, storeId, storeName } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === product._id && item.storeId === storeId
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const cartItem = {
          id: `${product._id}_${storeId}_${Date.now()}`, // Unique cart item ID
          product,
          quantity,
          storeId,
          storeName,
          addedAt: new Date().toISOString(),
        };
        updatedItems = [...state.items, cartItem];
      }

      return {
        ...state,
        items: updatedItems,
        totalItems: calculateTotalItems(updatedItems),
        totalPrice: calculateTotalPrice(updatedItems),
      };
    }

    case CART_ACTIONS.REMOVE_FROM_CART: {
      const updatedItems = state.items.filter(item => item.id !== action.payload.itemId);
      return {
        ...state,
        items: updatedItems,
        totalItems: calculateTotalItems(updatedItems),
        totalPrice: calculateTotalPrice(updatedItems),
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const updatedItems = state.items.filter(item => item.id !== itemId);
        return {
          ...state,
          items: updatedItems,
          totalItems: calculateTotalItems(updatedItems),
          totalPrice: calculateTotalPrice(updatedItems),
        };
      }

      const updatedItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: calculateTotalItems(updatedItems),
        totalPrice: calculateTotalPrice(updatedItems),
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

// Helper functions
const calculateTotalItems = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => {
    // Parse price string (remove currency symbols and convert to number)
    const priceString = item.product.price.toString();
    const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    return total + (priceNumber * item.quantity);
  }, 0);
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever cart state changes
  useEffect(() => {
    if (!state.loading) {
      saveCartToStorage();
    }
  }, [state.items, state.loading]);

  const loadCartFromStorage = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const savedCart = await StorageService.getCart();
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: [] });
    }
  };

  const saveCartToStorage = async () => {
    try {
      await StorageService.saveCart(state.items);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  // Cart actions
  const addToCart = (product, quantity = 1, storeId, storeName) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity, storeId, storeName },
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { itemId },
    });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity },
    });
  };

  const clearCart = async () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    await StorageService.clearCart();
  };

  const getItemQuantityInCart = (productId, storeId) => {
    const item = state.items.find(
      item => item.product._id === productId && item.storeId === storeId
    );
    return item ? item.quantity : 0;
  };

  const isItemInCart = (productId, storeId) => {
    return state.items.some(
      item => item.product._id === productId && item.storeId === storeId
    );
  };

  const getCartItemId = (productId, storeId) => {
    const item = state.items.find(
      item => item.product._id === productId && item.storeId === storeId
    );
    return item ? item.id : null;
  };

  // Future backend integration helper
  const migrateToBackend = async (userId, backendService) => {
    try {
      const result = await StorageService.migrateCartToBackend(userId, backendService);
      if (result.success) {
        // Reload cart from backend or clear local cart
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
      }
      return result;
    } catch (error) {
      console.error('Error migrating cart to backend:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    items: state.items,
    loading: state.loading,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantityInCart,
    isItemInCart,
    getCartItemId,
    loadCartFromStorage,
    
    // Future backend integration
    migrateToBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
