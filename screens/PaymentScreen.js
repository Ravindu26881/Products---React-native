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

export default function PaymentScreen({ navigation }) {
  const route = useRoute();
  const { product, storeId, storeName } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    // Card Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    // Billing Address
    address: '',
    city: '',
    zipCode: '',
    country: 'USA',
    // Contact Info
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
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
    });
  }, [navigation, storeId]);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    if (selectedPaymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Error', 'Please enter a valid card number');
        return false;
      }
      if (!formData.expiryDate || formData.expiryDate.length < 5) {
        Alert.alert('Error', 'Please enter a valid expiry date');
        return false;
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        Alert.alert('Error', 'Please enter a valid CVV');
        return false;
      }
      if (!formData.cardName.trim()) {
        Alert.alert('Error', 'Please enter the cardholder name');
        return false;
      }
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
    
    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, you would integrate with payment processors like:
      // - Stripe
      // - PayPal
      // - Square
      // - Razorpay
      // etc.
      
      const paymentData = {
        amount: parseFloat(product.price.replace(/[^\d.]/g, '')),
        currency: 'USD',
        productId: product._id || product.id,
        storeId: storeId,
        paymentMethod: selectedPaymentMethod,
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      console.log('Payment processed:', paymentData);
      
      Alert.alert(
        'Payment Successful! 🎉',
        `Your order for "${product.name}" has been confirmed. You will receive a confirmation email shortly.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Products', { storeId, storeName }),
          },
          {
            text: 'View Order',
            onPress: () => {
              // Navigate to order details or receipt screen
              Alert.alert('Order Details', 'Order tracking feature coming soon!');
            },
            style: 'default',
          },
        ]
      );
      
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            selectedPaymentMethod === 'card' && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod('card')}
        >
          <Text style={styles.paymentMethodText}>💳 Credit/Debit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod('paypal')}
        >
          <Text style={styles.paymentMethodText}>🅿️ PayPal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            selectedPaymentMethod === 'apple' && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod('apple')}
        >
          <Text style={styles.paymentMethodText}>🍎 Apple Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardForm = () => {
    if (selectedPaymentMethod !== 'card') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          value={formData.cardNumber}
          onChangeText={(text) => 
            setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))
          }
          keyboardType="numeric"
          maxLength={19}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChangeText={(text) => 
              setFormData(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))
            }
            keyboardType="numeric"
            maxLength={5}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="CVV"
            value={formData.cvv}
            onChangeText={(text) => 
              setFormData(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }))
            }
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Cardholder Name"
          value={formData.cardName}
          onChangeText={(text) => 
            setFormData(prev => ({ ...prev, cardName: text }))
          }
          autoCapitalize="words"
        />
      </View>
    );
  };

  const renderContactForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
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
        {renderCardForm()}
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
              Complete Payment • {product.price}
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
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
