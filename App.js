import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import StoresScreen from './screens/StoresScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import PaymentScreen from './screens/PaymentScreen';
import ContactSellerScreen from './screens/ContactSellerScreen';
import AllProductsScreen from './screens/AllProductsScreen';
import CartScreen from './screens/CartScreen';
import {
    Image,
    View,
    Platform
} from 'react-native';
import * as Font from 'expo-font';
import { FONTS } from './utils/fontUtils';
import { COLORS } from './utils/colors';
import { CartProvider } from './contexts/CartContext';

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded] = Font.useFonts({
        [FONTS.CAKE_BY_DEE]: require('./assets/fonts/CakeByDee.ttf'),
        [FONTS.FASHION_HOME]: require('./assets/fonts/FashionHome.ttf'),
    });

    if (!fontsLoaded) {
        return null; // or a loading screen
    }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary, // header background
                    height: 100, // header height,
                    elevation: 0,               // Android: remove shadow/border
                    borderBottomWidth: 0,
                },
                headerTintColor: COLORS.textInverse,       // back button and title color
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
          name="AllProducts" 
          component={AllProductsScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen}
          options={{
            headerShown: false,
          }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
