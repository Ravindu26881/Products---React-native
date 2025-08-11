import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import { fetchProductById } from '../data/products';
import BuyNowModal from '../components/BuyNowModal';
import { useCart } from '../contexts/CartContext';
import CartActionModal from '../components/CartActionModal';

export default function ProductDetailScreen({ navigation }) {
  const route = useRoute();
  const { productId, storeId, storeName } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [showCartModal, setShowCartModal] = useState(false);
  const { addToCart, isItemInCart, getItemQuantityInCart, removeFromCart, updateQuantity, getCartItemId } = useCart();

  useEffect(() => {
    loadProduct();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: product?.name || 'Product Details',
      headerTitleStyle: {
        fontFamily: getFontFamily(storeId),
        fontSize: 16,
      },
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
    });
  }, [navigation, product, storeId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await fetchProductById(storeId, productId);
      setProduct(productData);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

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


  const handleBuyNow = () => {
    setShowBuyNowModal(true);
  };

  const handleContactSeller = () => {
    setShowBuyNowModal(false);
    navigation.navigate('ContactSeller', {
      product: product,
      storeId: storeId,
      storeName: storeName,
    });
  };

  const handlePayNow = () => {
    setShowBuyNowModal(false);
    navigation.navigate('Payment', {
      product: product,
      storeId: storeId,
      storeName: storeName,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={loadProduct}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={[styles.productImage, { height: screenHeight * 0.5 }]}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {/* Store Badge */}
          <View style={styles.storeBadge}>
            <Text style={[styles.storeBadgeText, { fontFamily: getFontFamily(storeId) }]}>
              {storeName}
            </Text>
          </View>

          {/* Product Name */}
          <Text style={[styles.productName, { fontFamily: getFontFamily(storeId) }]}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>Best Price</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description || 'This is a premium quality product from ' + storeName + '. Made with care and attention to detail, this item represents the finest craftsmanship and quality you can trust.'}
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>Premium Quality Materials</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>Handcrafted with Care</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>Fast & Reliable Delivery</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>100% Satisfaction Guarantee</Text>
              </View>
            </View>
          </View>

          {/* Store Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Store</Text>
            <View style={styles.storeInfo}>
              <Text style={[styles.storeInfoText, { fontFamily: getFontFamily(storeId) }]}>
                {storeName}
              </Text>
              <Text style={styles.storeInfoSubtext}>
                Trusted seller with quality products and excellent customer service.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            addingToCart && styles.addToCartButtonDisabled
          ]} 
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          <Image 
            source={
              isItemInCart(product?._id, storeId) 
                ? require('../assets/icons/CartAdded.png')
                : require('../assets/icons/Cart.png')
            } 
            style={styles.cartIcon} 
          />
          <Text style={styles.addToCartText}>
            {addingToCart 
              ? 'Adding...' 
              : isItemInCart(product?._id, storeId) 
                ? `In Cart (${getItemQuantityInCart(product?._id, storeId)})` 
                : 'Add to Cart'
            }
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Image 
            source={require('../assets/icons/Buy.png')} 
            style={styles.buyIcon} 
          />
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Buy Now Modal */}
      <BuyNowModal
        visible={showBuyNowModal}
        onClose={() => setShowBuyNowModal(false)}
        onContactSeller={handleContactSeller}
        onPayNow={handlePayNow}
        product={product}
        storeName={storeName}
      />
      <CartActionModal
          visible={showCartModal}
          onClose={() => setShowCartModal(false)}
          onIncreaseQuantity={handleIncreaseQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          product={product}
          storeName={storeName || product?.storeName}
          currentQuantity={getItemQuantityInCart(product?._id, storeId)}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textInverse,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    background: 'linear-gradient(transparent, rgba(136, 109, 85, 0.8))',
  },
  contentContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom bar
  },
  storeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -25,
    marginBottom: 15,
  },
  storeBadgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 34,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: 15,
  },
  priceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceBadgeText: {
    color: COLORS.white80,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  featuresList: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  storeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  storeInfoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  storeInfoSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
  },
  cartIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 8,
  },
  buyIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 8,
  },
  addToCartText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});