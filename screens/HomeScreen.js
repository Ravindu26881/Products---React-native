import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform, Image,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
              source={require('../assets/adaptive-icon.png')}
              style={{
                width: 200,
                height: 110,
                resizeMode: 'cover',
                tintColor: '#fff',
              }}
          />
          <Text style={styles.subtitle}>🎉 Discover amazing products from local businesses</Text>
        </View>

        {/* Main Options */}
        <View style={styles.optionsContainer}>
          {/* Browse All Products Option */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.productsCard]}
            onPress={() => navigation.navigate('AllProducts', { category: 'all' })}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>

              <Text style={styles.optionTitle}>Browse All Products</Text>
              <Text style={styles.optionDescription}>
                Discover products from all our partner stores in one place
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• Search across all stores</Text>
                <Text style={styles.featureText}>• Filter by category</Text>
                <Text style={styles.featureText}>• Compare products</Text>
              </View>
            </View>
            <View style={styles.optionArrow}>
              <Text style={styles.optionIcon}>📦</Text>
            </View>
          </TouchableOpacity>

          {/* Browse All Stores Option */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.storesCard]}
            onPress={() => navigation.navigate('Stores')}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>

              <Text style={styles.optionTitle}>Browse All Stores</Text>
              <Text style={styles.optionDescription}>
                Explore our partner stores and discover their unique offerings
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• Search stores by name</Text>
                <Text style={styles.featureText}>• Filter by store type</Text>
                <Text style={styles.featureText}>• View store profiles</Text>
              </View>
            </View>
            <View style={styles.optionArrow}>
              <Text style={styles.optionIcon}>🏪</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(136 109 85)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    // marginBottom: 50,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '200',
    marginTop: 10,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 25,
    maxHeight: screenHeight * 0.6,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  productsCard: {
    backgroundColor: 'rgb(160 139 120)',
  },
  storesCard: {
    backgroundColor: 'rgb(160 139 120)',
  },
  optionContent: {
    flex: 1,
    paddingRight: 15,
  },
  optionIcon: {
    fontSize: 40,
    // marginBottom: 15,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
  },
  optionDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 15,
  },
  optionFeatures: {
    gap: 5,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  optionArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});