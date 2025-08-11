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

export default function CartActionModal({ 
  visible, 
  onClose, 
  onViewCart,
  onIncreaseQuantity,
  onRemoveFromCart,
  product,
  storeName,
  currentQuantity = 1
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
            <Text style={styles.headerTitle}>Item Already in Cart</Text>
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
              <View style={styles.quantityInfo}>
                <Text style={styles.quantityText}>
                  Current quantity: {currentQuantity}
                </Text>
              </View>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>What would you like to do?</Text>
            
            {/* View Cart Option */}
            {/*<TouchableOpacity */}
            {/*  style={[styles.optionButton, styles.viewCartButton]}*/}
            {/*  onPress={onViewCart}*/}
            {/*  activeOpacity={0.8}*/}
            {/*>*/}
            {/*  <View style={styles.optionContent}>*/}
            {/*    <View style={styles.optionIcon}>*/}
            {/*      <Image */}
            {/*        source={require('../assets/icons/Cart2.png')} */}
            {/*        style={styles.optionIconImage}*/}
            {/*      />*/}
            {/*    </View>*/}
            {/*    <View style={styles.optionTextContainer}>*/}
            {/*      <Text style={styles.optionTitle}>View Cart</Text>*/}
            {/*      <Text style={styles.optionDescription}>*/}
            {/*        See all items in your cart and proceed to checkout*/}
            {/*      </Text>*/}
            {/*    </View>*/}
            {/*    <Text style={styles.optionArrow}>→</Text>*/}
            {/*  </View>*/}
            {/*</TouchableOpacity>*/}

            {/* Increase Quantity Option */}
            <TouchableOpacity 
              style={[styles.optionButton, styles.increaseButton]}
              onPress={onIncreaseQuantity}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>+</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Add One More</Text>
                  <Text style={styles.optionDescription}>
                    Increase quantity to {currentQuantity + 1}
                  </Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Remove from Cart Option */}
            <TouchableOpacity 
              style={[styles.optionButton, styles.removeButton]}
              onPress={onRemoveFromCart}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>×</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Remove from Cart</Text>
                  <Text style={styles.optionDescription}>
                    Remove this item from your cart completely
                  </Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Badge */}
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>💡 You can also manage quantities in your cart</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    backgroundColor: COLORS.white80,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.8,
    marginBottom: 8,
  },
  quantityInfo: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quantityText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  optionButton: {
    borderRadius: 15,
    marginBottom: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCartButton: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  increaseButton: {
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  removeButton: {
    backgroundColor: '#ff444415',
    borderWidth: 1,
    borderColor: '#ff444430',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIconImage: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  optionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    opacity: 0.7,
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    opacity: 0.6,
  },
  infoBadge: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});