import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vegPreference: 'both',
    receiverType: '',
    address: '',
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');

  // Get user's current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          setMarker({ lat, lng });
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location (Hyderabad, India)
          setFormData(prev => ({
            ...prev,
            latitude: 17.385044,
            longitude: 78.486671
          }));
          setMarker({ lat: 17.385044, lng: 78.486671 });
        }
      );
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        setFormData(prev => ({
          ...prev,
          address: data.results[0].formatted_address
        }));
        setSearchAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        const location = data.results[0].geometry.location;
        setFormData(prev => ({
          ...prev,
          latitude: location.lat,
          longitude: location.lng,
          address: data.results[0].formatted_address
        }));
        setMarker({ lat: location.lat, lng: location.lng });
        if (map) {
          map.panTo(location);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    reverseGeocode(lat, lng);
  }, []);

  const vegOptions = [
    { id: 'veg', label: 'Vegetarian', icon: '🥗' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🍗' },
    { id: 'both', label: 'Both', icon: '🍽️' },
  ];

  const receiverTypes = [
    { id: 'individual', label: 'Individual', icon: '👤' },
    { id: 'ngo', label: 'NGO', icon: '🏢' },
    { id: 'charity', label: 'Charity', icon: '❤️' },
    { id: 'ashram', label: 'Ashram', icon: '🕉️' },
    { id: 'bulk', label: 'Bulk Receiver', icon: '📦' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.receiverType) newErrors.receiverType = 'Please select receiver type';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Please select your location on the map';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const profile = {
        firebaseUid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        name: formData.name,
        phone: formData.phone,
        vegPreference: formData.vegPreference,
        receiverType: formData.receiverType,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // Get Firebase token
      const token = await auth.currentUser.getIdToken();
      
      // Send to backend
      const response = await api.post('/users/profile', profile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify({
          ...response.data.data,
          profileCompleted: true,
        }));
        
        alert('Profile created successfully!');
        window.location.href = '/home';
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
  };

  const mapCenter = {
    lat: formData.latitude || 17.385044,
    lng: formData.longitude || 78.486671
  };

  return (
    <div className="page" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Complete Your Profile</h1>
        <p style={styles.subtitle}>Help us personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Basic Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            error={errors.name}
          />

          <Input
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            error={errors.phone}
          />
        </div>

        {/* Food Preference */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Food Preference</h3>
          <div style={styles.optionsRow}>
            {vegOptions.map(option => (
              <div
                key={option.id}
                style={{
                  ...styles.optionCard,
                  ...(formData.vegPreference === option.id ? styles.optionCardSelected : {})
                }}
                onClick={() => setFormData({ ...formData, vegPreference: option.id })}
              >
                <div style={styles.optionIcon}>{option.icon}</div>
                <div style={styles.optionLabel}>{option.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Receiver Type */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>I am a</h3>
          <div style={styles.gridContainer}>
            {receiverTypes.map(type => (
              <div
                key={type.id}
                style={{
                  ...styles.gridCard,
                  ...(formData.receiverType === type.id ? styles.gridCardSelected : {})
                }}
                onClick={() => setFormData({ ...formData, receiverType: type.id })}
              >
                <div style={styles.gridIcon}>{type.icon}</div>
                <div style={styles.gridLabel}>{type.label}</div>
              </div>
            ))}
          </div>
          {errors.receiverType && (
            <p style={styles.errorText}>{errors.receiverType}</p>
          )}
        </div>

        {/* Location with Google Maps */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your Location</h3>
          
          {/* Address Search */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Search Address</label>
            <div style={styles.searchContainer}>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search for your location..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
              />
              <button 
                type="button"
                style={styles.searchBtn} 
                onClick={searchLocation}
              >
                🔍
              </button>
            </div>
          </div>

          {/* Google Map */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Pin Your Location</label>
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={onMapClick}
                onLoad={setMap}
              >
                {marker && (
                  <Marker
                    position={marker}
                    draggable={true}
                    onDragEnd={(e) => {
                      const lat = e.latLng.lat();
                      const lng = e.latLng.lng();
                      setMarker({ lat, lng });
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                      }));
                      reverseGeocode(lat, lng);
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
            <button 
              type="button"
              style={styles.gpsBtn}
              onClick={getCurrentLocation}
            >
              📍 Use Current Location
            </button>
            {errors.location && (
              <p style={styles.errorText}>{errors.location}</p>
            )}
          </div>

          {/* Address Display */}
          <div style={styles.formGroup}>
            <Input
              label="Selected Address"
              placeholder="Address will appear here..."
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              error={errors.address}
            />
          </div>
        </div>

        <Button type="submit" loading={loading}>
          Complete Setup
        </Button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    maxWidth: '700px',
    margin: '0 auto',
    background: '#F9F9F9',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    marginTop: '20px',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '12px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  optionsRow: {
    display: 'flex',
    gap: '12px',
  },
  optionCard: {
    flex: 1,
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    background: '#F5F7F0',
  },
  optionIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  optionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  gridCard: {
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  gridCardSelected: {
    borderColor: COLORS.primary,
    background: '#F5F7F0',
  },
  gridIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  gridLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  searchContainer: {
    display: 'flex',
    gap: '8px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: FONT_SIZES.md,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    outline: 'none',
  },
  searchBtn: {
    padding: '12px 20px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
  },
  gpsBtn: {
    width: '100%',
    marginTop: '12px',
    padding: '12px',
    background: COLORS.secondary,
    color: COLORS.text,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: '4px',
  },
};

export default ProfileSetup;
