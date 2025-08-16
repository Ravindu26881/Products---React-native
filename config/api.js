import { Platform } from 'react-native';

// API Configuration
// Update these URLs to match your backend server

export const API_CONFIG = {
  // Development URLs
  DEVELOPMENT: {
    WEB: 'http://localhost:3000',        // Web development server
    MOBILE: 'http://10.0.2.2:3000',     // Android emulator (change to your local IP for iOS/device)
    IOS_DEVICE: 'http://192.168.1.100:3000', // Replace with your computer's IP address
  },
  
  // Production URL
  PRODUCTION: 'https://your-production-api.com', // Replace with your production API URL
  
  // API Endpoints
  ENDPOINTS: {
    CHECK_USERNAME: '/users/check-username',
    AUTHENTICATE: '/users/authenticate',
    CREATE_USER: '/users',
    HEALTH_CHECK: '/health', // Optional health check endpoint
  },
};

// Helper to get the correct API URL based on platform and environment
export const getAPIBaseURL = () => {
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // Development URLs
    if (Platform.OS === 'web') {
      return API_CONFIG.DEVELOPMENT.WEB;
    } else if (Platform.OS === 'android') {
      return API_CONFIG.DEVELOPMENT.MOBILE; // 10.0.2.2 for emulator
    } else if (Platform.OS === 'ios') {
      // For iOS simulator, use localhost
      // For iOS device, use your computer's IP address
      return API_CONFIG.DEVELOPMENT.WEB; // or API_CONFIG.DEVELOPMENT.IOS_DEVICE for device
    }
  }
  
  return API_CONFIG.PRODUCTION;
};

export default API_CONFIG;
