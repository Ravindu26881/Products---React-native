import { useUser } from '../contexts/UserContext';

// Global object to expose user functions
let globalUserControl = null;

export const GlobalUserControl = () => {
  const userContext = useUser();
  
  // Expose user functions globally
  if (typeof window !== 'undefined') {
    // For web
    window.SaleSaleUser = {
      showLoginScreen: userContext.showLoginScreen,
      logout: userContext.logoutUser,
      getUser: () => userContext.user,
      isLoggedIn: () => userContext.isLoggedIn,
      isGuest: () => userContext.isGuest,
    };
  }
  
  // For React Native - expose through global object
  global.SaleSaleUser = {
    showLoginScreen: userContext.showLoginScreen,
    logout: userContext.logoutUser,
    getUser: () => userContext.user,
    isLoggedIn: () => userContext.isLoggedIn,
    isGuest: () => userContext.isGuest,
  };

  globalUserControl = userContext;
  
  return null; // This component doesn't render anything
};

// Export functions that can be called from anywhere
export const showLoginScreen = () => {
  if (globalUserControl) {
    globalUserControl.showLoginScreen();
  } else if (typeof window !== 'undefined' && window.SaleSaleUser) {
    window.SaleSaleUser.showLoginScreen();
  } else if (global.SaleSaleUser) {
    global.SaleSaleUser.showLoginScreen();
  } else {
    console.warn('GlobalUserControl not initialized yet');
  }
};

export const logoutUser = () => {
  if (globalUserControl) {
    globalUserControl.logoutUser();
  } else if (typeof window !== 'undefined' && window.SaleSaleUser) {
    window.SaleSaleUser.logout();
  } else if (global.SaleSaleUser) {
    global.SaleSaleUser.logout();
  } else {
    console.warn('GlobalUserControl not initialized yet');
  }
};

export const getCurrentUser = () => {
  if (globalUserControl) {
    return globalUserControl.user;
  } else if (typeof window !== 'undefined' && window.SaleSaleUser) {
    return window.SaleSaleUser.getUser();
  } else if (global.SaleSaleUser) {
    return global.SaleSaleUser.getUser();
  }
  return null;
};

export default GlobalUserControl;
