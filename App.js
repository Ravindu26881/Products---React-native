import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import StoresScreen from './screens/StoresScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import OrderScreen from './screens/PaymentScreen';
import ContactSellerScreen from './screens/ContactSellerScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import {
    Image,
    View,
    Platform
} from 'react-native';
import * as Font from 'expo-font';
import { FONTS } from './utils/fontUtils';
import { COLORS } from './utils/colors';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { UserProvider, useUser } from './contexts/UserContext';
import LoadingState from './components/LoadingState';
import GlobalUserControl from './components/GlobalUserControl';
import PWAInstallModal from './components/PWAInstallModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationProvider } from './components/NotificationSystem';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Stores: 'stores',
      Products: 'products/:storeId/:storeName',
      ProductDetail: 'product/:storeId/:storeName/:productId',
      Order: 'payment',
      ContactSeller: 'contact/:storeId/:storeName/:productId',
      Cart: 'cart',
    },
  },
  enabled: true,
};

// Main App Navigator - only shown after login/skip
function AppNavigator() {
  const navigationRef = useRef(null);

  return (
    <OrderProvider>
      <CartProvider>
        <NavigationContainer 
          ref={navigationRef}
          linking={linking}
          fallback={<View style={{ flex: 1, backgroundColor: COLORS.primary }} />}
        >
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.appBackground,
                    height: 100,
                    elevation: 0,
                    borderBottomWidth: 0,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: '400',
                },
                headerTitleAlign: 'center'
            }}
        >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Stores" 
          component={StoresScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen}
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Order"
          component={OrderScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="ContactSeller" 
          component={ContactSellerScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen}
          options={{
            headerShown: true,
            title: 'Profile',
          }}
        />
        </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </OrderProvider>
  );
}

// App Content - handles login/main app logic
function AppContent() {
  const { loading, shouldShowLoginScreen } = useUser();
  const [fontsLoaded] = Font.useFonts({
      [FONTS.CAKE_BY_DEE]: require('./assets/fonts/CakeByDee.ttf'),
      [FONTS.FASHION_HOME]: require('./assets/fonts/FashionHome.ttf'),
  });

  if (!fontsLoaded || loading) {
    return <LoadingState />;
  }

  if (shouldShowLoginScreen()) {
    return <LoginScreen />;
  }

  return <AppNavigator />;
}

// Main App Component
export default function App() {
    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleBeforeUnload = (event) => {
                return;
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            // Register service worker for PWA
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registered successfully:', registration);
                        
                        // Debug PWA installation criteria
                        setTimeout(() => {
                            console.log('🔍 PWA Debug Info:');
                            console.log('- Service Worker:', !!navigator.serviceWorker.controller);
                            console.log('- HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
                            console.log('- Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
                            console.log('- User agent:', navigator.userAgent);
                            
                            // Check manifest
                            fetch('/manifest.json')
                                .then(res => res.json())
                                .then(manifest => {
                                    console.log('✅ Manifest loaded:', manifest.name);
                                })
                                .catch(err => {
                                    console.error('❌ Manifest failed to load:', err);
                                });
                        }, 2000);
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker registration failed:', error);
                    });
            }

            // Add global debug function
            window.debugPWA = () => {
                console.log('🔧 Manual PWA Debug:');
                console.log('- beforeinstallprompt supported:', 'onbeforeinstallprompt' in window);
                console.log('- Service Worker supported:', 'serviceWorker' in navigator);
                console.log('- Service Worker active:', !!navigator.serviceWorker.controller);
                console.log('- HTTPS/localhost:', location.protocol === 'https:' || location.hostname === 'localhost');
                console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
                console.log('- Location:', location.href);
                
                // Test manifest
                fetch('/manifest.json')
                    .then(res => res.ok ? res.json() : Promise.reject('Not found'))
                    .then(manifest => console.log('✅ Manifest:', manifest))
                    .catch(err => console.error('❌ Manifest error:', err));
            };

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, []);

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <UserProvider>
          <GlobalUserControl />
          <AppContent />
          <PWAInstallModal />
        </UserProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
