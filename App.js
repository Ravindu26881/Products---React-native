import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import StoresScreen from './screens/StoresScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import PaymentScreen from './screens/PaymentScreen';
import ContactSellerScreen from './screens/ContactSellerScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import {
    Image,
    View,
    Platform
} from 'react-native';
import * as Font from 'expo-font';
import { FONTS } from './utils/fontUtils';
import { COLORS } from './utils/colors';
import { CartProvider } from './contexts/CartContext';
import { UserProvider, useUser } from './contexts/UserContext';
import LoadingState from './components/LoadingState';
import GlobalUserControl from './components/GlobalUserControl';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Stores: 'stores',
      Products: 'products/:storeId/:storeName',
      ProductDetail: 'product/:storeId/:storeName/:productId',
      Payment: 'payment',
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
          name="Payment" 
          component={PaymentScreen}
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
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
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

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <GlobalUserControl />
        <AppContent />
      </UserProvider>
    </SafeAreaProvider>
  );
}
