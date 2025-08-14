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
  Easing
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
import CartIcon from '../components/CartIcon';

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
  const filterAnimation = useRef(new Animated.Value(0)).current;

  const getNumColumns = (width) => {
    if (width > 768) return 3;
    if (width > 600) return 3;
    if (width > 480) return 2;
    return 2;
  };
  
  const numColumns = getNumColumns(screenData.width);

  // Animate filter panel - Choose your preferred style:
  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: showFilter ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // OPTION 2: iOS-like easeInOut (Uncomment to use)
    // Animated.timing(filterAnimation, {
    //   toValue: showFilter ? 1 : 0,
    //   duration: 350,
    //   easing: Easing.inOut(Easing.ease),
    //   useNativeDriver: false,
    // }).start();

    // OPTION 3: Material Design easeOut (Uncomment to use)
    // Animated.timing(filterAnimation, {
    //   toValue: showFilter ? 1 : 0,
    //   duration: 280,
    //   easing: Easing.out(Easing.quad),
    //   useNativeDriver: false,
    // }).start();

    // OPTION 4: Subtle bounce (less rubber than spring)
    // Animated.timing(filterAnimation, {
    //   toValue: showFilter ? 1 : 0,
    //   duration: 400,
    //   easing: Easing.out(Easing.back(1.2)),
    //   useNativeDriver: false,
    // }).start();

    // OPTION 5: Linear (mechanical, precise)
    // Animated.timing(filterAnimation, {
    //   toValue: showFilter ? 1 : 0,
    //   duration: 250,
    //   easing: Easing.linear,
    //   useNativeDriver: false,
    // }).start();
  }, [showFilter, filterAnimation]);

  useEffect(() => {
    loadAllProducts();
    

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
      headerRight: () => (
        <CartIcon 
          navigation={navigation} 
          iconColor={COLORS.textPrimary}
          style={{ marginRight: 5 }}
        />
      ),
    });
  }, [navigation]);

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
    return <LoadingState message="Loading all products..." />;
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
      <HeaderWithFilter 
        title="All Products"
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
      />
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
  filterContainer: {
    overflow: 'hidden',
    marginLeft: -20,
    marginRight: -20
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
