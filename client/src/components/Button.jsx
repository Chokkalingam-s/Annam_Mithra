import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style = {}
}) => {
  const baseStyle = {
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.textWhite,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      color: COLORS.text,
    },
    outline: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
      border: `2px solid ${COLORS.primary}`,
    }
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[variant] }}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
