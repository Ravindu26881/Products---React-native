import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView, ScrollView
} from 'react-native';
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
import CartIcon from '../components/CartIcon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [showFilter, setShowFilter] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;

  const getNumColumns = (width) => {
    if (width > 768) return 3;
    if (width > 600) return 3;
    if (width > 480) return 2;
    return 2;
  };
  
  const numColumns = getNumColumns(screenData.width);

  // Animate filter panel
  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: showFilter ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showFilter, filterAnimation]);

  useEffect(() => {
    loadAllProducts();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     title: 'SaleSale',
  //     headerTitleStyle: {
  //       fontSize: 18,
  //       fontWeight: 'bold',
  //     },
  //     headerRight: () => (
  //       <CartIcon
  //         navigation={navigation}
  //         iconColor={COLORS.textPrimary}
  //         style={{ marginRight: 5 }}
  //       />
  //     ),
  //   });
  // }, [navigation]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stores = await fetchStores();
      const productsWithStore = [];
      
      for (const store of stores) {
        try {
          const storeProducts = await fetchProductsByStoreId(store._id || store.id);
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

  const getProductCategory = (product) => {
    const productName = product.name.toLowerCase();
    const storeName = product.storeName.toLowerCase();
    const searchText = `${productName} ${storeName}`;

    if (searchText.includes('cake') || searchText.includes('bakery') || searchText.includes('pastry') || 
        searchText.includes('dessert') || searchText.includes('sweet') || searchText.includes('cupcake') ||
        searchText.includes('birthday') || searchText.includes('wedding') || searchText.includes('bake')) {
      return 'cakes';
    }
    
    if (searchText.includes('cloth') || searchText.includes('fashion') || searchText.includes('dress') || 
        searchText.includes('shirt') || searchText.includes('pant') || searchText.includes('jean') ||
        searchText.includes('wear') || searchText.includes('apparel') || searchText.includes('garment') ||
        searchText.includes('style') || searchText.includes('boutique') || searchText.includes('tailor')) {
      return 'clothing';
    }
    
    return 'all';
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.storeName.toLowerCase().includes(searchQuery.toLowerCase());

      const productCategory = getProductCategory(product);
      const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAllProducts} />;
  }

  const getItemWidth = () => {
    const padding = 20;
    const spacing = 15;
    const totalSpacing = spacing * (numColumns - 1);
    return (screenData.width - (padding * 2) - totalSpacing) / numColumns;
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product._id || product.id,
      storeId: product.storeId,
      storeName: product.storeName,
    });
  };

  const renderProductItem = ({ item: product, index }) => (
    <View style={styles.Item}>
      <ProductItem
        product={product}
        onPress={handleProductPress}
        width={getItemWidth()}
        showStoreName={true}
        storeId={product.storeId}
        storeName={product.storeName}
        containerStyle={{
          marginRight: (index + 1) % numColumns === 0 ? 0 : 15,
        }}
      />
    </View>
  );

  const ListHeaderComponent = () => (

    <View>
      <View style={styles.header}>
        <Image
          source={require('../assets/adaptive-icon.png')}
          style={styles.logo}
        />
        <Text style={styles.subtitle}>🎉 Discover amazing products from local businesses</Text>
      </View>
      
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.browseStoresButton}
          onPress={() => navigation.navigate('Stores')}
        >
          <Text style={styles.browseStoresText}>🏪 Browse by Stores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.filterContainer,
          {
            maxHeight: filterAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 777],
            }),
            opacity: filterAnimation,
            transform: [
              {
                translateY: filterAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ProductFilter
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          productCount={filteredProducts.length}
          showCategoryFilter={true}
        />
      </Animated.View>
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
            fullScreen={false}
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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.appBackground,
    marginHorizontal: -20
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    tintColor: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '200',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: -20,
    paddingBottom: 15,
    backgroundColor: COLORS.appBackground,
  },
  browseStoresButton: {
    // backgroundColor: COLORS.appBackground,
    borderColor: COLORS.textPrimary,
    borderWidth:1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  browseStoresText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: COLORS.appBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  filterButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    overflow: 'hidden',
    marginLeft: -20,
    marginRight: -20,
  },
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  Item: {
    marginTop: 20,
  },
});