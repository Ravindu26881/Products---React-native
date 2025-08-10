import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '../utils/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function BuyNowModal({ 
  visible, 
  onClose, 
  onContactSeller, 
  onPayNow, 
  product,
  storeName 
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buy Now</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Product Summary */}
          <View style={styles.productSummary}>
            <Image 
              source={{ uri: product?.image }} 
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product?.name}
              </Text>
              <Text style={styles.productPrice}>{product?.price}</Text>
              <Text style={styles.storeName}>from {storeName}</Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Choose your preferred option:</Text>
            
            {/* Contact Seller Option */}
            <TouchableOpacity 
              style={[styles.optionButton, styles.contactButton]}
              onPress={onContactSeller}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>💬</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Contact Seller</Text>
                  <Text style={styles.optionDescription}>
                    Chat with the seller to negotiate price, ask questions, or arrange pickup
                  </Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Pay Now Option */}
            <TouchableOpacity 
              style={[styles.optionButton, styles.payButton]}
              onPress={onPayNow}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>💳</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Pay Now</Text>
                  <Text style={styles.optionDescription}>
                    Secure payment with instant confirmation and fast delivery
                  </Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>🔒 Secure & Protected Transaction</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  productSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
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
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  optionButton: {
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  payButton: {
    backgroundColor: COLORS.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIconText: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  securityBadge: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  securityText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
  },
});
