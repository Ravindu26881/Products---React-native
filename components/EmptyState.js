import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function EmptyState({ 
  icon = '📦', 
  title = 'No items found', 
  message = 'Try adjusting your search or filters',
  actionText,
  onActionPress,
  containerStyle = {},
  fullScreen = true
}) {
  return (
    <View style={[fullScreen ? styles.container : styles.inlineContainer, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionText && onActionPress && (
          <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
            <Text style={styles.actionButtonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inlineContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textOnWhite,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textOnWhite,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: COLORS.appBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
