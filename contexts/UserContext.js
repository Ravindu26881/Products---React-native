import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../utils/storage';

const UserContext = createContext();

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOAD_USER: 'LOAD_USER',
  LOGIN_USER: 'LOGIN_USER',
  SKIP_LOGIN: 'SKIP_LOGIN',
  LOGOUT_USER: 'LOGOUT_USER',
  UPDATE_USER: 'UPDATE_USER',
  FORCE_LOGIN: 'FORCE_LOGIN',
};

// Initial state
const initialState = {
  user: null,
  isLoggedIn: false,
  isGuest: false,
  hasSeenLogin: false,
  loading: true,
  needsLogin: true, // Controls whether to show login screen
};

// Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case USER_ACTIONS.LOAD_USER:
      const userData = action.payload;
      const hasUserData = userData && (userData.isLoggedIn || userData.isGuest);
      
      return {
        ...state,
        user: userData?.user || null,
        isLoggedIn: !!userData?.isLoggedIn,
        isGuest: !!userData?.isGuest,
        hasSeenLogin: !!userData?.hasSeenLogin,
        loading: false,
        needsLogin: !hasUserData, // Don't need login if user has data
      };

    case USER_ACTIONS.LOGIN_USER:
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
        isGuest: false,
        hasSeenLogin: true,
        needsLogin: false,
      };

    case USER_ACTIONS.SKIP_LOGIN:
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        isGuest: true,
        hasSeenLogin: true,
        needsLogin: false,
      };

    case USER_ACTIONS.LOGOUT_USER:
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        isGuest: false,
        hasSeenLogin: true,
        needsLogin: false, // Don't force login after logout
      };

    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case USER_ACTIONS.FORCE_LOGIN:
      return {
        ...state,
        needsLogin: true,
      };

    default:
      return state;
  }
};

// Context Provider
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Save user data whenever state changes
  useEffect(() => {
    if (!state.loading && state.hasSeenLogin) {
      saveUserToStorage();
    }
  }, [state.user, state.isLoggedIn, state.isGuest, state.hasSeenLogin, state.loading]);

  const loadUserFromStorage = async () => {
    try {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      const savedUserData = await StorageService.getUserData();
      dispatch({ type: USER_ACTIONS.LOAD_USER, payload: savedUserData });
    } catch (error) {
      console.error('Error loading user from storage:', error);
      dispatch({ type: USER_ACTIONS.LOAD_USER, payload: null });
    }
  };

  const saveUserToStorage = async () => {
    try {
      const userData = {
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isGuest: state.isGuest,
        hasSeenLogin: state.hasSeenLogin,
        lastUpdated: new Date().toISOString(),
      };
      await StorageService.saveUserData(userData);
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const loginUser = async (userData) => {
    dispatch({ type: USER_ACTIONS.LOGIN_USER, payload: userData });
  };

  const skipLogin = async () => {
    dispatch({ type: USER_ACTIONS.SKIP_LOGIN });
  };

  const logoutUser = async () => {
    try {
      await StorageService.clearUserData();
      dispatch({ type: USER_ACTIONS.LOGOUT_USER });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: userData });
  };

  // Global function to force login screen to appear
  const showLoginScreen = () => {
    dispatch({ type: USER_ACTIONS.FORCE_LOGIN });
  };

  // Helper functions
  const isAuthenticated = () => state.isLoggedIn;
  const shouldShowLoginScreen = () => state.needsLogin && !state.loading;

  const value = {
    // State
    ...state,
    
    // Actions
    loginUser,
    skipLogin,
    logoutUser,
    updateUser,
    showLoginScreen, // Global function to show login screen
    
    // Helpers
    isAuthenticated,
    shouldShowLoginScreen,
    loadUserFromStorage,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
