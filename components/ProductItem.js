import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../utils/colors';
import { getFontFamily } from '../utils/fontUtils';

export default function ProductItem({ 
  product, 
  onPress, 
  width,
  showStoreName = false,
  storeId = null,
  containerStyle = {} 
}) {
  return (
    <View style={[styles.productItem, { width }, containerStyle]}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => onPress(product)}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productPriceWrapper}>
          <View style={styles.productInfo}>
            <Text 
              style={[
                styles.productName, 
                storeId && { fontFamily: getFontFamily(storeId) }
              ]} 
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            {showStoreName && product.storeName && (
              <Text style={styles.storeName} numberOfLines={1}>
                from {product.storeName}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => onPress(product)}
          >
            <Image source={require('../assets/icons/View.png')} style={styles.iconStyleBuy} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  productItem: {
    overflow: 'hidden',
    marginBottom: 0,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.primaryWithOpacity,
    backgroundColor: COLORS.primaryWithOpacity,
  },
  productImage: {
    width: '100%',
    height: 200,
    boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.3)",
  },
  productPriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.primaryWithOpacity,
    padding: 12,
    paddingVertical: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 0,
  },
  storeName: {
    fontSize: 12,
    color: COLORS.white70,
    fontStyle: 'italic',
    marginTop: 4,
  },
  buyButton: {
    // Empty for now, matching the original design
  },
  iconStyleBuy: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});
