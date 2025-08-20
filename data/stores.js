// API endpoint for products
import { Linking, Platform} from "react-native";

const API_URL = 'https://products-api-production-124f.up.railway.app/stores';

// Fetch products from API
export const fetchStores = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return error
  }
};

export const fetchStoreById = async (storeId) => {
  try {
    const response = await fetch(API_URL + '/' + storeId);
    if (!response.ok) {
      throw new Error('Failed to fetch store');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching store:', error);
    return error
  }
};

import * as Location from 'expo-location';

export async function getCurrentPosition() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission not granted' };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    return {
      success: true,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

  } catch (err) {
    return { success: false, error: err.message || 'Failed to get location' };
  }
}

export async function locationPermissionRetry() {
  try {
    let { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    if (canAskAgain) {
      const result = await Location.requestForegroundPermissionsAsync();
      status = result.status;
      canAskAgain = result.canAskAgain;
    }

    if (status === 'granted') {
      return { success: true };
    }

    if (!canAskAgain) {
      // Location permission permanently denied - user can enable in settings if needed
      console.log('Location permission permanently denied. User can enable in device settings if needed.');
      return { success: false, error: 'Location permission permanently denied' };
    }

    return { success: false, error: 'Location permission not granted' };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to get location' };
  }
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortStoresByDistance(stores, userLat, userLng) {
  const withCoords = [];
  const withoutCoords = [];

  for (const s of stores) {
    const lat = s.locationLat !== undefined ? parseFloat(s.locationLat) : NaN;
    const lng = s.locationLng !== undefined ? parseFloat(s.locationLng) : NaN;

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const distanceMeters = getDistanceMeters(userLat, userLng, lat, lng);
      const distanceKm = distanceMeters / 1000; // convert to km
      withCoords.push({ ...s, distance: distanceKm });
    } else {
      withoutCoords.push({ ...s, distance: null });
    }
  }

  withCoords.sort((a, b) => a.distance - b.distance);
  return [...withCoords, ...withoutCoords];
}