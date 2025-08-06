import React, { useState, useEffect } from 'react';
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

export default function StoresScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <Text style={styles.subtitle}>Browse our partners</Text>
            <Text style={styles.storeCount}>{stores.length} {stores.length === 1 ? 'store' : 'stores'} available</Text>
          </View>
          <View style={styles.storeList}>
            {stores.map((store) => (
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
            ))}
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
    backgroundColor: "rgb(136 109 85)",
  },
  storeImage: {
    width: '100%',
    borderRadius: 20,
    // boxShadow: "0px 0px 17px 0px rgba(255, 255, 255, 0.1)",
    height: 180
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  storeCount: {
    fontSize: 14,
    color: 'rgb(255 255 255 / 69%)',
    marginTop: 5,
    fontWeight: '600',
  },
  storeList: {
    padding: 20,
  },
  storeItem: {
    // boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.7)",
    backgroundColor: 'rgb(62 48 36)',
    padding: 10,
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
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'medium',
    color: "white",
    marginBottom: 5,
  },
  storePriceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 'auto',
    borderRadius: 20,
    boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
    padding: 20
  },
  storeDescription: {
    fontSize: 16,
    color: 'darkgray',
    fontWeight: '600',
  },
  storeOwner: {
    fontWeight: '200',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  storeCategory: {
    fontSize: 14,
    color: 'white',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
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
}); 