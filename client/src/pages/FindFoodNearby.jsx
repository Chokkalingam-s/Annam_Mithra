import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { auth } from '../config/firebase';
import api from '../services/api';

const FindFoodNearby = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, veg, nonveg
  const [viewMode, setViewMode] = useState('map'); // map, list

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
          await fetchNearbyDonations(userLoc.lat, userLoc.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a location (e.g., Hyderabad)
          const defaultLoc = { lat: 17.385044, lng: 78.486671 };
          setUserLocation(defaultLoc);
          fetchNearbyDonations(defaultLoc.lat, defaultLoc.lng);
        }
      );
    } else {
      const defaultLoc = { lat: 17.385044, lng: 78.486671 };
      setUserLocation(defaultLoc);
      fetchNearbyDonations(defaultLoc.lat, defaultLoc.lng);
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
          radius: 2000 // 2km in meters
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const getMarkerIcon = (foodType) => {
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      scale: 10,
      fillColor: foodType === 'veg' ? '#7C9D3D' : '#E74C3C',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    };
  };

  const filteredDonations = donations.filter(donation => {
    if (filterType === 'all') return true;
    return donation.foodType === filterType;
  });

  const handleRequestFood = async (donationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await api.post(`/donations/${donationId}/request`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Food request sent successfully!');
        setSelectedDonation(null);
      }
    } catch (error) {
      console.error('Error requesting food:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: isMobile ? '400px' : '500px',
    borderRadius: '10px',
  };

  const mapCenter = userLocation || { lat: 17.385044, lng: 78.486671 };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={() => navigate('/home')}>
              <span style={styles.backIcon}>←</span>
              <span style={styles.backText}>Back</span>
            </button>
          </div>
          <h1 style={{...styles.pageTitle, ...(isMobile && styles.pageTitleMobile)}}>
            Find Food Nearby
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📍</span>
              <span style={styles.statText}>{filteredDonations.length} donations nearby</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📏</span>
              <span style={styles.statText}>Within 2km radius</span>
            </div>
          </div>

          {/* Filter & View Toggle */}
          <div style={{...styles.controlsBar, ...(isMobile && styles.controlsBarMobile)}}>
            {/* Filter Buttons */}
            <div style={styles.filterGroup}>
              <FilterButton
                label="All"
                icon="🍽️"
                active={filterType === 'all'}
                onClick={() => setFilterType('all')}
                count={donations.length}
              />
              <FilterButton
                label="Veg"
                icon="🥗"
                active={filterType === 'veg'}
                onClick={() => setFilterType('veg')}
                count={donations.filter(d => d.foodType === 'veg').length}
              />
              <FilterButton
                label="Non-Veg"
                icon="🍗"
                active={filterType === 'nonveg'}
                onClick={() => setFilterType('nonveg')}
                count={donations.filter(d => d.foodType === 'nonveg').length}
              />
            </div>

            {/* View Toggle */}
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewToggleBtn,
                  ...(viewMode === 'map' && styles.viewToggleBtnActive)
                }}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map
              </button>
              <button
                style={{
                  ...styles.viewToggleBtn,
                  ...(viewMode === 'list' && styles.viewToggleBtnActive)
                }}
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Finding food donations near you...</p>
            </div>
          ) : (
            <>
              {/* Map View */}
              {viewMode === 'map' && (
                <div style={styles.mapContainer}>
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={14}
                      onLoad={setMap}
                      options={{
                        streetViewControl: true,
                        mapTypeControl: true,
                      }}
                    >
                      {/* User Location Marker */}
                      {userLocation && (
                        <Marker
                          position={userLocation}
                          icon={{
                            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                            scale: 8,
                            fillColor: '#3B82F6',
                            fillOpacity: 1,
                            strokeColor: '#FFFFFF',
                            strokeWeight: 3,
                          }}
                          title="Your Location"
                        />
                      )}

                      {/* 2km Radius Circle */}
                      {userLocation && (
                        <Circle
                          center={userLocation}
                          radius={2000}
                          options={{
                            fillColor: '#7C9D3D',
                            fillOpacity: 0.1,
                            strokeColor: '#7C9D3D',
                            strokeOpacity: 0.4,
                            strokeWeight: 2,
                          }}
                        />
                      )}

                      {/* Donation Markers */}
                      {filteredDonations.map((donation) => (
                        <Marker
                          key={donation._id}
                          position={{ lat: donation.latitude, lng: donation.longitude }}
                          icon={getMarkerIcon(donation.foodType)}
                          onClick={() => setSelectedDonation(donation)}
                        />
                      ))}

                      {/* Info Window */}
                      {selectedDonation && (
                        <InfoWindow
                          position={{
                            lat: selectedDonation.latitude,
                            lng: selectedDonation.longitude
                          }}
                          onCloseClick={() => setSelectedDonation(null)}
                        >
                          <DonationInfoCard
                            donation={selectedDonation}
                            userLocation={userLocation}
                            onRequest={handleRequestFood}
                          />
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </LoadScript>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div style={styles.listContainer}>
                  {filteredDonations.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔍</div>
                      <p style={styles.emptyText}>No donations found nearby</p>
                      <p style={styles.emptySubtext}>
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  ) : (
                    filteredDonations.map((donation) => (
                      <DonationListCard
                        key={donation._id}
                        donation={donation}
                        userLocation={userLocation}
                        onRequest={handleRequestFood}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Filter Button Component
const FilterButton = ({ label, icon, active, onClick, count }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      style={{
        ...styles.filterButton,
        ...(active && styles.filterButtonActive),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.filterIcon}>{icon}</span>
      <span style={styles.filterLabel}>{label}</span>
      <span style={styles.filterCount}>{count}</span>
    </button>
  );
};

// Donation Info Card (for InfoWindow)
const DonationInfoCard = ({ donation, userLocation, onRequest }) => {
  const distance = userLocation ? 
    calculateDistance(userLocation.lat, userLocation.lng, donation.latitude, donation.longitude) : 
    '-';

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div style={styles.infoCard}>
      <div style={styles.infoHeader}>
        <span style={styles.infoType}>
          {donation.foodType === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
        </span>
        <span style={styles.infoDistance}>📍 {distance} km</span>
      </div>
      <div style={styles.infoBody}>
        <h4 style={styles.infoTitle}>Food Items:</h4>
        {donation.foodItems?.map((item, idx) => (
          <p key={idx} style={styles.infoItem}>
            • {item.dishName} ({item.quantity})
          </p>
        ))}
        <p style={styles.infoAddress}>📍 {donation.address?.substring(0, 50)}...</p>
      </div>
      <button
        style={styles.infoButton}
        onClick={() => onRequest(donation._id)}
      >
        Request Food
      </button>
    </div>
  );
};

// Donation List Card Component
const DonationListCard = ({ donation, userLocation, onRequest }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const distance = userLocation ? 
    calculateDistance(userLocation.lat, userLocation.lng, donation.latitude, donation.longitude) : 
    '-';

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div
      style={{
        ...styles.listCard,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.listCardHeader}>
        <div style={styles.listCardBadge}>
          {donation.foodType === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'}
        </div>
        <div style={styles.listCardDistance}>📍 {distance} km away</div>
      </div>

      <div style={styles.listCardBody}>
        <h3 style={styles.listCardTitle}>Available Food:</h3>
        <div style={styles.foodItemsList}>
          {donation.foodItems?.map((item, idx) => (
            <div key={idx} style={styles.foodItemRow}>
              <span style={styles.foodItemName}>• {item.dishName}</span>
              <span style={styles.foodItemQty}>{item.quantity}</span>
            </div>
          ))}
        </div>

        <div style={styles.listCardInfo}>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>📍</span>
            <span style={styles.infoText}>{donation.address}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>📞</span>
            <span style={styles.infoText}>{donation.phone}</span>
          </div>
        </div>
      </div>

      <button
        style={styles.listCardButton}
        onClick={() => onRequest(donation._id)}
      >
        Request This Food
      </button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAFBFC',
  },
  
  // Header
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
    padding: '20px 16px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  // Stats Bar
  statsBar: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #E5E7EB',
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1F2937',
  },
  
  // Controls Bar
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
  },
  controlsBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  
  // Filter Group
  filterGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1F2937',
  },
  filterButtonActive: {
    borderColor: '#7C9D3D',
    background: 'rgba(124, 157, 61, 0.08)',
    color: '#7C9D3D',
  },
  filterIcon: {
    fontSize: '18px',
  },
  filterLabel: {
    fontWeight: '600',
  },
  filterCount: {
    padding: '2px 8px',
    background: '#F3F4F6',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  // View Toggle
  viewToggle: {
    display: 'flex',
    background: '#F3F4F6',
    borderRadius: '8px',
    padding: '4px',
  },
  viewToggleBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    transition: 'all 0.2s ease',
  },
  viewToggleBtnActive: {
    background: '#FFFFFF',
    color: '#7C9D3D',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  // Loading
  loadingContainer: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '60px 20px',
    textAlign: 'center',
    border: '1px solid #E5E7EB',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #7C9D3D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  
  // Map Container
  mapContainer: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  
  // Info Window Card
  infoCard: {
    padding: '12px',
    minWidth: '250px',
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  infoType: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#7C9D3D',
  },
  infoDistance: {
    fontSize: '12px',
    color: '#6B7280',
  },
  infoBody: {
    marginBottom: '12px',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '6px',
  },
  infoItem: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '4px',
  },
  infoAddress: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '8px',
  },
  infoButton: {
    width: '100%',
    padding: '8px 16px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  // List Container
  listContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '16px',
  },
  
  // List Card
  listCard: {
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  listCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  listCardBadge: {
    padding: '6px 12px',
    background: 'rgba(124, 157, 61, 0.1)',
    color: '#7C9D3D',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  listCardDistance: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  },
  listCardBody: {
    marginBottom: '16px',
  },
  listCardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '10px',
  },
  foodItemsList: {
    marginBottom: '16px',
  },
  foodItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '14px',
  },
  foodItemName: {
    color: '#374151',
  },
  foodItemQty: {
    fontWeight: '600',
    color: '#1F2937',
  },
  listCardInfo: {
    paddingTop: '12px',
    borderTop: '1px solid #E5E7EB',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#6B7280',
  },
  infoIcon: {
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
  },
  listCardButton: {
    width: '100%',
    padding: '12px',
    background: '#7C9D3D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Empty State
  emptyState: {
    gridColumn: '1 / -1',
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '60px 20px',
    textAlign: 'center',
    border: '1px solid #E5E7EB',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.4,
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6B7280',
  },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore if already exists
  }
}

export default FindFoodNearby;