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
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { fetchStores , getCurrentPosition} from '../data/stores';
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
import UserProfile from '../components/UserProfile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGeolocated } from 'react-geolocated';
import { setGlobalCoords } from '../utils/globalCoords';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [location, setLocation] = useState('none');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [showFilter, setShowFilter] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;
  
  // Web geolocation setup
  const geoData = Platform.OS === 'web' ? useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 60000,
      timeout: 30000,
    },
    watchPosition: false,
    userDecisionTimeout: 10000,
  }) : null;

  // Save coordinates globally when they become available
  useEffect(() => {
    if (Platform.OS === 'web' && geoData) {
      const { coords, positionError } = geoData;
      
      // If coordinates are available and no error, save them globally
      if (coords && !positionError) {
        setGlobalCoords({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
      }
    }
  }, [geoData?.coords, geoData?.positionError]);

  // Simplified function to navigate to Stores
  const handleBrowseStores = () => {
    navigation.navigate('Stores');
  };



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



  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product._id || product.id,
      storeId: product.storeId,
      storeName: product.storeName,
    });
  };

  const getNumColumns = (width) => {
    if (width > 1200) return 5;
    if (width > 1000) return 4;
    if (width > 768) return 3;
    return 2; // Mobile and small screens show 2 columns
  };
  
  const numColumns = getNumColumns(screenData.width);

  const getItemWidth = () => {
    const padding = 20;
    const spacing = 15;
    const maxGridWidth = 790;
    const availableWidth = Math.min(screenData.width, maxGridWidth);
    
    // Calculate exact width for perfect alignment
    const totalSpacing = spacing * (numColumns - 1);
    const calculatedWidth = (availableWidth - (padding * 2) - totalSpacing) / numColumns;
    
    // Ensure minimum width for very small screens
    return Math.max(calculatedWidth, 150);
  };



  const renderProductItem = (product, index) => (
    <View
      key={`${product.storeId}-${product._id || product.id}-${index}`}
      style={[
        styles.Item,
        { 
          width: getItemWidth(),
          marginBottom: 20,
          alignItems: 'center'
        }
      ]}
    >
      <ProductItem
        product={product}
        onPress={handleProductPress}
        width={getItemWidth()}
        storeId={product.storeId}
        storeName={product.storeName}
      />
    </View>
  );

  const ListHeaderComponent = () => (

    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-one-line.png')}
            style={styles.logo}
          />
        </View>
        <UserProfile mini={true} />
      </View>
    </View>
  )

  const ListActionsComponent = () => (
    <View style={
      screenData.width > 800
        ? styles.headerItemsWrapperDesktop
        : styles.headerItemsWrapper
    }>
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.browseStoresButton}
          onPress={handleBrowseStores}
        >
          <Text style={styles.browseStoresText}>Browse by Stores</Text>
        </TouchableOpacity>

        <View style={styles.filterButtonContainer}>
          <CartIcon
            navigation={navigation}
            iconColor={COLORS.textPrimary}
            style={styles.cartIcon}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}
          >
            {/*<Text style={styles.filterButtonText}>Filter</Text>*/}
            <Image
              source={require('../assets/icons/Filter.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
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

  const activeProducts = filteredProducts.filter(item => item.store?.isActive);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.appBackground}
        translucent={false}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <ListHeaderComponent/>
        <View style={styles.storesGrid}>
          <ListActionsComponent />
        </View>

        {activeProducts.length === 0 ? (
          <EmptyState 
            icon="📦"
            title="No products found"
            message="Try adjusting your search or category filter"
            fullScreen={false}
          />
        ) : (
          <View style={styles.productsGrid}>
            {activeProducts.map((product, index) => renderProductItem(product, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerItemsWrapper : {
    width: '-webkit-fill-available',
  },
  headerItemsWrapperDesktop : {
    width: 760
  },
  storesGrid: {
    display: 'grid',
    placeItems: 'center',
  },
  header: {
    backgroundColor: COLORS.appBackground,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginTop: 10
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'left',
  },
  logo: {
    width: 116,
    height: 60,
    marginLeft: -14,
    resizeMode: 'cover',
    tintColor: COLORS.textPrimary,
  },
  cartIcon: {
    // marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '200',
    marginTop: 0,
    marginBottom: 20,
  },
  userProfileContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: -20,
    // paddingBottom: 15,
    backgroundColor: COLORS.appBackground,
  },
  filterButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  browseStoresButton: {
    borderColor: COLORS.bordersLight,
    borderWidth:1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    maxWidth: 170,
  },
  browseStoresText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: COLORS.appBackground,
    borderWidth: 1,
    borderColor: COLORS.bordersLight,
    padding: 9,
    // paddingHorizontal: 20,
    // paddingVertical: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    maxWidth: 790,
    marginTop: 20,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 0,
    minHeight: 200,
    alignItems: 'flex-start',
  },
  Item: {
    // Dynamic marginBottom is set in renderProductItem
  },
});