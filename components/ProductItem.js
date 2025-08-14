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
        {showStoreName && product.storeName && (
            <View style={styles.storeBadge}>
              <Text style={[styles.storeBadgeText, { fontFamily: getFontFamily(storeId) }]}>
                {storeName}
              </Text>
            </View>
        )}
        <View style={styles.productPriceWrapper}>
          <View style={styles.productInfo}>
            <Text 
              style={[
                styles.productName, 
                storeId && !showStoreName && { fontFamily: getFontFamily(storeId) }
              ]} 
              numberOfLines={1}
            >
              {product.name}
            </Text>
            {/*{showStoreName && product.storeName && (*/}
            {/*    <Text style={styles.storeName} numberOfLines={1}>*/}
            {/*      from {product.storeName}*/}
            {/*    </Text>*/}
            {/*)}*/}
            <View style={styles.productBottomBarWrapper}>
              <Text style={styles.productPrice}>Rs.{product.price}/=</Text>
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
                {/*<TouchableOpacity*/}
                {/*    style={styles.buyButton}*/}
                {/*    onPress={() => onPress(product)}*/}
                {/*>*/}
                {/*  <Image source={require('../assets/icons/View.png')} style={styles.iconStyleBuy} />*/}
                {/*</TouchableOpacity>*/}
              </View>
            </View>

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
    // borderRadius: 10,
    // shadowColor: 'black',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.25,
    // shadowRadius: 10,
    // elevation: 5,
    borderWidth: 0,
    borderColor: COLORS.primaryWithOpacity,
    // backgroundColor: COLORS.primaryWithOpacity,
  },
  productImage: {
    width: '100%',
    height: 200,
    filter: 'brightness(0.9)',
    boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.3)",
  },
  productPriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    // backgroundColor: COLORS.primaryWithOpacity,
    // padding: 12,
    paddingVertical: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  storeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -42,
    marginBottom: 14,
    marginLeft: 4
  },
  productName: {
    fontSize: 16,
    // fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.textImportant,
    fontWeight: '400',
    marginBottom: 0,
  },
  storeName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    // fontStyle: 'italic',
    marginBottom: 4,
  },
  productBottomBarWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    tintColor: COLORS.textSecondary,
  },
  iconStyleCartAdded: {
    tintColor: '#4CAF50', // Green color for added state
  },
  iconStyleBuy: {
    width: 24,
    height: 24,
    tintColor: COLORS.textSecondary,
  },
});
