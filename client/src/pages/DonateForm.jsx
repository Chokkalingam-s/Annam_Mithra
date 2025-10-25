import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import api from '../services/api';

const DonateForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [foodType, setFoodType] = useState('');
  const [targetReceiverType, setTargetReceiverType] = useState('both');
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

  // Get responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      formData.append('targetReceiverType', targetReceiverType);
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
    height: isMobile ? '300px' : '400px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB'
  };

  const mapCenter = {
    lat: locationData.latitude || 17.385044,
    lng: locationData.longitude || 78.486671
  };

  const donateToOptions = [
    { id: 'individual', label: 'Individual', icon: '👤' },
    { id: 'ngo', label: 'Organizations', icon: '🏢' },
    { id: 'both', label: 'Anyone', icon: '🤝' },
  ];

  return (
    <div style={styles.container}>
      {/* Header - Matching ReceiverHome */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={handleBack}>
              <span style={styles.backIcon}>←</span>
              <span style={styles.backText}>Back</span>
            </button>
          </div>
          <h1 style={{...styles.pageTitle, ...(isMobile && styles.pageTitleMobile)}}>
            Donate Food
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Step 1: Food Details */}
          {currentStep === 1 && (
            <div style={styles.stepContent}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Food Details</h2>
                <p style={styles.cardSubtitle}>Tell us what you're donating</p>
                
                {/* Food Type */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Food Type</label>
                  <div style={{...styles.foodTypeGrid, ...(isMobile && styles.foodTypeGridMobile)}}>
                    <FoodTypeCard 
                      icon="🥗"
                      label="Vegetarian"
                      selected={foodType === 'veg'}
                      onClick={() => setFoodType('veg')}
                    />
                    <FoodTypeCard 
                      icon="🍗"
                      label="Non-Veg"
                      selected={foodType === 'nonveg'}
                      onClick={() => setFoodType('nonveg')}
                    />
                  </div>
                </div>

                {/* Donate To */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Donate To</label>
                  <div style={{...styles.donateToGrid, ...(isMobile && styles.donateToGridMobile)}}>
                    {donateToOptions.map(option => (
                      <DonateToCard
                        key={option.id}
                        icon={option.icon}
                        label={option.label}
                        selected={targetReceiverType === option.id}
                        onClick={() => setTargetReceiverType(option.id)}
                      />
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
                          <div style={styles.uploadText}>Click to upload food image</div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Food Items */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Food Items</label>
                  {foodItems.map((item, index) => (
                    <FoodItemRow
                      key={index}
                      item={item}
                      index={index}
                      onUpdate={updateFoodItem}
                      onRemove={removeFoodItem}
                      canRemove={foodItems.length > 1}
                      isMobile={isMobile}
                    />
                  ))}
                  
                  <button style={styles.addButton} onClick={addFoodItem}>
                    <span style={styles.addButtonIcon}>+</span>
                    <span>Add More Food Items</span>
                  </button>
                </div>

                <div style={{...styles.buttonGroup, ...(isMobile && styles.buttonGroupMobile)}}>
                  <button style={{...styles.btnSecondary, ...(isMobile && styles.btnMobile)}} onClick={handleBack}>
                    Cancel
                  </button>
                  <button 
                    style={{
                      ...styles.btnPrimary,
                      ...(isMobile && styles.btnMobile),
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

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div style={styles.stepContent}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Pickup Location</h2>
                <p style={styles.cardSubtitle}>Where can the food be collected from?</p>

                {/* Address Search */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Search Address</label>
                  <div style={styles.searchContainer}>
                    <input
                      type="text"
                      style={{...styles.searchInput, ...(isMobile && styles.searchInputMobile)}}
                      placeholder="Enter address to search..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    />
                    <button style={{...styles.searchButton, ...(isMobile && styles.searchButtonMobile)}} onClick={searchLocation}>
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
                  <button style={styles.gpsButton} onClick={getCurrentLocation}>
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

                <div style={{...styles.buttonGroup, ...(isMobile && styles.buttonGroupMobile)}}>
                  <button style={{...styles.btnSecondary, ...(isMobile && styles.btnMobile)}} onClick={handleBack}>
                    Back
                  </button>
                  <button 
                    style={{
                      ...styles.btnPrimary,
                      ...(isMobile && styles.btnMobile),
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
              <div style={styles.card}>
                <div style={styles.successContainer}>
                  <div style={styles.successIcon}>🎉</div>
                  <h2 style={styles.successTitle}>Donation Submitted!</h2>
                  <p style={styles.successText}>
                    Thank you for your generosity. Your food donation has been registered and will be visible to receivers nearby.
                  </p>

                  <div style={styles.summaryCard}>
                    <SummaryItem label="Food Type:" value={foodType === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'} />
                    <SummaryItem 
                      label="Donate To:" 
                      value={
                        targetReceiverType === 'individual' ? '👤 Individual' :
                        targetReceiverType === 'ngo' ? '🏢 Organizations' : '🤝 Anyone'
                      } 
                    />
                    <SummaryItem label="Items:" value={`${foodItems.length} dish(es)`} />
                    {foodItems.map((item, idx) => (
                      <SummaryItem key={idx} label={`• ${item.dishName}:`} value={item.quantity} />
                    ))}
                    <SummaryItem label="Location:" value={`${locationData.address.substring(0, 50)}...`} />
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
      </main>
    </div>
  );
};

// Helper Components
const FoodTypeCard = ({ icon, label, selected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...styles.selectionCard,
        ...(selected && styles.selectionCardSelected),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.selectionIcon}>{icon}</div>
      <div style={styles.selectionLabel}>{label}</div>
    </div>
  );
};

const DonateToCard = ({ icon, label, selected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...styles.donateToCard,
        ...(selected && styles.donateToCardSelected),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.donateToIcon}>{icon}</div>
      <div style={styles.donateToLabel}>{label}</div>
      {selected && <div style={styles.checkmark}>✓</div>}
    </div>
  );
};

const FoodItemRow = ({ item, index, onUpdate, onRemove, canRemove, isMobile }) => (
  <div style={{...styles.foodItemRow, ...(isMobile && styles.foodItemRowMobile)}}>
    <div style={styles.foodItemInputs}>
      <input 
        type="text"
        style={{ ...styles.formInput, ...styles.formInputFlex2, ...(isMobile && styles.formInputMobile) }}
        placeholder="Dish name"
        value={item.dishName}
        onChange={(e) => onUpdate(index, 'dishName', e.target.value)}
      />
      <input 
        type="text"
        style={{ ...styles.formInput, ...styles.formInputFlex1, ...(isMobile && styles.formInputMobile) }}
        placeholder="Quantity"
        value={item.quantity}
        onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
      />
    </div>
    {canRemove && (
      <button style={styles.removeButton} onClick={() => onRemove(index)}>
        ✕
      </button>
    )}
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div style={styles.summaryRow}>
    <span style={styles.summaryLabel}>{label}</span>
    <span style={styles.summaryValue}>{value}</span>
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAFBFC',
  },
  
  // Header - Matching ReceiverHome
  header: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
  },
  headerLeft: {
    marginBottom: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    color: '#7C9D3D',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  backIcon: {
    fontSize: '18px',
  },
  backText: {
    fontSize: '15px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  pageTitleMobile: {
    fontSize: '20px',
  },
  
  // Main Content
  main: {
    padding: '24px 16px',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  stepContent: {
    animation: 'fadeIn 0.3s ease',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '6px',
    letterSpacing: '-0.01em',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '24px',
  },
  
  // Form Elements
  formGroup: {
    marginBottom: '24px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '10px',
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#1F2937',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  formInputMobile: {
    fontSize: '14px',
    padding: '10px 12px',
  },
  formInputFlex2: {
    flex: 2,
  },
  formInputFlex1: {
    flex: 1,
  },
  formTextarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#1F2937',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  
  // Selection Cards
  foodTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  foodTypeGridMobile: {
    gap: '10px',
  },
  selectionCard: {
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectionCardSelected: {
    borderColor: '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.04)',
  },
  selectionIcon: {
    fontSize: '36px',
    marginBottom: '8px',
  },
  selectionLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
  },
  
  // Donate To Cards
  donateToGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  donateToGridMobile: {
    gap: '10px',
  },
  donateToCard: {
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    padding: '16px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '100px',
  },
  donateToCardSelected: {
    borderColor: '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.04)',
  },
  donateToIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  donateToLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#7C9D3D',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
  },
  
  // Image Upload
  imageUploadContainer: {
    width: '100%',
  },
  imageUploadLabel: {
    display: 'block',
    width: '100%',
    minHeight: '200px',
    border: '2px dashed #E5E7EB',
    borderRadius: '10px',
    cursor: 'pointer',
    overflow: 'hidden',
    background: '#F9FAFB',
    transition: 'border-color 0.2s ease',
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
    color: '#6B7280',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.6,
  },
  uploadText: {
    fontSize: '14px',
  },
  
  // Food Items
  foodItemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px',
  },
  foodItemRowMobile: {
    flexDirection: 'column',
    gap: '8px',
  },
  foodItemInputs: {
    display: 'flex',
    gap: '10px',
    flex: 1,
  },
  removeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #EF4444',
    background: '#FFFFFF',
    color: '#EF4444',
    fontSize: '16px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  addButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px dashed #7C9D3D',
    background: 'rgba(124, 157, 61, 0.04)',
    color: '#7C9D3D',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
    transition: 'all 0.2s ease',
  },
  addButtonIcon: {
    fontSize: '18px',
  },
  
  // Search
  searchContainer: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
  },
  searchInputMobile: {
    fontSize: '14px',
    padding: '10px 12px',
  },
  searchButton: {
    padding: '12px 18px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s ease',
  },
  searchButtonMobile: {
    padding: '10px 16px',
    fontSize: '16px',
  },
  gpsButton: {
    width: '100%',
    marginTop: '12px',
    padding: '12px',
    background: '#F9FAFB',
    color: '#1F2937',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  
  // Buttons
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  buttonGroupMobile: {
    flexDirection: 'column',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: '#7C9D3D',
    color: '#FFFFFF',
    transition: 'all 0.2s ease',
  },
  btnSecondary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#FFFFFF',
    color: '#1F2937',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
  },
  btnMobile: {
    padding: '12px 16px',
    fontSize: '14px',
  },
  
  // Success Screen
  successContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  successIcon: {
    fontSize: '72px',
    marginBottom: '20px',
    animation: 'scaleIn 0.5s ease',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '12px',
    letterSpacing: '-0.01em',
  },
  successText: {
    fontSize: '15px',
    color: '#6B7280',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  summaryCard: {
    background: 'rgba(124, 157, 61, 0.04)',
    border: '1px solid #7C9D3D',
    borderRadius: '10px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  summaryLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
};

export default DonateForm;
