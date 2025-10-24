export const COLORS = {
  primary: '#708238',      // Olive Green
  secondary: '#FFD700',    // Yellow/Gold
  accent: '#F4C430',       // Lighter Yellow
  background: '#FFFFFF',   // White
  text: '#000000',         // Black
  textLight: '#666666',    // Gray
  textWhite: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  border: '#E0E0E0',
  shadow: '#000000',
  disabled: '#CCCCCC',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  title: 32,
  
  // Spacing
  padding: 16,
  margin: 16,
  radius: 12,
  borderRadius: 8,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};
