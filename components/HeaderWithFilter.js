import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function HeaderWithFilter({ 
  title, 
  showFilter, 
  onFilterToggle, 
  titleStyle = {},
  containerStyle = {} 
}) {
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.headerContent}>
        <Text style={[styles.subtitle, titleStyle]}>{title}</Text>
        <TouchableOpacity 
          style={styles.filterToggle} 
          onPress={onFilterToggle}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
    marginRight: -20,
    marginLeft: -20,
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
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white70,
  },
});
