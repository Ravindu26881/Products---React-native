import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import { useNotification } from '../components/NotificationSystem';
import { useUser } from '../contexts/UserContext';
import { sendOrder } from '../data/products';

export default function PaymentScreen({ navigation }) {
  const route = useRoute();
  const { products, storeId, storeName } = route.params;
  const [ quantity, setQuantity]  = useState(1);
  const { showModal, showSuccess, showError } = useNotification();
  const { user,isLoggedIn, isGuest, showLoginScreen } = useUser();
  const {errorValue, setErrorValue} = useState(null);
  
  const [loading, setLoading] = useState(false);

  // Group products by store
  const storeGroups = products.reduce((groups, item) => {
    const storeId = item.storeId;
    if (!groups[storeId]) {
      groups[storeId] = {
        storeId: storeId,
        storeName: item.storeName,
        products: []
      };
    }
    groups[storeId].products.push(item);
    return groups;
  }, {});

  const storeGroupsArray = Object.values(storeGroups);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: storeGroupsArray.length > 1 ? 'Order Summary' : 'Order Details',
      headerTitleStyle: {
        fontFamily: getFontFamily(storeGroupsArray[0]?.storeId || storeId),
        fontSize: 16,
      },
      headerStyle: {
        backgroundColor: COLORS.appBackground,
      },
      headerTintColor: COLORS.textPrimary,
    });
  }, [navigation, storeId, storeGroupsArray]);

  const processOrder = async () => {
    if (!isLoggedIn) {
        showModal({
            title: 'Login Required',
            message: 'You need to log in to place an order. Please log in or register to continue.',
            buttons: [
            {
                text: 'Log In',
                onPress: () => showLoginScreen(),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
            ],
        });
        return;
    }

    setLoading(true);
    
    try {
      // Send separate orders for each store
      for (const storeGroup of storeGroupsArray) {
        const orderProducts = storeGroup.products.map(product => ({
          "productId": product.product._id,
          "quantity": product.quantity
        }));
        await sendOrder(storeGroup.storeId, orderProducts, user._id);
      }
      
      setLoading(false);
      const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
      const storeCount = storeGroupsArray.length;
      const storeNames = storeGroupsArray.map(group => group.storeName);
      
      showModal({
        title: 'Orders Placed!',
        message: `Your orders for ${totalItems} items from ${storeCount > 1 ? `${storeCount} stores (${storeNames.join(', ')})` : storeNames[0]} have been placed successfully.\n\nThe sellers will contact you shortly to arrange payment and delivery.`,
        buttons: [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      });
    } catch (error) {
        setLoading(false);
        console.error('Error processing order:', error);
        showError('Failed to place order. Please try again later.');
        return;
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Summary - Grouped by Store */}
        {storeGroupsArray.map((storeGroup, storeIndex) => (
          <View key={`store_${storeGroup.storeId}`} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {storeGroupsArray.length > 1 ? `${storeGroup.storeName} (${storeGroup.products.length} items)` : `Order Items (${products.length})`}
            </Text>
            {storeGroup.products.map((item, index) => (
              <View key={`${item.product._id}_${storeGroup.storeId}_${index}`} style={styles.productSummary}>
                <Image 
                  source={{ uri: item.product.image }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.productPrice}>{item.product.price}</Text>
                  {storeGroupsArray.length === 1 && (
                    <Text style={styles.storeName}>from {item.storeName}</Text>
                  )}
                  <Text style={styles.quantityText}>Quantity: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <Text style={styles.infoText}>
            Confirm the order{storeGroupsArray.length > 1 ? 's' : ''} and the seller{storeGroupsArray.length > 1 ? 's' : ''} will contact you to arrange payment and delivery.
            {storeGroupsArray.length > 1 && '\n\nNote: Separate orders will be placed for each store.'}
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {storeGroupsArray.map((storeGroup, storeIndex) => (
            <View key={`summary_store_${storeGroup.storeId}`}>
              {storeGroupsArray.length > 1 && (
                <Text style={styles.storeSubtitle}>{storeGroup.storeName}:</Text>
              )}
              {storeGroup.products.map((item, index) => {
                const priceString = item.product.price.toString();
                const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
                const itemTotal = priceNumber * item.quantity;
                return (
                  <View key={`summary_${item.product._id}_${storeGroup.storeId}_${index}`} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{item.product.name} (x{item.quantity})</Text>
                    <Text style={styles.summaryValue}>Rs.{itemTotal.toFixed(2)}/=</Text>
                  </View>
                );
              })}
              {storeGroupsArray.length > 1 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal - {storeGroup.storeName}</Text>
                  <Text style={styles.summaryValue}>
                    Rs.{storeGroup.products.reduce((total, item) => {
                      const priceString = item.product.price.toString();
                      const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
                      return total + (priceNumber * item.quantity);
                    }, 0).toFixed(2)}/=
                  </Text>
                </View>
              )}
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {storeGroupsArray.length > 1 ? 'Contact sellers' : 'Contact seller'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rs.{products.reduce((total, item) => {
                const priceString = item.product.price.toString();
                const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
                return total + (priceNumber * item.quantity);
              }, 0).toFixed(2)}/=
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={processOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.orderButtonText}>
              Place Order • Rs.{products.reduce((total, item) => {
                const priceString = item.product.price.toString();
                const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
                return total + (priceNumber * item.quantity);
              }, 0).toFixed(2)}/=
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  productSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnWhite,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textImportant,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.textOnWhite,
  },
  quantityText: {
    fontSize: 14,
    color: COLORS.textImportant,
    fontWeight: '500',
    marginTop: 3,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
    marginBottom: 15,
  },
  storeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textImportant,
    marginBottom: 10,
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textOnWhite,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
    color: COLORS.textOnWhite,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textOnWhite,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textOnWhite,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    backgroundColor: COLORS.appBackground,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  orderButton: {
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonDisabled: {
    opacity: 0.6,
  },
  orderButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});