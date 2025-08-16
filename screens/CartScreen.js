import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { COLORS } from '../utils/colors';
import { getFontFamily } from '../utils/fontUtils';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useNotification } from '../components/NotificationSystem';

const { width: screenWidth } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const { 
    items, 
    loading, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const [processingItemId, setProcessingItemId] = useState(null);
  const { showModal, showSuccess, showError } = useNotification();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (processingItemId === itemId) return;
    
    setProcessingItemId(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleRemoveItem = (itemId, productName) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to remove "${productName}" from your cart?`);
      if (confirmed) {
        removeFromCart(itemId);
      }
    } else {
      showModal({
        title: 'Remove Item',
        message: `Are you sure you want to remove "${productName}" from your cart?`,
        type: 'warning',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          { 
            text: 'Remove',
            onPress: () => {
              removeFromCart(itemId);
              showSuccess('Item removed from cart');
            }
          },
        ]
      });
    }
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to remove all items from your cart?');
      if (confirmed) {
        clearCart();
      }
    } else {
      showModal({
        title: 'Clear Cart',
        message: 'Are you sure you want to remove all items from your cart?',
        type: 'warning',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          { 
            text: 'Clear All',
            onPress: () => {
              clearCart();
              showSuccess('Cart cleared successfully');
            }
          },
        ]
      });
    }
  };

  const handleCheckout = () => {
    // For now, navigate to payment with cart items
    navigation.navigate('Payment', {
      cartItems: items,
      totalPrice: totalPrice,
      isCartCheckout: true,
    });
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `Rs.${price.toFixed(2)}/=`;
    }
    return 'Rs.' + price + '/=';
  };

  const renderCartItem = ({ item }) => {
    const { id, product, quantity, storeId, storeName } = item;
    const isProcessing = processingItemId === id;

    // Parse price for calculations
    const priceString = product.price.toString();
    const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    const itemTotal = priceNumber * quantity;

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.itemContent}
          onPress={() => navigation.navigate('ProductDetail', {
            productId: product._id,
            storeId: storeId,
            storeName: storeName,
          })}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          <View style={styles.productInfo}>
            <Text 
              style={[
                styles.productName,
                { fontFamily: getFontFamily(storeId) }
              ]} 
              numberOfLines={2}
            >
              {product.name}
            </Text>
            
            <Text style={styles.storeName} numberOfLines={1}>
              from {storeName}
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.unitPrice}>{formatPrice(product.price)}</Text>
              <Text style={styles.itemTotal}>
                Total: {formatPrice(itemTotal)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (quantity <= 1 || isProcessing) && styles.quantityButtonDisabled
            ]}
            onPress={() => handleQuantityChange(id, quantity - 1)}
            disabled={quantity <= 1 || isProcessing}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity
            style={[
              styles.quantityButton,
              isProcessing && styles.quantityButtonDisabled
            ]}
            onPress={() => handleQuantityChange(id, quantity + 1)}
            disabled={isProcessing}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(id, product.name)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add some products to your cart to see them here."
        actionText="Continue Shopping"
        onActionPress={() => navigation.navigate('Home')}
        icon="🛒"
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
        </View>
        
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        style={styles.cartList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartListContent}
      />

      {/* Bottom Summary */}
      <View style={styles.bottomSummary}>
        <View style={styles.summaryInfo}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalPrice)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.appBackground,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textOnWhite,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor:  COLORS.appBackground,
    borderRadius: 18,
  },
  clearButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    paddingBottom: 20,
  },
  cartItem: {
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'column',
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnWhite,
    lineHeight: 20,
  },
  storeName: {
    fontSize: 12,
    color: COLORS.textOnWhite,
    opacity: 0.7,
    fontStyle: 'italic',
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPrice: {
    fontSize: 14,
    color: COLORS.textImportant,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 14,
    color: COLORS.textOnWhite,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSummary: {
    backgroundColor: COLORS.appBackground,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  summaryInfo: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textImportant,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
