import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchStores } from '../data/stores';
import { fetchProductsByStoreId } from '../data/products';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import ProductFilter from '../components/ProductFilter';

export default function AllProductsScreen({ navigation }) {
  const route = useRoute();
  const { category = 'all' } = route.params || {};
  
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Calculate responsive grid columns
  const getNumColumns = (width) => {
    if (width > 768) return 3;
    if (width > 600) return 3;
    if (width > 480) return 2;
    return 2;
  };
  
  const numColumns = getNumColumns(screenData.width);

  useEffect(() => {
    loadAllProducts();
    
    // Listen for screen dimension changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'All Products',
      headerTitleStyle: {
        fontSize: 16,
      },
    });
  }, [navigation]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all stores
      const stores = await fetchStores();
      const productsWithStore = [];
      
      // Then, fetch products from each store
      for (const store of stores) {
        try {
          const storeProducts = await fetchProductsByStoreId(store._id || store.id);
          // Add store information to each product
          const productsWithStoreInfo = storeProducts.map(product => ({
            ...product,
            storeId: store._id || store.id,
            storeName: store.name,
            storeOwner: store.owner,
          }));
          productsWithStore.push(...productsWithStoreInfo);
        } catch (storeError) {
          console.warn(`Failed to load products for store ${store.name}:`, storeError);
        }
      }
      
      setAllProducts(productsWithStore);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading all products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine product category
  const getProductCategory = (product) => {
    const productName = product.name.toLowerCase();
    const storeName = product.storeName.toLowerCase();
    const searchText = `${productName} ${storeName}`;

    // Check for cake-related keywords
    if (searchText.includes('cake') || searchText.includes('bakery') || searchText.includes('pastry') || 
        searchText.includes('dessert') || searchText.includes('sweet') || searchText.includes('cupcake') ||
        searchText.includes('birthday') || searchText.includes('wedding') || searchText.includes('bake')) {
      return 'cakes';
    }
    
    // Check for clothing-related keywords
    if (searchText.includes('cloth') || searchText.includes('fashion') || searchText.includes('dress') || 
        searchText.includes('shirt') || searchText.includes('pant') || searchText.includes('jean') ||
        searchText.includes('wear') || searchText.includes('apparel') || searchText.includes('garment') ||
        searchText.includes('style') || searchText.includes('boutique') || searchText.includes('tailor')) {
      return 'clothing';
    }
    
    return 'all';
  };

  // Filtered products based on search query and category
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.storeName.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const productCategory = getProductCategory(product);
      const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading all products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadAllProducts}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate item width based on screen size and columns
  const getItemWidth = () => {
    const padding = 20;
    const spacing = 15;
    const totalSpacing = spacing * (numColumns - 1);
    return (screenData.width - (padding * 2) - totalSpacing) / numColumns;
  };

  // Navigate to product detail
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product._id || product.id,
      storeId: product.storeId,
      storeName: product.storeName,
    });
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
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => handleProductPress(product)}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productPriceWrapper}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.storeName} numberOfLines={1}>
              from {product.storeName}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => handleProductPress(product)}
          >
            <Image source={require('../assets/icons/View.png')} style={styles.iconStyleBuy} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Header component for FlatList
  const ListHeaderComponent = () => (
    <View>
      <ProductFilter
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        productCount={filteredProducts.length}
        showCategoryFilter={true}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.storeId}-${item._id || item.id}-${index}`}
        numColumns={numColumns}
        key={numColumns}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={() => (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsIcon}>📦</Text>
            <Text style={styles.noResultsTitle}>No products found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.3)",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    color: COLORS.textSecondary,
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
  productItem: {
    overflow: 'hidden',
    marginBottom: 0,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    // Android shadow
    elevation: 5,

    borderWidth: 2,
    borderColor: COLORS.primaryWithOpacity,
    backgroundColor: COLORS.primaryWithOpacity,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
    marginBottom: 4,
    lineHeight: 20,
  },
  productPriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.primaryWithOpacity,
    padding: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  buyButton: {
    // Empty for now, matching the original design
  },
  productPrice: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 12,
    color: COLORS.white70,
    fontStyle: 'italic',
  },
  iconStyleBuy: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 15,
    opacity: 0.6,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textInverse,
    marginBottom: 10,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.white70,
    textAlign: 'center',
    lineHeight: 22,
  },
});
