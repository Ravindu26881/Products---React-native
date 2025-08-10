import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../utils/colors';
import { getFontFamily } from '../utils/fontUtils';

export default function StoreItem({ 
  store, 
  onPress,
  containerStyle = {} 
}) {
  return (
    <View style={[styles.storeItem, containerStyle]}>
      <TouchableOpacity onPress={() => onPress(store)}>
        <Image
          source={{ uri: store.image }}
          style={styles.storeImage}
          resizeMode="cover"
        />
        <View style={styles.storePriceWrapper}>
          <View>
            <Text style={[styles.storeName, { fontFamily: getFontFamily(store._id || store.id) }]}>
              {store.name}
            </Text>
            <Text style={styles.storeOwner}>By, {store.owner}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Image source={require('../assets/icons/Bag.png')} style={styles.iconStyleBuy} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  storeItem: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0,
    borderColor: COLORS.primary,
  },
  storeImage: {
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: 180,
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
    paddingTop: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'medium',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  storeOwner: {
    fontWeight: '200',
    fontSize: 14,
    color: COLORS.white70,
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  iconStyleBuy: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
});
