import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  ...props 
}) => {
  return (
    <div style={{ marginBottom: SPACING.md }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: SPACING.sm,
          fontSize: FONT_SIZES.sm,
          fontWeight: '600',
          color: COLORS.text,
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: SPACING.md,
          fontSize: FONT_SIZES.md,
          border: `1px solid ${error ? COLORS.error : COLORS.border}`,
          borderRadius: BORDER_RADIUS.md,
          outline: 'none',
          transition: 'border-color 0.3s',
        }}
        {...props}
      />
      {error && (
        <span style={{
          display: 'block',
          marginTop: SPACING.xs,
          fontSize: FONT_SIZES.xs,
          color: COLORS.error,
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
