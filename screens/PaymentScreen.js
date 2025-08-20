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
  const { product, storeId, storeName } = route.params;
  const [ quantity, setQuantity]  = useState(1);
  const { showModal, showSuccess, showError } = useNotification();
  const { user,isLoggedIn, isGuest, showLoginScreen } = useUser();
  const {errorValue, setErrorValue} = useState(null);
  
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Order Details',
      headerTitleStyle: {
        fontFamily: getFontFamily(storeId),
        fontSize: 16,
      },
      headerStyle: {
        backgroundColor: COLORS.appBackground,
      },
      headerTintColor: COLORS.textPrimary,
    });
  }, [navigation, storeId]);

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
    const products = [
      {
        "productId": product._id,
        "quantity": quantity
      },
    ]
    try {
      await sendOrder(storeId, products, user._id)
      setLoading(false);
      showModal({
        title: 'Order Placed!',
        message: 'Your order for ' + product.name + ' has been placed successfully.\n\nThe seller will contact you shortly to arrange payment and delivery.',
        buttons: [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Products', { storeId, storeName }),
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
        {/* Product Summary */}
        <View style={styles.productSummary}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.storeName}>from {storeName}</Text>
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <Text style={styles.infoText}>
            Confirm the order and the seller will contact you to arrange payment and delivery.
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Price</Text>
            <Text style={styles.summaryValue}>{product.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>Contact seller</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{product.price}</Text>
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
              Place Order • {product.price}
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