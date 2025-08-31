import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Animated, 
  AppState,
  Dimensions,
  Easing,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import {fetchStores, getCurrentPosition, locationPermissionRetry, sortStoresByDistance} from '../data/stores';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import StoreFilter from '../components/StoreFilter';
import HeaderWithFilter from '../components/HeaderWithFilter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StoreItem from '../components/StoreItem';
import CartIcon from '../components/CartIcon';
import UserProfile from '../components/UserProfile';
import { useGeolocated } from 'react-geolocated';
import {useNotification} from "../components/NotificationSystem";
import { getGlobalCoords } from '../utils/globalCoords';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function StoresScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);
  const { showModal, showSuccess, showError } = useNotification();
  
  const geoData = Platform.OS === 'web' ? useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 60000,
      timeout: 30000,
    },
    watchPosition: false,
    userDecisionTimeout: null,
  }) : {
    coords: null,
    isGeolocationAvailable: false,
    isGeolocationEnabled: false,
    positionError: null
  };
  const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } = geoData;

  // Simplified function to navigate back to Home
  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  const getNumColumns = (width) => {
    if (width > 1400) return 6;
    if (width > 1200) return 5;
    if (width > 1000) return 4;
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
    loadStores();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('Returned to app from background');
        loadStores()
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const checkPermissionsAgain = async () => {
    // Call your permission check function here
    const result = await locationPermissionRetry();
    console.log(result);
  };
  
  useEffect(() => {
    // For web, try global coordinates first, then fallback to geolocation hook
    if (Platform.OS === 'web') {
      const globalCoords = getGlobalCoords();
      const coordsToUse = globalCoords || coords;
      if (coordsToUse) {
        sortOrderWithGeoCoords(coordsToUse);
      }
    } else {
      // For mobile, use geolocation hook
      if (coords) {
        sortOrderWithGeoCoords(coords);
      }
    }
  }, [coords]);

  const sortOrderWithGeoCoords = async (coords) => {
    const data = await fetchStores();
    const sortedStores = sortStoresByDistance(
        data,
        coords.latitude,
        coords.longitude
    );
    setLocationError('');
    setStores(sortedStores);
  }

  const sortOrder = async (order, storeList = stores, retry) => {
    if (order === 'nearest') {
      if (Platform.OS !== 'web') {
        try {
          const userLocation = await getCurrentPosition(retry);
          console.log(userLocation);
          if (userLocation.error === 'Location permission not granted' || userLocation.error === 'Failed to get location') {
            setLocationError(userLocation.error)
          } else {
            setLocationError('');
          }
          const sortedStores = sortStoresByDistance(
              storeList,
              userLocation.lat,
              userLocation.lng
          );
          setStores(sortedStores);
        } catch (err) {
          console.error(err);
        }
      } else {
        if (!isGeolocationAvailable) {
          showError('Geolocation is not supported by this browser.');
          setStores(storeList);
          setLocationError('Geolocation is not supported by this browser.')
          return;
        }
        if (!isGeolocationEnabled) {
          showError('Geolocation is not enabled. Please enable location services.');
          setStores(storeList);
          setLocationError('Geolocation is not enabled. Please enable location services.')
          return;
        }
        if (positionError) {
          let errorMessage = 'Failed to get location. ';
          if (positionError.code === 1) {
            errorMessage += 'Location access was denied. Please enable location permissions and try again.';
          } else if (positionError.code === 2) {
            errorMessage += 'Location information is unavailable.';
          } else if (positionError.code === 3) {
            errorMessage += 'Location request timed out.';
          } else {
            errorMessage += 'Please try again.';
          }
          showError(errorMessage);
          setStores(storeList);
          setLocationError(errorMessage)
          return;
        }
        console.log("coords:", coords, "error:", positionError, "enabled:", isGeolocationEnabled);
          if (!coords) {
            showError('Location data is not available yet. Please try again in a moment.');
            setStores(storeList);
            setLocationError('Location data is not available yet. Please try again in a moment.')
            return;
          }

        const loc = {
          lat: coords.latitude,
          lng: coords.longitude
        };
        console.log("Lat:", loc.lat, "Lng:", loc.lng);
        const data = await fetchStores();
        const sortedStores = sortStoresByDistance(
            data,
            coords.latitude,
            coords.longitude
        );
        setLocationError('');
        setStores(sortedStores);
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
     const permissions = await locationPermissionRetry()
    } catch (err) {
      return
    }
  }

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStores();
      
      // For web, try global coordinates first
      if (Platform.OS === 'web') {
        const globalCoords = getGlobalCoords();
        if (globalCoords) {
          const sortedStores = sortStoresByDistance(
            data,
            globalCoords.latitude,
            globalCoords.longitude
          );
          setLocationError('');
          setStores(sortedStores);
        } else {
          // No global coords yet, fallback to original behavior
          await sortOrder('nearest', data);
        }
      } else {
        // For mobile, use original behavior
        await sortOrder('nearest', data);
      }

    } catch (err) {
      setError('Failed to load stores');
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStoreCategory = (store) => {
    const storeName = store.name.toLowerCase();
    const storeOwner = store.owner.toLowerCase();
    const searchText = `${storeName} ${storeOwner}`;

    if (searchText.includes('cake') || searchText.includes('bakery') || searchText.includes('pastry') || 
        searchText.includes('dessert') || searchText.includes('sweet') || searchText.includes('cupcake') ||
        searchText.includes('birthday') || searchText.includes('wedding cake') || searchText.includes('bake')) {
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

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = searchQuery === '' || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const storeCategory = getStoreCategory(store);
      const matchesCategory = selectedCategory === 'all' || storeCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, selectedCategory]);

  if (loading) {
    return <LoadingState message="Loading Stores..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStores} />;
  }

  const getItemWidth = () => {
    const padding = 20;
    const spacing = 15;
    const maxGridWidth = 790; // 👈 your cap
    const availableWidth = Math.min(screenData.width, maxGridWidth); // 👈 cap at 790
    const totalSpacing = spacing * (numColumns - 1);
    return (availableWidth - (padding * 2) - totalSpacing) / numColumns;
  };

  const handleStorePress = (store) => {
    navigation.navigate('Products', { 
      storeId: store._id || store.id, 
      storeName: store.name 
    });
  };

  const renderStoreItem = (store, index) => (
    <View
      key={`${store._id || store.id}-${index}`}
      style={[styles.Item, { width: getItemWidth() }]}
    >
      <StoreItem 
        store={store}
        onPress={handleStorePress}
      />
    </View>
  );

  const ListHeaderComponent = () => (
    <View>
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

      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.browseStoresButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.browseStoresText}>Browse by Products</Text>
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
        <StoreFilter
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          storeCount={filteredStores.length}
        />
      </Animated.View>
    </View>
  );

  const activeStores = filteredStores.filter(item => item.isActive);

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
        <ListHeaderComponent />
        
        {activeStores.length === 0 ? (
          <EmptyState 
            icon="🏪"
            title="No stores found"
            message="Try adjusting your search or category filter"
            fullScreen={false}
          />
        ) : (
          <View style={styles.storesGrid}>
            {activeStores.map((store, index) => renderStoreItem(store, index))}
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: -20,
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
    borderRadius: 25,
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
  storesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 15,
    maxWidth: 790,
    marginTop: 20,
    alignSelf: 'center',
    width: '100%',
  },
  Item: {
    // marginBottom: 220,
  },
});
