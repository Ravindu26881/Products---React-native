import { Platform } from 'react-native';

// Font constants
export const FONTS = {
  CAKE_BY_DEE: 'CakeByDee',
  FASHION_HOME: 'FashionHome',
};

// Store ID to font mapping
const FONT_MAP = {
  '689234aecf16a62557e35719': FONTS.CAKE_BY_DEE,
  '68924f8674acc9f4b7cf8028': FONTS.FASHION_HOME,
};

// Default fallback fonts by platform
const DEFAULT_FONTS = {
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
  ios: 'System',
  android: 'System',
  default: 'System',
};

/**
 * Get font family based on store ID
 * @param {string} storeId - The store ID to map to a font
 * @returns {string} - The font family name
 */
export const getFontFamily = (storeId) => {
  const customFont = FONT_MAP[storeId];
  if (customFont) {
    // For web, include fallback fonts in the same string
    if (Platform.OS === 'web') {
      return `${customFont}, ${DEFAULT_FONTS.web}`;
    }
    return customFont;
  }
  
  // Return platform-specific fallback
  return DEFAULT_FONTS[Platform.OS] || DEFAULT_FONTS.default;
};

/**
 * Get font family with custom fallback
 * @param {string} storeId - The store ID to map to a font
 * @param {string} fallback - Custom fallback font
 * @returns {string} - The font family name
 */
export const getFontFamilyWithFallback = (storeId, fallback) => {
  return FONT_MAP[storeId] || fallback || getFontFamily(storeId);
};

/**
 * Check if a store has a custom font
 * @param {string} storeId - The store ID to check
 * @returns {boolean} - Whether the store has a custom font
 */
export const hasCustomFont = (storeId) => {
  return Boolean(FONT_MAP[storeId]);
};

/**
 * Get all available custom fonts
 * @returns {Object} - Object containing all font constants
 */
export const getAvailableFonts = () => {
  return { ...FONTS };
};

/**
 * Add or update a font mapping
 * @param {string} storeId - The store ID
 * @param {string} fontName - The font name to map to
 */
export const addFontMapping = (storeId, fontName) => {
  FONT_MAP[storeId] = fontName;
};