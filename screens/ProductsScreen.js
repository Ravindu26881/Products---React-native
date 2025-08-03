import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { fetchProducts } from '../data/products';

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadProducts}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <ImageBackground
          source={require('../assets/background-img.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
      >
        <View style={styles.header}>
         <Text style={styles.subtitle}>Browse our collection</Text>
         <Text style={styles.productCount}>{products.length} {products.length === 1 ? 'product' : 'products'} available</Text>
        </View>
      <View style={styles.productList}>
        {products.map((product) => (
          <View key={product._id || product.id} style={styles.productItem}>
            <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                resizeMode="cover"
            />
              <View style={styles.productPriceWrapper}>
                <View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                  {/*<Image source={require('../assets/icons/Cart2.png')} style={styles.iconStyleCart} />*/}
                  <Image source={require('../assets/icons/Buy.png')} style={styles.iconStyleBuy} />
                </View>


              {/*<Text style={styles.productCategory}>{product.category}</Text>*/}
            </View>
          </View>
        ))}
      </View>
      
      {/*<View style={styles.footer}>*/}
      {/*  <TouchableOpacity */}
      {/*    style={styles.button}*/}
      {/*    onPress={() => navigation.goBack()}*/}
      {/*  >*/}
      {/*    <Text style={styles.buttonText}>Go Back</Text>*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}
      </ImageBackground>
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
    backgroundColor: 'black',
  },
  productImage: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    boxShadow: "0px 0px 17px 0px rgba(255, 255, 255, 0.1)",
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  productCount: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '600',
  },
  productList: {
    padding: 20,
  },
  productItem: {
    boxShadow: "0px 0px 17px 0px rgba(0, 0, 0, 0.7)",
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "white",
    marginBottom: 5,
  },
  productPriceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 'auto',
    borderRadius: 20,
    boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
    padding: 15
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  productCategory: {
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