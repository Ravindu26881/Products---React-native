import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Platform,
  Dimensions
} from 'react-native';
import {fetchProducts, fetchProductsByStoreId} from '../data/products';
import { useRoute } from '@react-navigation/native';
import { getFontFamily } from '../utils/fontUtils';

export default function ProductsScreen({ navigation }) {
  const route = useRoute();
  const { storeId, storeName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Calculate responsive grid columns
  const getNumColumns = (width) => {
    if (width > 768) return 3;  // Tablets/Desktop
    if (width > 600) return 3;  // Large phones landscape
    if (width > 480) return 2;  // Regular phones landscape
    return 2;                   // Portrait mode
  };
  
  const numColumns = getNumColumns(screenData.width);

  useEffect(() => {
    loadProducts();
    
    // Listen for screen dimension changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Bazario',
      headerTitleStyle: {
        fontFamily: getFontFamily(storeId),
        fontSize: 16,
      },
    });
  }, [navigation]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsByStoreId(storeId);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadProducts}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate item width based on screen size and columns
  const getItemWidth = () => {
    const padding = 20; // Container horizontal padding
    const spacing = 15; // Space between items
    const totalSpacing = spacing * (numColumns - 1);
    return (screenData.width - (padding * 2) - totalSpacing) / numColumns;
  };

  // Render individual product item
  const renderProductItem = ({ item: product, index }) => (
    <View style={[
      styles.productItem, 
      { 
        width: getItemWidth(),
        marginRight: (index + 1) % numColumns === 0 ? 0 : 15
      }
    ]}>
      <TouchableOpacity activeOpacity={0.8}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productPriceWrapper}>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { fontFamily: getFontFamily(storeId) }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Image source={require('../assets/icons/View.png')} style={styles.iconStyleBuy} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Header component for FlatList
  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={[styles.subtitle, { fontFamily: getFontFamily(storeId) }]}>{storeName}</Text>
      <Text style={styles.productCount}>
        {products.length} {products.length === 1 ? 'product' : 'products'} available
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id || item.id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: "rgb(136 109 85)",
  },
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemSeparator: {
    height: 15,
  },
  productImage: {
    width: '100%',
    height: 200,
    // borderTopLeftRadius: 15,
    // borderTopRightRadius: 15,
    boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.3)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: -20,
    marginLeft: -20,
    marginBottom: 25
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  productCount: {
    fontSize: 14,
    color: 'rgb(255 255 255 / 69%)',
    marginTop: 5,
    fontWeight: '600',
  },
  productItem: {
    // backgroundColor: 'rgb(62 48 36)',
    // borderRadius: 15,
    overflow: 'hidden',

    elevation: 8,
    marginBottom: 0, // Handled by ItemSeparatorComponent
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: "white",
    marginBottom: 4,
    lineHeight: 20,
  },
  productPriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',

    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 12,
    paddingVertical: 10,

  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  buyButton: {
    // padding: 8,
    // borderRadius: 8,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  productPrice: {
    fontSize: 15,
    color: 'rgb(255 223 160)',
    fontWeight: '700',
    marginBottom: 0,
  },
  productCategory: {
    fontSize: 14,
    color: 'white',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
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
  iconStyleBuy: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  iconStyleCart: {
    width: 35,
    height: 35,
    tintColor: 'white',
  },
}); 