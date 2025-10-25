import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import api from '../services/api';
import { COLORS, FONT_SIZES } from '../config/theme';
import Header from "../components/receiver/Header";
import BottomNav from "../components/receiver/BottomNav";

const DonateForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [foodType, setFoodType] = useState('');
  const [targetReceiverType, setTargetReceiverType] = useState('both'); // New field
  const [foodItems, setFoodItems] = useState([{ dishName: '', quantity: '' }]);
  const [foodImage, setFoodImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    address: '',
    phone: ''
  });
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);

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
          setLocationData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          setMarker({ lat, lng });
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationData(prev => ({
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
        setLocationData(prev => ({
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
        setLocationData(prev => ({
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
    setLocationData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    reverseGeocode(lat, lng);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, { dishName: '', quantity: '' }]);
  };

  const removeFoodItem = (index) => {
    if (foodItems.length > 1) {
      const newItems = foodItems.filter((_, i) => i !== index);
      setFoodItems(newItems);
    }
  };

  const updateFoodItem = (index, field, value) => {
    const newItems = [...foodItems];
    newItems[index][field] = value;
    setFoodItems(newItems);
  };

  const isStep1Valid = () => {
    return foodType !== '' && 
           targetReceiverType !== '' &&
           foodItems.every(item => item.dishName.trim() && item.quantity.trim());
  };

  const isStep2Valid = () => {
    return locationData.latitude && 
           locationData.longitude && 
           locationData.address.trim() && 
           locationData.phone.trim().length === 10;
  };

  const goToLocationStep = () => {
    if (isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const submitDonation = async () => {
    if (!isStep2Valid()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('foodItems', JSON.stringify(foodItems));
      formData.append('foodType', foodType);
      formData.append('targetReceiverType', targetReceiverType); // Add this
      formData.append('latitude', locationData.latitude);
      formData.append('longitude', locationData.longitude);
      formData.append('address', locationData.address);
      formData.append('phone', locationData.phone);
      formData.append('firebaseUid', auth.currentUser?.uid);
      
      if (foodImage) {
        formData.append('foodImage', foodImage);
      }

      const token = await auth.currentUser.getIdToken();

      const response = await api.post('/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting donation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        navigate(-1);
      }
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDone = () => {
    navigate('/home');
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
  };

  const mapCenter = {
    lat: locationData.latitude || 17.385044,
    lng: locationData.longitude || 78.486671
  };

  // Donate To options
  const donateToOptions = [
    { id: 'individual', label: 'Individual', icon: '👤', desc: 'Donate to individuals in need' },
    { id: 'ngo', label: 'Organizations', icon: '🏢', desc: 'NGOs, Charities, Ashrams, etc.' },
    { id: 'both', label: 'Anyone', icon: '🤝', desc: 'Open to all' },
  ];

  return (
    
    <div className="page" style={styles.container}>
      <Header  />
      <div style={styles.header}>
        <h1 style={styles.title}>Donate Food</h1>
      </div>

      <div style={styles.content}>
        {/* Step 1: Food Details */}
        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Food Details</h2>
              <p style={styles.formSubtitle}>Tell us what you're donating</p>
              
              {/* Food Type */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Food Type</label>
                <div style={styles.foodTypeGrid}>
                  <div 
                    style={{
                      ...styles.foodTypeCard,
                      ...(foodType === 'veg' && styles.foodTypeCardSelected)
                    }}
                    onClick={() => setFoodType('veg')}
                  >
                    <div style={styles.foodTypeIcon}>🥗</div>
                    <div style={styles.foodTypeLabel}>Veg</div>
                  </div>
                  <div 
                    style={{
                      ...styles.foodTypeCard,
                      ...(foodType === 'nonveg' && styles.foodTypeCardSelected)
                    }}
                    onClick={() => setFoodType('nonveg')}
                  >
                    <div style={styles.foodTypeIcon}>🍗</div>
                    <div style={styles.foodTypeLabel}>Non-Veg</div>
                  </div>
                </div>
              </div>

              {/* Donate To - NEW FIELD */}
{/* Donate To - UPDATED FOR HORIZONTAL */}
<div style={styles.formGroup}>
  <label style={styles.formLabel}>Donate To</label>
  <div style={styles.donateToContainerHorizontal}>
    {donateToOptions.map(option => (
      <div
        key={option.id}
        style={{
          ...styles.donateToCardHorizontal,
          ...(targetReceiverType === option.id && styles.donateToCardSelected)
        }}
        onClick={() => setTargetReceiverType(option.id)}
      >
        <div style={styles.donateToIconSmall}>{option.icon}</div>
        <div style={styles.donateToLabelSmall}>{option.label}</div>
        {targetReceiverType === option.id && (
          <div style={styles.checkmarkSmall}>✓</div>
        )}
      </div>
    ))}
  </div>
</div>


              {/* Food Image Upload */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Food Image (Optional)</label>
                <div style={styles.imageUploadContainer}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="food-image-input"
                  />
                  <label htmlFor="food-image-input" style={styles.imageUploadLabel}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                    ) : (
                      <div style={styles.imageUploadPlaceholder}>
                        <div style={styles.uploadIcon}>📷</div>
                        <div>Click to upload food image</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Food Items */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Food Items</label>
                {foodItems.map((item, index) => (
                  <div key={index} style={styles.foodItemRow}>
                    <div style={styles.foodItemInputs}>
                      <input 
                        type="text"
                        style={{ ...styles.formInput, flex: 2 }}
                        placeholder="Dish name (e.g., Biryani)"
                        value={item.dishName}
                        onChange={(e) => updateFoodItem(index, 'dishName', e.target.value)}
                      />
                      <input 
                        type="text"
                        style={{ ...styles.formInput, flex: 1 }}
                        placeholder="Qty (e.g., 5 plates)"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    {foodItems.length > 1 && (
                      <button 
                        style={styles.removeBtn}
                        onClick={() => removeFoodItem(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                <button style={styles.addBtn} onClick={addFoodItem}>
                  <span style={styles.addBtnIcon}>+</span>
                  <span>Add More Food Items</span>
                </button>
              </div>

              <div style={styles.btnGroup}>
                <button style={styles.btnSecondary} onClick={handleBack}>Cancel</button>
                <button 
                  style={{
                    ...styles.btnPrimary,
                    opacity: isStep1Valid() ? 1 : 0.5,
                    cursor: isStep1Valid() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isStep1Valid()}
                  onClick={goToLocationStep}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location with Google Maps */}
        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Pickup Location</h2>
              <p style={styles.formSubtitle}>Where can the food be collected from?</p>

              {/* Address Search */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Search Address</label>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    style={styles.searchInput}
                    placeholder="Enter address to search..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  />
                  <button style={styles.searchBtn} onClick={searchLocation}>
                    🔍
                  </button>
                </div>
              </div>

              {/* Google Map */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Pin Location (Click on map or drag marker)</label>
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
                          setLocationData(prev => ({
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
                  style={styles.gpsBtn}
                  onClick={getCurrentLocation}
                >
                  📍 Use Current Location
                </button>
              </div>

              {/* Address Display */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Selected Address</label>
                <textarea
                  style={styles.formTextarea}
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  placeholder="Address will appear here..."
                />
              </div>

              {/* Contact Number */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Contact Number</label>
                <input 
                  type="tel"
                  style={styles.formInput}
                  placeholder="e.g., 9876543210"
                  maxLength="10"
                  value={locationData.phone}
                  onChange={(e) => setLocationData({ ...locationData, phone: e.target.value })}
                />
              </div>

              <div style={styles.btnGroup}>
                <button style={styles.btnSecondary} onClick={handleBack}>Back</button>
                <button 
                  style={{
                    ...styles.btnPrimary,
                    opacity: isStep2Valid() ? 1 : 0.5,
                    cursor: isStep2Valid() ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isStep2Valid() || loading}
                  onClick={submitDonation}
                >
                  {loading ? 'Submitting...' : 'Submit Donation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <div style={styles.formCard}>
              <div style={styles.successContainer}>
                <div style={styles.successIcon}>🎉</div>
                <h2 style={styles.successTitle}>Donation Submitted!</h2>
                <p style={styles.successText}>
                  Thank you for your generosity. Your food donation has been registered and will be visible to receivers nearby.
                </p>

                <div style={styles.donationSummary}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Food Type:</span>
                    <span style={styles.summaryValue}>
                      {foodType === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'}
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Donate To:</span>
                    <span style={styles.summaryValue}>
                      {targetReceiverType === 'individual' && '👤 Individual'}
                      {targetReceiverType === 'ngo' && '🏢 Organizations'}
                      {targetReceiverType === 'both' && '🤝 Anyone'}
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Items:</span>
                    <span style={styles.summaryValue}>{foodItems.length} dish(es)</span>
                  </div>
                  {foodItems.map((item, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>• {item.dishName}:</span>
                      <span style={styles.summaryValue}>{item.quantity}</span>
                    </div>
                  ))}
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Location:</span>
                    <span style={styles.summaryValue}>{locationData.address.substring(0, 50)}...</span>
                  </div>
                </div>

                <button 
                  style={{ ...styles.btnPrimary, width: '100%' }}
                  onClick={handleDone}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
     <BottomNav />
     </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    paddingBottom: '80px',
    background: '#F9F9F9',
  },
  header: {
    color: COLORS.accent,
    padding: '7px',
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  content: {
    padding: '15px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  stepContent: {
    animation: 'fadeIn 0.3s ease',
  },
  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  formSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  foodTypeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  foodTypeCard: {
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  foodTypeCardSelected: {
    borderColor: COLORS.primary,
    background: '#F5F7F0',
  },
  foodTypeIcon: {
    fontSize: '32px',
    marginBottom: '4px',
  },
  foodTypeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
   // NEW: Horizontal layout for "Donate To"
  donateToContainerHorizontal: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  donateToCardHorizontal: {
    background: 'white',
    border: `2px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '16px 12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '100px',
  },
  donateToIconSmall: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  donateToLabelSmall: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  checkmarkSmall: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderRadius: '10px',
    background: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  imageUploadContainer: {
    width: '100%',
  },
  imageUploadLabel: {
    display: 'block',
    width: '100%',
    minHeight: '200px',
    border: `2px dashed ${COLORS.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
    background: '#F9F9F9',
  },
  imagePreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  imageUploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    color: COLORS.textLight,
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  foodItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  foodItemInputs: {
    display: 'flex',
    gap: '8px',
    flex: 1,
  },
  formInput: {
    padding: '12px 16px',
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    background: 'white',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    width: '100%',
  },
  formTextarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    background: 'white',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  removeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: `2px solid ${COLORS.error}`,
    background: 'white',
    color: COLORS.error,
    fontSize: '18px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `2px dashed ${COLORS.primary}`,
    background: 'rgba(112, 130, 56, 0.05)',
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  addBtnIcon: {
    fontSize: '20px',
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
  btnGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: COLORS.primary,
    color: 'white',
  },
  btnSecondary: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
    background: 'white',
    color: COLORS.text,
    border: `2px solid ${COLORS.border}`,
  },
  successContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: '12px',
  },
  successText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: '24px',
  },
  donationSummary: {
    background: 'rgba(112, 130, 56, 0.05)',
    border: `2px solid ${COLORS.primary}`,
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'left',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: FONT_SIZES.sm,
  },
  summaryLabel: {
    color: COLORS.textLight,
  },
  summaryValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
};

export default DonateForm;
