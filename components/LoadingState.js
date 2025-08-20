import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function LoadingState({ 
  message = 'Loading...', 
  size = 'large', 
  color = '#007AFF',
  containerStyle = {} 
}) {
  return (
    <View style={[styles.loadingContainer, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {/*<Text style={styles.loadingText}>{message}</Text>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
