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
import { fetchProductById } from '../data/products';
import BuyNowModal from '../components/BuyNowModal';

export default function ProductDetailScreen({ navigation }) {
  const route = useRoute();
  const { productId, storeId, storeName } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

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
        backgroundColor: 'rgb(62 48 36)',
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
      <StatusBar barStyle="light-content" backgroundColor="rgb(62 48 36)" />
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
        <TouchableOpacity style={styles.addToCartButton}>
          <Image 
            source={require('../assets/icons/Cart.png')} 
            style={styles.cartIcon} 
          />
          <Text style={styles.addToCartText}>Add to Cart</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(136 109 85)',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(136 109 85)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(136 109 85)',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
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
    backgroundColor: 'rgb(136 109 85)',
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
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
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
    color: 'rgb(255 223 160)',
    marginRight: 15,
  },
  priceBadge: {
    backgroundColor: 'rgba(255, 223, 160, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceBadgeText: {
    color: 'rgb(255 223 160)',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgb(255 223 160)',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  storeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  storeInfoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  storeInfoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(62 48 36)',
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
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255 223 160)',
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
    tintColor: 'rgb(62 48 36)',
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowText: {
    color: 'rgb(62 48 36)',
    fontSize: 16,
    fontWeight: '600',
  },
});