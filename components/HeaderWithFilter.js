import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function HeaderWithFilter({ 
  title, 
  showFilter, 
  onFilterToggle, 
  titleStyle = {},
  containerStyle = {} 
}) {
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth timing animation instead of spring
    Animated.timing(rotateAnimation, {
      toValue: showFilter ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilter, rotateAnimation]);

  const handleTogglePress = () => {
    // Scale animation for press feedback
    Animated.sequence([
      Animated.spring(scaleAnimation, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    onFilterToggle();
  };

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.headerContent}>
        <Text style={[styles.subtitle, titleStyle]}>{title}</Text>
        <TouchableOpacity 
          style={styles.filterToggle} 
          onPress={handleTogglePress}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.filterIconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: scaleAnimation }
                ]
              }
            ]}
          >
            {/*<Text style={[styles.filterIcon, showFilter && styles.filterIconActive]}>*/}
            {/*  {showFilter ? '🔽' : '🔧'}*/}
            {/*</Text>*/}
          </Animated.View>
          <Text style={[styles.filterText, showFilter && styles.filterTextActive]}>
            {showFilter ? 'Hide' : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    // padding: 20,
    backgroundColor: COLORS.appBackground,
    marginRight: -20,
    marginLeft: -20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bordersLight,
  },
  filterIconContainer: {
  },
  filterIcon: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  filterIconActive: {
    color: COLORS.textPrimary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});
