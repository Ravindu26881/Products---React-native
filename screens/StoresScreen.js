import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TouchableHighlight,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Platform
} from 'react-native';
import { fetchStores } from '../data/stores';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';
import StoreFilter from '../components/StoreFilter';

export default function StoresScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

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

  // Function to determine store category based on name/owner
  const getStoreCategory = (store) => {
    const storeName = store.name.toLowerCase();
    const storeOwner = store.owner.toLowerCase();
    const searchText = `${storeName} ${storeOwner}`;

    // Check for cake-related keywords
    if (searchText.includes('cake') || searchText.includes('bakery') || searchText.includes('pastry') || 
        searchText.includes('dessert') || searchText.includes('sweet') || searchText.includes('cupcake') ||
        searchText.includes('birthday') || searchText.includes('wedding cake') || searchText.includes('bake')) {
      return 'cakes';
    }
    
    // Check for clothing-related keywords
    if (searchText.includes('cloth') || searchText.includes('fashion') || searchText.includes('dress') || 
        searchText.includes('shirt') || searchText.includes('pant') || searchText.includes('jean') ||
        searchText.includes('wear') || searchText.includes('apparel') || searchText.includes('garment') ||
        searchText.includes('style') || searchText.includes('boutique') || searchText.includes('tailor')) {
      return 'clothing';
    }
    
    return 'all'; // Default category
  };

  // Filtered stores based on search query and category
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.owner.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const storeCategory = getStoreCategory(store);
      const matchesCategory = selectedCategory === 'all' || storeCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, selectedCategory]);

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Stores...</Text>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={loadStores}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <ScrollView style={styles.container}>
        <View>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.subtitle}>Browse our partners</Text>
              <TouchableOpacity 
                style={styles.filterToggle} 
                onPress={() => setShowFilter(!showFilter)}
              >
                <Text style={styles.filterIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Component */}
          {showFilter && (
            <StoreFilter
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              storeCount={filteredStores.length}
            />
          )}

          <View style={styles.storeList}>
            {filteredStores.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>No stores found</Text>
                <Text style={styles.noResultsText}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            ) : (
              filteredStores.map((store) => (
                  <View key={store._id || store.id} style={styles.storeItem}>
                    <TouchableOpacity onPress={() => navigation.navigate('Products', { storeId: store._id || store.id, storeName: store.name })}>
                    <Image
                        source={{ uri: store.image }}
                        style={styles.storeImage}
                        resizeMode="cover"
                    />
                    <View style={styles.storePriceWrapper}>
                      <View>
                        <Text style={[styles.storeName, { fontFamily: getFontFamily(store._id) }]}>
                          {store.name}
                        </Text>
                        <Text style={styles.storeOwner}>By, {store.owner}</Text>

                      </View>
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                        {/*<Image source={require('../assets/icons/Cart2.png')} style={styles.iconStyleCart} />*/}
                        <Image source={require('../assets/icons/Bag.png')} style={styles.iconStyleBuy} />
                      </View>


                      {/*<Text style={styles.storeCategory}>{store.category}</Text>*/}
                    </View>
                    </TouchableOpacity>
                  </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  storeImage: {
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // boxShadow: "0px 0px 17px 0px rgba(255, 255, 255, 0.1)",
    height: 180
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterToggle: {
    padding: 5,
  },
  filterIcon: {
    fontSize: 20,
    color: COLORS.white70,
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
  storeList: {
    padding: 20,
  },
  storeItem: {
    // boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.7)",
    backgroundColor: COLORS.primary,
    // padding: 10,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'medium',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  storePriceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.primary,
    width: 'auto',
    borderRadius: 20,
    boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
    padding: 20,
    paddingTop: 8
  },
  storeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  storeOwner: {
    fontWeight: '200',
    fontSize: 14,
    color: COLORS.white70,
  },
  storeCategory: {
    fontSize: 14,
    color: COLORS.textInverse,
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
  iconStyleBuy: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  iconStyleCart: {
    width: 35,
    height: 35,
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
