import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
    Alert
} from 'react-native';
import { COLORS } from '../utils/colors';
import { getFontFamily } from '../utils/fontUtils';
import { useCart } from '../contexts/CartContext';
import CartActionModal from './CartActionModal';

export default function ProductItem({ 
  product, 
  onPress, 
  width,
    navigation,
  showStoreName = false,
  storeId = null,
  storeName = null,
  containerStyle = {} 
}) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { addToCart, isItemInCart, getItemQuantityInCart, removeFromCart, updateQuantity, getCartItemId } = useCart();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent triggering the main onPress
    if (!product || !storeId || addingToCart) return;

    // Check if item is already in cart
    if (isItemInCart(product._id, storeId)) {
      setShowCartModal(true);
      return;
    }

    console.log(product)
    setAddingToCart(true);
    try {
      await addToCart(product, 1, storeId, storeName || product.storeName);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    setShowCartModal(false);
    setAddingToCart(true);
    try {
      await addToCart(product, 1, storeId, storeName || product.storeName);
    } catch (error) {
      console.error('Error increasing quantity:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRemoveFromCart = () => {
    setShowCartModal(false);

    // Find the cart item ID
    const cartItemId = getCartItemId(product._id, storeId);
    if (cartItemId) {
      removeFromCart(cartItemId)
    }
  };
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
          <View style={styles.actionButtons}>
            {storeId && (
              <TouchableOpacity 
                style={[
                  styles.cartButton,
                  addingToCart && styles.cartButtonDisabled
                ]}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                <Image 
                  source={
                    isItemInCart(product._id, storeId) 
                      ? require('../assets/icons/CartAdded.png')
                      : require('../assets/icons/Cart.png')
                  } 
                  style={[
                    styles.iconStyleCart,
                    isItemInCart(product._id, storeId) && styles.iconStyleCartAdded
                  ]} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => onPress(product)}
            >
              <Image source={require('../assets/icons/View.png')} style={styles.iconStyleBuy} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      <CartActionModal
          visible={showCartModal}
          onClose={() => setShowCartModal(false)}
          onIncreaseQuantity={handleIncreaseQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          product={product}
          storeName={storeName || product?.storeName}
          currentQuantity={getItemQuantityInCart(product?._id, storeId)}
      />
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
    borderWidth: 0,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    padding: 2,
  },
  cartButtonDisabled: {
    opacity: 0.6,
  },
  buyButton: {
    // Empty for now, matching the original design
  },
  iconStyleCart: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  iconStyleCartAdded: {
    tintColor: '#4CAF50', // Green color for added state
  },
  iconStyleBuy: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});
