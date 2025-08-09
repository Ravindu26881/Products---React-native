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
import {
    Image,
    View,
    Platform
} from 'react-native';
import * as Font from 'expo-font';
import { FONTS } from './utils/fontUtils';

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
    <NavigationContainer>
      <Stack.Navigator
          screenOptions={{
              headerStyle: {
                  backgroundColor: 'rgb(62 48 36)', // header background
                  height: 100, // header height
              },
              headerTintColor: '#fff',       // back button and title color
              headerTitleStyle: {
                  fontWeight: '400',
              },
              headerTitleAlign: 'center'
          }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
              headerTitleAlign: 'center', // Optional: center align
              headerTitle: () => (
                  <View
                      style={{
                          paddingTop: Platform.select({ ios: 12, web: 12, default: 0 }),
                          paddingBottom: Platform.select({ ios: 12, web: 12, default: 0 }),
                      }}
                  >
                      <Image
                          source={require('./assets/logo-one-line.png')}
                          style={{
                              width: 120,
                              height: 60,
                              resizeMode: 'cover',
                              tintColor: '#fff',
                          }}
                      />
                  </View>
              ), }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
