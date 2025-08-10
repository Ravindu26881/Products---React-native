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
import HeaderWithFilter from '../components/HeaderWithFilter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ProductItem from '../components/ProductItem';

export default function AllProductsScreen({ navigation }) {
  const route = useRoute();
  const { category = 'all' } = route.params || {};
  
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [showFilter, setShowFilter] = useState(false);
  
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
    return <LoadingState message="Loading all products..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAllProducts} />;
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
      <View style={styles.Item}>
        <ProductItem
            product={product}
            onPress={handleProductPress}
            width={getItemWidth()}
            showStoreName={true}
            containerStyle={{
              marginRight: (index + 1) % numColumns === 0 ? 0 : 15,
            }}
        />
      </View>
  );

  // Header component for FlatList
  const ListHeaderComponent = () => (
    <View>
      <HeaderWithFilter 
        title="All Products"
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
      />
      {showFilter && (
        <ProductFilter
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          productCount={filteredProducts.length}
          showCategoryFilter={true}
        />
      )}
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
        ListEmptyComponent={() => (
          <EmptyState 
            icon="📦"
            title="No products found"
            message="Try adjusting your search or category filter"
          />
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
  Item: {
    marginTop: 20,
  }
});
