import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { COLORS } from '../utils/colors';

export default function CartIcon({ navigation, style, iconColor = 'white', badgeColor = '#f59e0b' }) {
  const { totalItems } = useCart();

  const handlePress = () => {
    navigation.navigate('Cart');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image 
          source={require('../assets/icons/Cart.png')} 
          style={[styles.cartIcon, { tintColor: iconColor }]} 
        />
        
        {totalItems > 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {totalItems > 99 ? '99+' : totalItems.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  cartIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
