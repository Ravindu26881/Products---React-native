import { useUser } from '../contexts/UserContext';

// Global object to expose user functions
let globalUserControl = null;

export const GlobalUserControl = () => {
  const userContext = useUser();
  
  // Expose user functions globally
  if (typeof window !== 'undefined') {
    // For web
    window.BazarioUser = {
      showLoginScreen: userContext.showLoginScreen,
      logout: userContext.logoutUser,
      getUser: () => userContext.user,
      isLoggedIn: () => userContext.isLoggedIn,
      isGuest: () => userContext.isGuest,
    };
  }
  
  // For React Native - expose through global object
  global.BazarioUser = {
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
  } else if (typeof window !== 'undefined' && window.BazarioUser) {
    window.BazarioUser.showLoginScreen();
  } else if (global.BazarioUser) {
    global.BazarioUser.showLoginScreen();
  } else {
    console.warn('GlobalUserControl not initialized yet');
  }
};

export const logoutUser = () => {
  if (globalUserControl) {
    globalUserControl.logoutUser();
  } else if (typeof window !== 'undefined' && window.BazarioUser) {
    window.BazarioUser.logout();
  } else if (global.BazarioUser) {
    global.BazarioUser.logout();
  } else {
    console.warn('GlobalUserControl not initialized yet');
  }
};

export const getCurrentUser = () => {
  if (globalUserControl) {
    return globalUserControl.user;
  } else if (typeof window !== 'undefined' && window.BazarioUser) {
    return window.BazarioUser.getUser();
  } else if (global.BazarioUser) {
    return global.BazarioUser.getUser();
  }
  return null;
};

export default GlobalUserControl;
