import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import api from '../services/api';

const FindFoodNearby = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('Getting your location...');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getUserLocationAndFetchDonations();
  }, []);

  const getUserLocationAndFetchDonations = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          await getAddressFromCoords(userLoc.lat, userLoc.lng);
          await fetchNearbyDonations(userLoc.lat, userLoc.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLoc = { lat: 17.385044, lng: 78.486671 };
          setUserLocation(defaultLoc);
          setLocationAddress('Hyderabad, India');
          fetchNearbyDonations(defaultLoc.lat, defaultLoc.lng);
        }
      );
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        const address = data.results[0].formatted_address;
        const shortAddress = address.split(',').slice(0, 2).join(',');
        setLocationAddress(shortAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const fetchNearbyDonations = async (lat, lng) => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      const response = await api.get('/donations/nearby', {
        params: {
          latitude: lat,
          longitude: lng,
          radius: 2000
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      alert('Error loading nearby donations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (donation) => {
    setSelectedDonation(donation);
  };

  const handleSendWillingness = async () => {
    if (!selectedDonation) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await api.post(
        `/donations/${selectedDonation.id}/request`,
        {
          firebaseUid: auth.currentUser?.uid
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('🎉 Willingness sent successfully! The donor will contact you soon.');
        setSelectedDonation(null);
        await fetchNearbyDonations(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Error sending willingness:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChangeLocation = () => {
    getUserLocationAndFetchDonations();
  };

  // Simple marker icon URLs (no google dependency)
  const getMarkerIcon = (foodType) => {
    if (!isMapLoaded) return undefined;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${foodType === 'veg' ? '#7C9D3D' : '#EF4444'}" stroke="white" stroke-width="3"/>
        </svg>
      `)}`,
      scaledSize: { width: 32, height: 32 }
    };
  };

  const getUserMarkerIcon = () => {
    if (!isMapLoaded) return undefined;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="10" fill="#3B82F6" stroke="white" stroke-width="4"/>
        </svg>
      `)}`,
      scaledSize: { width: 32, height: 32 }
    };
  };

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 140px)',
  };

  const mapCenter = userLocation || { lat: 17.385044, lng: 78.486671 };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={() => navigate('/home')}>
            <span style={styles.backIcon}>←</span>
          </button>
          
          <div style={styles.locationInfo}>
            <div style={styles.locationLabel}>Current Location</div>
            <div style={styles.locationText}>{locationAddress}</div>
          </div>

          <button style={styles.changeLocationBtn} onClick={handleChangeLocation}>
            <span style={styles.refreshIcon}>📍</span>
            {!isMobile && <span>Refresh</span>}
          </button>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>🍲</span>
            <span style={styles.statText}>{donations.length} donations nearby</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>📏</span>
            <span style={styles.statText}>Within 2km</span>
          </div>
        </div>
      </header>

      {/* Map */}
      <div style={styles.mapWrapper}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Finding food near you...</p>
          </div>
        ) : (
          <LoadScript 
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            onLoad={() => setIsMapLoaded(true)}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: true,
              }}
            >
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={getUserMarkerIcon()}
                  title="You are here"
                />
              )}

              {/* Donation Markers */}
              {donations.map((donation) => (
                <Marker
                  key={donation.id}
                  position={{ 
                    lat: parseFloat(donation.latitude), 
                    lng: parseFloat(donation.longitude) 
                  }}
                  icon={getMarkerIcon(donation.foodType)}
                  onClick={() => handleMarkerClick(donation)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        )}

        {/* Mini Card Popup */}
        {selectedDonation && (
          <MiniDonationCard
            donation={selectedDonation}
            onClose={() => setSelectedDonation(null)}
            onSendWillingness={handleSendWillingness}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

// Mini Card Component
const MiniDonationCard = ({ donation, onClose, onSendWillingness, isMobile }) => {
  const imageUrl = donation.images && donation.images.length > 0
    ? `${import.meta.env.VITE_API_URL || '<http://localhost:5000'}${donation.images>[0]}`
    : null;

  return (
    <div style={{...styles.miniCard, ...(isMobile && styles.miniCardMobile)}}>
      <button style={styles.closeBtn} onClick={onClose}>✕</button>

      {imageUrl ? (
        <div style={styles.miniImageContainer}>
          <img 
            src={imageUrl} 
            alt={donation.foodName} 
            style={styles.miniImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.display = 'none';
            }}
          />
          <div style={{
            ...styles.typeBadge,
            background: donation.foodType === 'veg' ? '#7C9D3D' : '#EF4444'
          }}>
            {donation.foodType === 'veg' ? '🥗' : '🍗'}
          </div>
        </div>
      ) : (
        <div style={styles.miniImagePlaceholder}>
          <div style={{
            ...styles.placeholderIcon,
            background: donation.foodType === 'veg' ? '#7C9D3D' : '#EF4444'
          }}>
            {donation.foodType === 'veg' ? '🥗' : '🍗'}
          </div>
        </div>
      )}

      <div style={styles.miniContent}>
        <h3 style={styles.miniTitle}>{donation.foodName}</h3>
        <p style={styles.miniQuantity}>
          Qty: {donation.quantity} servings • {donation.distance} km away
        </p>
        
        <div style={styles.miniDonor}>
          <div style={styles.miniAvatar}>
            {donation.donor?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={styles.miniDonorInfo}>
            <div style={styles.miniDonorName}>{donation.donor?.name || 'Anonymous'}</div>
            <div style={styles.miniDonorPhone}>📞 {donation.phone || donation.donor?.phone}</div>
          </div>
        </div>

        <button style={styles.miniButton} onClick={onSendWillingness}>
          <span>✋</span>
          <span>Send Willingness</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    background: '#FAFBFC',
    position: 'relative',
    overflow: 'hidden',
  },
  
  header: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
  },
  backButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#F3F4F6',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  backIcon: {
    fontSize: '20px',
    color: '#1F2937',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: '11px',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  locationText: {
    fontSize: '14px',
    color: '#1F2937',
    fontWeight: '600',
    marginTop: '2px',
  },
  changeLocationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  refreshIcon: {
    fontSize: '16px',
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    padding: '12px 16px',
    borderTop: '1px solid #F3F4F6',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statIcon: {
    fontSize: '16px',
  },
  statText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B7280',
  },
  
  mapWrapper: {
    position: 'relative',
    height: 'calc(100vh - 140px)',
  },
  
  loadingContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAFBFC',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #7C9D3D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  
  // Mini Card
  miniCard: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '360px',
    maxHeight: '500px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: 50,
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease',
  },
  miniCardMobile: {
    width: 'calc(100% - 32px)',
    maxWidth: '360px',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s ease',
  },
  
  miniImageContainer: {
    width: '100%',
    height: '180px',
    position: 'relative',
    overflow: 'hidden',
  },
  miniImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  miniImagePlaceholder: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
  },
  typeBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  
  miniContent: {
    padding: '16px',
  },
  miniTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '6px',
    letterSpacing: '-0.01em',
  },
  miniQuantity: {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '14px',
  },
  
  miniDonor: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '10px',
    marginBottom: '14px',
  },
  miniAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C9D3D 0%, #6B8A35 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  miniDonorInfo: {
    flex: 1,
    minWidth: 0,
  },
  miniDonorName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '4px',
  },
  miniDonorPhone: {
    fontSize: '12px',
    color: '#6B7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  
  miniButton: {
    width: '100%',
    padding: '12px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(124, 157, 61, 0.3)',
  },
};

// Add CSS animations
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
    
    styleSheet.insertRule(`
      @keyframes slideUp {
        from { 
          transform: translate(-50%, 100%);
          opacity: 0;
        }
        to { 
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {}
}

export default FindFoodNearby;
