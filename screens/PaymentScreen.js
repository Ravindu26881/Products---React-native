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

export default function PaymentScreen({ navigation }) {
  const route = useRoute();
  const { product, storeId, storeName } = route.params;
  const { showModal, showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      showError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      showError('Please enter your phone number');
      return false;
    }
    if (!formData.address.trim()) {
      showError('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      showError('Please enter your city');
      return false;
    }
    
    return true;
  };

  const processOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Order Placed! 🎉',
        `Your order for "${product.name}" has been placed successfully.\n\nThe seller will contact you shortly to arrange payment and delivery.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Products', { storeId, storeName }),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }, 2000);
  };

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
      <Text style={styles.sectionTitle}>Delivery Address</Text>
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

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <Text style={styles.infoText}>
            Fill out the form below and the seller will contact you to arrange payment and delivery.
          </Text>
        </View>

        {/* Order Form */}
        {renderContactForm()}
        {renderBillingForm()}

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