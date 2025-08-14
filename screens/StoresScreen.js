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
  Animated
} from 'react-native';
import { fetchStores } from '../data/stores';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import StoreFilter from '../components/StoreFilter';
import HeaderWithFilter from '../components/HeaderWithFilter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StoreItem from '../components/StoreItem';

export default function StoresScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;

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

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStores();
      setStores(data);
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
        data={filteredStores}
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
