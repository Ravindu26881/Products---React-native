import { Platform } from 'react-native';

// Import AsyncStorage for mobile platforms
let AsyncStorage;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const CART_KEY = 'salesale_cart';
const USER_PREFERENCES_KEY = 'salesale_user_preferences';

class StorageService {
  // Generic storage methods that work across platforms
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, jsonValue);
        return true;
      } else {
        // Use AsyncStorage for mobile
        await AsyncStorage.setItem(key, jsonValue);
        return true;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async getItem(key) {
    try {
      let jsonValue;
      
      if (Platform.OS === 'web') {
        // Use localStorage for web
        jsonValue = localStorage.getItem(key);
      } else {
        // Use AsyncStorage for mobile
        jsonValue = await AsyncStorage.getItem(key);
      }
      
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Use AsyncStorage for mobile
        await AsyncStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  }

  async clear() {
    try {
      if (Platform.OS === 'web') {
        // Clear all localStorage items that start with our app prefix
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('salesale_')) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Use AsyncStorage for mobile
        await AsyncStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Cart-specific methods
  async saveCart(cartItems) {
    return await this.setItem(CART_KEY, cartItems);
  }

  async getCart() {
    const cart = await this.getItem(CART_KEY);
    return cart || [];
  }

  async clearCart() {
    return await this.removeItem(CART_KEY);
  }

  // User preferences (for future use with user accounts)
  async saveUserPreferences(preferences) {
    return await this.setItem(USER_PREFERENCES_KEY, preferences);
  }

  async getUserPreferences() {
    const preferences = await this.getItem(USER_PREFERENCES_KEY);
    return preferences || {};
  }

  // Migration method for future backend integration
  async migrateCartToBackend(userId, backendService) {
    try {
      const localCart = await this.getCart();
      if (localCart.length > 0) {
        // This will be implemented when backend integration is added
        console.log('Migrating cart to backend for user:', userId);
        console.log('Local cart items:', localCart);
        
        // Future implementation:
        // await backendService.syncCart(userId, localCart);
        // await this.clearCart(); // Clear local cart after successful sync
        
        return { success: true, itemCount: localCart.length };
      }
      return { success: true, itemCount: 0 };
    } catch (error) {
      console.error('Error migrating cart to backend:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new StorageService();
