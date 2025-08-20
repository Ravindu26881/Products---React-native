import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../utils/storage';

// Order action types
const ORDER_ACTIONS = {
  SET_ORDER_DATA: 'SET_ORDER_DATA',
  LOAD_ORDER_DATA: 'LOAD_ORDER_DATA',
  CLEAR_ORDER_DATA: 'CLEAR_ORDER_DATA',
  UPDATE_PRODUCTS: 'UPDATE_PRODUCTS',
  SET_LOADING: 'SET_LOADING',
};

// Initial state
const initialState = {
  products: [],
  storeId: null,
  storeName: null,
  orderType: null, // 'single' for buy now, 'cart' for cart checkout
  loading: true,
};

// Order reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_ORDER_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case ORDER_ACTIONS.LOAD_ORDER_DATA:
      const loadedData = action.payload;
      return {
        ...state,
        products: loadedData?.products || [],
        storeId: loadedData?.storeId || null,
        storeName: loadedData?.storeName || null,
        orderType: loadedData?.orderType || null,
        loading: false,
      };

    case ORDER_ACTIONS.UPDATE_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };

    case ORDER_ACTIONS.CLEAR_ORDER_DATA:
      return {
        ...initialState,
        loading: false,
      };

    case ORDER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const OrderContext = createContext();

// Order provider component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load order data from storage on app start
  useEffect(() => {
    loadOrderFromStorage();
  }, []);

  // Save order data to storage whenever order state changes
  useEffect(() => {
    if (!state.loading && (state.products.length > 0 || state.storeId || state.storeName)) {
      saveOrderToStorage();
    }
  }, [state.products, state.storeId, state.storeName, state.orderType, state.loading]);

  const loadOrderFromStorage = async () => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      const savedOrderData = await StorageService.getOrderData();
      dispatch({ type: ORDER_ACTIONS.LOAD_ORDER_DATA, payload: savedOrderData });
    } catch (error) {
      console.error('Error loading order from storage:', error);
      dispatch({ type: ORDER_ACTIONS.LOAD_ORDER_DATA, payload: null });
    }
  };

  const saveOrderToStorage = async () => {
    try {
      const orderData = {
        products: state.products,
        storeId: state.storeId,
        storeName: state.storeName,
        orderType: state.orderType,
      };
      await StorageService.saveOrderData(orderData);
    } catch (error) {
      console.error('Error saving order to storage:', error);
    }
  };

  // Set order data for payment
  const setOrderData = (orderData) => {
    dispatch({
      type: ORDER_ACTIONS.SET_ORDER_DATA,
      payload: orderData,
    });
  };

  // Update products in order
  const updateProducts = (products) => {
    dispatch({
      type: ORDER_ACTIONS.UPDATE_PRODUCTS,
      payload: products,
    });
  };

  // Clear order data
  const clearOrderData = async () => {
    try {
      await StorageService.clearOrderData();
      dispatch({ type: ORDER_ACTIONS.CLEAR_ORDER_DATA });
    } catch (error) {
      console.error('Error clearing order data:', error);
    }
  };

  // Set single product order (for Buy Now)
  const setSingleProductOrder = (product, storeId, storeName, quantity = 1) => {
    const orderData = {
      products: [{ 
        product: product, 
        quantity: quantity, 
        storeId: storeId, 
        storeName: storeName 
      }],
      storeId: storeId,
      storeName: storeName,
      orderType: 'single',
    };
    setOrderData(orderData);
  };

  // Set cart order (for cart checkout)
  const setCartOrder = (cartItems) => {
    // Group products by store
    const storeGroups = cartItems.reduce((groups, item) => {
      const storeId = item.storeId;
      if (!groups[storeId]) {
        groups[storeId] = {
          storeId: storeId,
          storeName: item.storeName,
          products: []
        };
      }
      groups[storeId].products.push({
        product: item.product,
        quantity: item.quantity,
        storeId: item.storeId,
        storeName: item.storeName,
      });
      return groups;
    }, {});

    const storeGroupsArray = Object.values(storeGroups);
    const allProducts = storeGroupsArray.flatMap(group => group.products);

    const orderData = {
      products: allProducts,
      storeId: storeGroupsArray.length === 1 ? storeGroupsArray[0].storeId : null,
      storeName: storeGroupsArray.length === 1 ? storeGroupsArray[0].storeName : null,
      orderType: 'cart',
    };
    setOrderData(orderData);
  };

  const value = {
    // State
    products: state.products,
    storeId: state.storeId,
    storeName: state.storeName,
    orderType: state.orderType,
    loading: state.loading,
    
    // Actions
    setOrderData,
    updateProducts,
    clearOrderData,
    setSingleProductOrder,
    setCartOrder,
    loadOrderFromStorage,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
