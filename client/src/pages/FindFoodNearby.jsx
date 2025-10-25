import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import api from '../services/api';
import { COLORS, FONT_SIZES } from '../config/theme';

const FindFoodNearby = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('Getting location...');
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [tempLocation, setTempLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyDonations();
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setTempLocation(location);
          reverseGeocode(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLocation = { lat: 17.385044, lng: 78.486671 };
          setUserLocation(defaultLocation);
          setTempLocation(defaultLocation);
          setCurrentAddress('Hyderabad, India');
          setLoading(false);
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
        setCurrentAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyDonations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.get('/donations/nearby', {
        params: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 2
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
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
        setTempLocation({ lat: location.lat, lng: location.lng });
        if (map) {
          map.panTo(location);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleMapClick = useCallback((e) => {
    setTempLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  }, []);

  const updateLocation = () => {
    if (tempLocation) {
      setUserLocation(tempLocation);
      reverseGeocode(tempLocation.lat, tempLocation.lng);
      setShowLocationModal(false);
    }
  };

  const handleMarkerClick = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
    setRequestMessage('');
  };

  const sendWillingness = async () => {
    if (!selectedDonation) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post('/donations/interest', {
        donationId: selectedDonation.id,
        message: requestMessage,
        firebaseUid: auth.currentUser?.uid
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Request sent successfully!');
        setShowDetailModal(false);
        setRequestMessage('');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
  };

  // Simple marker icons (no window.google.maps needed)
  const userLocationIcon = {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: COLORS.primary,
    fillOpacity: 0.9,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1.5,
  };

  const vegIcon = {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: '#34C759',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1,
  };

  const nonVegIcon = {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: '#FF6B6B',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Getting your location...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Location */}
      <div style={styles.header}>
        <div style={styles.locationInfo}>
          <div style={styles.locationIcon}>📍</div>
          <div style={styles.locationText}>
            <div style={styles.locationTitle}>Current Location</div>
            <div style={styles.locationAddress}>{currentAddress}</div>
          </div>
        </div>
        <button 
          style={styles.changeLocationBtn}
          onClick={() => setShowLocationModal(true)}
        >
          Change Location
        </button>
      </div>

      {/* Map with Donation Pins */}
      <div style={styles.mapContainer}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
            onLoad={setMap}
          >
            {/* User Location Marker */}
            <Marker
              position={userLocation}
              icon={userLocationIcon}
              title="Your Location"
            />

            {/* Donation Markers */}
            {donations.map((donation) => (
              <Marker
                key={donation.id}
                position={{
                  lat: parseFloat(donation.latitude),
                  lng: parseFloat(donation.longitude)
                }}
                icon={donation.foodType === 'veg' ? vegIcon : nonVegIcon}
                title={donation.foodName}
                onClick={() => handleMarkerClick(donation)}
              />
            ))}
          </GoogleMap>
        </LoadScript>

        {/* Donation Count Badge */}
        <div style={styles.donationBadge}>
          🍽️ {donations.length} donations nearby
        </div>
      </div>

      {/* Location Change Modal */}
      {showLocationModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLocationModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Change Location</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowLocationModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.searchContainer}>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search for a location..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
              <button style={styles.searchBtn} onClick={searchLocation}>
                🔍
              </button>
            </div>

            <div style={{ marginTop: '16px', padding: '0 20px' }}>
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '8px' }}
                  center={tempLocation || userLocation}
                  zoom={15}
                  onClick={handleMapClick}
                >
                  {tempLocation && (
                    <Marker
                      position={tempLocation}
                      draggable={true}
                      onDragEnd={(e) => setTempLocation({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                      })}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={styles.btnSecondary}
                onClick={() => setShowLocationModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.btnPrimary}
                onClick={updateLocation}
              >
                Update Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Food Details</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Donor Info */}
            <div style={styles.donorInfo}>
              <div style={styles.donorAvatar}>
                {selectedDonation.donor?.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={styles.donorDetails}>
                <div style={styles.donorName}>{selectedDonation.donor?.name}</div>
                <div style={styles.donorAddress}>{selectedDonation.address}</div>
              </div>
            </div>

            {/* Food Image */}
            {selectedDonation.images && selectedDonation.images.length > 0 && (
              <img 
                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedDonation.images[0]}`}
                alt="Food"
                style={styles.foodImage}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}

            {/* Food Description */}
            <div style={styles.foodDetails}>
              <div style={styles.foodType}>
                {selectedDonation.foodType === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'}
              </div>
              <h3 style={styles.foodName}>{selectedDonation.foodName}</h3>
              <p style={styles.foodDescription}>{selectedDonation.description}</p>
              
              <div style={styles.foodMeta}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Quantity:</span>
                  <span style={styles.metaValue}>{selectedDonation.quantity} servings</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Distance:</span>
                  <span style={styles.metaValue}>{selectedDonation.distance} km away</span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div style={styles.messageSection}>
              <label style={styles.label}>Send a note to donor (optional)</label>
              <textarea
                style={styles.textarea}
                placeholder="Let the donor know about your requirements..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>

            <button 
              style={styles.btnPrimaryFull}
              onClick={sendWillingness}
            >
              Send Willingness
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Keep all the styles exactly the same...
const styles = {
  container: {
    minHeight: '100vh',
    background: '#F9F9F9',
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  locationIcon: {
    fontSize: '24px',
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: '4px',
  },
  locationAddress: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  changeLocationBtn: {
    padding: '8px 16px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  mapContainer: {
    position: 'relative',
  },
  donationBadge: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: COLORS.textLight,
  },
  searchContainer: {
    display: 'flex',
    gap: '8px',
    padding: '0 20px',
    marginTop: '16px',
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
  modalActions: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px',
    background: 'white',
    color: COLORS.text,
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimary: {
    flex: 1,
    padding: '12px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimaryFull: {
    width: 'calc(100% - 40px)',
    padding: '14px',
    background: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    cursor: 'pointer',
    margin: '20px',
  },
  donorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
  },
  donorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    background: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '4px',
  },
  donorAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  foodImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  foodDetails: {
    padding: '20px',
  },
  foodType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: '8px',
  },
  foodName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  foodDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  foodMeta: {
    display: 'flex',
    gap: '16px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  metaValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  messageSection: {
    padding: '0 20px',
  },
  label: {
    display: 'block',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: FONT_SIZES.sm,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default FindFoodNearby;
