import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function EmptyState({ 
  icon = '📦', 
  title = 'No items found', 
  message = 'Try adjusting your search or filters',
  containerStyle = {} 
}) {
  return (
    <View style={[styles.noResultsContainer, containerStyle]}>
      <Text style={styles.noResultsIcon}>{icon}</Text>
      <Text style={styles.noResultsTitle}>{title}</Text>
      <Text style={styles.noResultsText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
