import React from 'react';
import { Image, StyleSheet } from 'react-native';

const Logo = ({ size = 80, style }) => {
  return (
    <Image 
      source={require('../../assets/logo.png')} 
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Base styles
  },
});

export default Logo;
