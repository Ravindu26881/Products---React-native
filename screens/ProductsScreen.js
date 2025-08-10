import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
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
import { COLORS } from '../utils/colors';
import ProductFilter from '../components/ProductFilter';
import HeaderWithFilter from '../components/HeaderWithFilter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ProductItem from '../components/ProductItem';

export default function ProductsScreen({ navigation }) {
  const route = useRoute();
  const { storeId, storeName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [showFilter, setShowFilter] = useState(false);
  
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

  // Filtered products based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [products, searchQuery]);

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProducts} />;
  }

  // Calculate item width based on screen size and columns
  const getItemWidth = () => {
    const padding = 20; // Container horizontal padding
    const spacing = 15; // Space between items
    const totalSpacing = spacing * (numColumns - 1);
    return (screenData.width - (padding * 2) - totalSpacing) / numColumns;
  };

  // Navigate to product detail
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product._id || product.id,
      storeId: storeId,
      storeName: storeName,
    });
  };

  // Render individual product item
  const renderProductItem = ({ item: product, index }) => (
      <View style={styles.Item}>
        <ProductItem
          product={product}
          onPress={handleProductPress}
          width={getItemWidth()}
          storeId={storeId}
          containerStyle={{
            marginRight: (index + 1) % numColumns === 0 ? 0 : 15
          }}
        />
      </View>
  );

  // Header component for FlatList
  const ListHeaderComponent = () => (
    <View>
      <HeaderWithFilter 
        title={storeName}
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
        titleStyle={{ fontFamily: getFontFamily(storeId) }}
      />
      {showFilter && (
        <ProductFilter
            style={styles.filterWrapper}
          onSearchChange={setSearchQuery}
          onCategoryChange={() => {}} // Not used in store-specific view
          searchQuery={searchQuery}
          selectedCategory="all"
          productCount={filteredProducts.length}
          showCategoryFilter={false} // Don't show category filter for store-specific products
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id || item.id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <EmptyState 
            icon="🔍"
            title="No products found"
            message="Try adjusting your search term"
          />
        )}
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
    backgroundColor: COLORS.background,
  },
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemSeparator: {
    height: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white70,
    marginTop: 5,
  },
  productCount: {
    fontSize: 14,
    color: COLORS.white70,
    marginTop: 5,
    fontWeight: '600',
  },

  filterWrapper: {
    marginLeft: -20,
    marginRight: -20,
  },

  footer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
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