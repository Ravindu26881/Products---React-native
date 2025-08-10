import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { COLORS } from '../utils/colors';

const STORE_CATEGORIES = [
  { id: 'all', name: 'All Stores', icon: '🏪' },
  { id: 'cakes', name: 'Cakes', icon: '🎂' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
];

export default function StoreFilter({ 
  onSearchChange, 
  onCategoryChange, 
  searchQuery, 
  selectedCategory,
  storeCount 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    // Auto-collapse after selection on mobile for better UX
    if (categoryId !== 'all') {
      setTimeout(() => {
        setIsExpanded(false);
        Animated.spring(animatedHeight, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }, 300);
    }
  };

  const getSelectedCategoryName = () => {
    const category = STORE_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.name : 'All Stores';
  };

  const getSelectedCategoryIcon = () => {
    const category = STORE_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.icon : '🏪';
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores by name..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.categoryHeader} onPress={toggleExpanded}>
          <View style={styles.categoryHeaderLeft}>
            <Text style={styles.categoryIcon}>{getSelectedCategoryIcon()}</Text>
            <Text style={styles.categoryHeaderText}>{getSelectedCategoryName()}</Text>
          </View>
          <Text style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
            ▼
          </Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.categoryList,
            {
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: animatedHeight,
            },
          ]}
        >
          <ScrollView 
            style={styles.categoryScrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {STORE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedCategoryItem,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text style={styles.categoryItemIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === category.id && styles.selectedCategoryItemText,
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {storeCount} {storeCount === 1 ? 'store' : 'stores'} found
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textInverse,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: COLORS.white60,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  categoryHeaderText: {
    fontSize: 16,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.white80,
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  categoryList: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    marginTop: 10,
    overflow: 'hidden',
  },
  categoryScrollView: {
    maxHeight: 280,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCategoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryItemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white80,
  },
  selectedCategoryItemText: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingTop: 5,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.white70,
    fontWeight: '500',
  },
});
