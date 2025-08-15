// API endpoint for products
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

import * as Location from 'expo-location';

export async function getCurrentPosition() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission not granted');
  // HighAccuracy uses GPS; you can set accuracy to Balanced if you want less battery usage
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
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