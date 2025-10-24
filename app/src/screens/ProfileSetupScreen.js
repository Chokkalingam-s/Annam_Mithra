import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';

const ProfileSetupScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { updateProfile } = useAuth();
  const { firebaseUid, email } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vegPreference: 'both',
    receiverType: null,
    address: '',
    latitude: null,
    longitude: null,
    roles: ['donor'], // Everyone is a donor by default
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const vegOptions = [
    { id: 'veg', label: t('veg'), icon: '🥗' },
    { id: 'non-veg', label: t('non_veg'), icon: '🍗' },
    { id: 'both', label: t('both'), icon: '🍽️' },
  ];

  const receiverTypes = [
    { id: 'individual', label: t('individual'), icon: '👤' },
    { id: 'ngo', label: t('ngo'), icon: '🏢' },
    { id: 'charity', label: t('charity'), icon: '❤️' },
    { id: 'ashram', label: t('ashram'), icon: '🕉️' },
    { id: 'bulk', label: t('bulk_receiver'), icon: '📦' },
  ];

  const roleOptions = [
    { id: 'receiver', label: t('receive_food'), icon: '🙏' },
    { id: 'volunteer', label: t('volunteer_delivery'), icon: '🚴' },
  ];

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].street}, ${address[0].city}, ${address[0].region}` : 
          'Location detected',
      }));

      Alert.alert('Success', 'Location detected!');
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const toggleRole = (roleId) => {
    setFormData(prev => {
      const roles = prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId];
      
      // If receiver role is removed, clear receiverType
      if (roleId === 'receiver' && !roles.includes('receiver')) {
        return { ...prev, roles, receiverType: null };
      }
      
      return { ...prev, roles };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    // If user wants to receive food, receiverType is required
    if (formData.roles.includes('receiver') && !formData.receiverType) {
      newErrors.receiverType = 'Please select receiver type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare profile data
      const profileData = {
        firebaseUid,
        email,
        name: formData.name,
        phone: formData.phone,
        vegPreference: formData.vegPreference,
        receiverType: formData.receiverType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        role: formData.roles.join(','), // Store multiple roles as comma-separated
        profileCompleted: true,
      };

      await updateProfile(profileData);
      
      Alert.alert('Success', 'Profile created successfully!');
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('complete_profile')}</Text>
        <Text style={styles.subtitle}>{t('profile_desc')}</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Input
          label={t('full_name')}
          placeholder={t('enter_name')}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          error={errors.name}
        />

        <Input
          label={t('mobile_number')}
          placeholder={t('enter_mobile')}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
          error={errors.phone}
        />
      </View>

      {/* Food Preference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('food_preference')}</Text>
        <View style={styles.optionsRow}>
          {vegOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                formData.vegPreference === option.id && styles.optionCardSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, vegPreference: option.id }))}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Additional Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('also_want_to')}</Text>
        <Text style={styles.helperText}>Select all that apply (You're already a donor!)</Text>
        
        {roleOptions.map(role => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.checkboxCard,
              formData.roles.includes(role.id) && styles.checkboxCardSelected
            ]}
            onPress={() => toggleRole(role.id)}
          >
            <Text style={styles.checkboxIcon}>{role.icon}</Text>
            <Text style={styles.checkboxLabel}>{role.label}</Text>
            {formData.roles.includes(role.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Receiver Type (only if receiver role selected) */}
      {formData.roles.includes('receiver') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('receiver_type')}</Text>
          <View style={styles.optionsGrid}>
            {receiverTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.gridCard,
                  formData.receiverType === type.id && styles.gridCardSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, receiverType: type.id }))}
              >
                <Text style={styles.gridIcon}>{type.icon}</Text>
                <Text style={styles.gridLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.receiverType && <Text style={styles.errorText}>{errors.receiverType}</Text>}
        </View>
      )}

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('location')}</Text>
        
        <Input
          label={t('address')}
          placeholder={t('enter_address')}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          multiline
          error={errors.address}
        />

        <Button
          title={t('use_current_location')}
          variant="outline"
          onPress={getCurrentLocation}
          style={{ marginTop: 8 }}
        />
      </View>

      <Button
        title={t('continue')}
        variant="primary"
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F7F0',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: SIZES.small,
    color: COLORS.text,
    textAlign: 'center',
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 12,
  },
  checkboxCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F7F0',
  },
  checkboxIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '30%',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    alignItems: 'center',
  },
  gridCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F7F0',
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: SIZES.small,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default ProfileSetupScreen;
