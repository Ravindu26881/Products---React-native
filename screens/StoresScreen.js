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
  Animated, AppState
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
import { useGeolocated } from 'react-geolocated';
import {useNotification} from "../components/NotificationSystem";

export default function StoresScreen({ navigation, route }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);
  const { showModal, showSuccess, showError } = useNotification();
  
  // Get coordinates from navigation params
  const userCoords = route?.params?.userCoords;
  
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


  // Animate filter panel with smooth timing
  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: showFilter ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilter, filterAnimation]);

  useEffect(() => {
    loadStores();
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
    // Use coordinates from navigation params first, then fallback to geolocation hook
    const coordsToUse = userCoords || coords;
    if (coordsToUse) {
      sortOrderWithGeoCoords(coordsToUse);
    }
  }, [coords, userCoords]);


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
      
      // If we have coordinates from navigation params, use them directly
      if (userCoords) {
        const sortedStores = sortStoresByDistance(
          data,
          userCoords.latitude,
          userCoords.longitude
        );
        setLocationError('');
        setStores(sortedStores);
      } else {
        // Fallback to original behavior
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


  const handleStorePress = (store) => {
    navigation.navigate('Products', { 
      storeId: store._id || store.id, 
      storeName: store.name 
    });
  };


  const renderStoreItem = ({ item: store }) => (
    <View style={styles.Item}>
      <StoreItem 
        store={store}
        onPress={handleStorePress}
      />
    </View>
  );


  const ListHeaderComponent = () => (
    <View>
      <HeaderWithFilter
        title="Browse our partners"
        showFilter={showFilter}
        onFilterToggle={() => setShowFilter(!showFilter)}
      />
      { (userCoords || (coords && !locationError)) ?
          <Text style={styles.Header}>
            Showing nearest stores to your current location
          </Text> : ''
      }
      { (!userCoords && !coords && locationError) ?
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.Header}>
            Allow location access to find nearest stores
            </Text>
            <TouchableOpacity onPress={requestLocationPermission}>
              <Text style={{ fontSize: 20 }}>↺</Text>
            </TouchableOpacity>
          </View>
          : ''
      }
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
        <View>
          <StoreFilter
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            storeCount={filteredStores.length}
          />
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
          data={filteredStores.filter(item => item.isActive)}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item._id || item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <EmptyState 
            icon="🔍"
            title="No stores found"
            message="Try adjusting your search or category filter"
            fullScreen={false}
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
  filterContainer: {
    overflow: 'hidden',
    marginLeft: -20,
    marginRight: -20
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
  storeCount: {
    fontSize: 14,
    color: COLORS.white70,
    marginTop: 5,
    fontWeight: '600',
  },
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemSeparator: {
    height: 15,
  },
  Item: {
    marginTop: 20,
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

});
