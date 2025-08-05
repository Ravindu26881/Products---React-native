import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ProductsScreen from './screens/ProductsScreen';
import {
    Image,
    View,
    Platform
} from 'react-native';
import * as Font from 'expo-font';

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded] = Font.useFonts({
        '689234aecf16a62557e35719': require('./assets/fonts/CakeByDee.ttf'),
        '68924f8674acc9f4b7cf8028': require('./assets/fonts/FashionHome.ttf'),
    });
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
          name="Products" 
          component={ProductsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
