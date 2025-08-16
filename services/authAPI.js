import { Platform } from 'react-native';
import { getAPIBaseURL } from '../config/api';

class AuthAPI {
  constructor() {
    this.baseURL = 'https://products-api-production-124f.up.railway.app';
    console.log('AuthAPI initialized with base URL:', this.baseURL);
  }

  // Generic API request method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('Request body:', options.body);
      }

      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log(`API Response (${response.status}):`, data);

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection.',
          originalError: error,
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        originalError: error,
      };
    }
  }

  // Check if username exists
  async checkUsername(username) {
    return await this.makeRequest('/users/check-username', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim() }),
    });
  }

  // Authenticate user (login)
  async authenticateUser(username, password) {
    return await this.makeRequest('/users/authenticate', {
      method: 'POST',
      body: JSON.stringify({ 
        username: username.trim(), 
        password 
      }),
    });
  }

  // Create new user (registration)
  async createUser(userData) {
    const { username, password, name, email, phone, address } = userData;
    
    return await this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        username: username.trim(),
        password,
        name: name?.trim() || undefined,
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
      }),
    });
  }

  // Utility method to validate API connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.warn('API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new AuthAPI();

// Export class for testing
export { AuthAPI };
