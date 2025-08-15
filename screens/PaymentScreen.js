import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import { PAYHERE_CONFIG, generateOrderId, formatAmount } from '../config/payhere';
import PayHereWebView from '../components/PayHereWebView';

export default function PaymentScreen({ navigation }) {
  const route = useRoute();
  const { product, storeId, storeName } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('payhere');
  const [showPayHereWebView, setShowPayHereWebView] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    // Billing Address
    address: '',
    city: '',
    zipCode: '',
    country: 'Sri Lanka',
    // Contact Info
    customerName: '',
    email: '',
    phone: '',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Secure Payment',
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

  // Card formatting functions removed - not needed for PayHere-only integration

  const validateForm = () => {
    // PayHere requires basic customer information
    if (!formData.customerName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    
    return true;
  };

  const processPayHerePayment = () => {
    const paymentObject = {
      sandbox: PAYHERE_CONFIG.sandbox,
      merchant_id: PAYHERE_CONFIG.merchantId,
      notify_url: PAYHERE_CONFIG.notifyUrl,
      order_id: generateOrderId(),
      items: product.name,
      amount: formatAmount(product.price),
      currency: PAYHERE_CONFIG.currency,
      first_name: formData.customerName.split(' ')[0] || "Customer",
      last_name: formData.customerName.split(' ').slice(1).join(' ') || "Name",
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: PAYHERE_CONFIG.country,
      delivery_address: formData.address,
      delivery_city: formData.city,
      delivery_country: PAYHERE_CONFIG.country,
      custom_1: `store_${storeId}`,
      custom_2: `product_${product._id || product.id}`
    };

    // Debug logging for testing
    console.log("🔍 PayHere Payment Object Debug:");
    console.log("================================");
    Object.keys(paymentObject).forEach(key => {
      console.log(`${key}: ${paymentObject[key]}`);
    });
    console.log("================================");

    // Store payment data and show WebView
    setPaymentData(paymentObject);
    setShowPayHereWebView(true);
    setLoading(false);
  };

  const handlePayHereSuccess = (message) => {
    console.log("✅ PayHere Payment Completed:", message);
    setShowPayHereWebView(false);
    Alert.alert(
      'Payment Successful! 🎉',
      `Your order for "${product.name}" has been confirmed.\nYou will receive a confirmation email shortly.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => navigation.navigate('Products', { storeId, storeName }),
        },
        {
          text: 'View Order',
          onPress: () => {
            Alert.alert('Order Details', 'Order tracking feature coming soon!');
          },
          style: 'default',
        },
      ]
    );
  };

  const handlePayHereError = (error) => {
    console.error("❌ PayHere Payment Error:", error);
    setShowPayHereWebView(false);
    Alert.alert("Payment Failed", `Error: ${error}`);
  };

  const handlePayHereClose = () => {
    console.log("ℹ️ PayHere Payment Dismissed");
    setShowPayHereWebView(false);
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Process PayHere payment (only payment method available)
    processPayHerePayment();
  };

  const renderPaymentMethodSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            styles.selectedPaymentMethod,
          ]}
          disabled={true}
        >
          <Text style={styles.paymentMethodText}>💳 PayHere</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Card form removed - PayHere handles payment method selection internally

  const renderContactForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.customerName}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, customerName: text }))
        }
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={formData.email}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, email: text }))
        }
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, phone: text }))
        }
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderBillingForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Billing Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street Address"
        value={formData.address}
        onChangeText={(text) => 
          setFormData(prev => ({ ...prev, address: text }))
        }
        multiline
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => 
            setFormData(prev => ({ ...prev, city: text }))
          }
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="ZIP Code"
          value={formData.zipCode}
          onChangeText={(text) => 
            setFormData(prev => ({ ...prev, zipCode: text }))
          }
          keyboardType="numeric"
        />
      </View>
    </View>
  );

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

        {/* Payment Form */}
        {renderPaymentMethodSelector()}
        {renderContactForm()}
        {renderBillingForm()}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{product.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{product.price}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={processPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay with PayHere • {product.price}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PayHere WebView Modal */}
      {paymentData && (
        <PayHereWebView
          visible={showPayHereWebView}
          onClose={handlePayHereClose}
          onSuccess={handlePayHereSuccess}
          onError={handlePayHereError}
          paymentData={paymentData}
        />
      )}
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
  paymentMethods: {
    gap: 10,
  },
  paymentMethodButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  selectedPaymentMethod: {
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textOnWhite,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
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
  payButton: {
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.textPrimary ,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
