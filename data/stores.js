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