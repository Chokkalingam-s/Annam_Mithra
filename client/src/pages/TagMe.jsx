import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';
import Header from "../components/receiver/Header";
import BottomNav from "../components/receiver/BottomNav";

const TagMe = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  // Use the faster useJsApiLoader hook
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchTags();
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
        },
        () => {
          const defaultLocation = { lat: 17.385044, lng: 78.486671 };
          setUserLocation(defaultLocation);
          setLoading(false);
        }
      );
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags', {
        params: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 10
        }
      });

      if (response.data.success) {
        setTags(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (tag) => {
    setSelectedTag(tag);
    setShowInfoWindow(true);
  };

  const handleVerifyTag = async (tagId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post('/tags/verify', {
        tagId,
        verified: true,
        firebaseUid: auth.currentUser?.uid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Tag verified successfully!');
        fetchTags();
        setShowInfoWindow(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error verifying tag');
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  const tagIcon = {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: '#8751d3ee',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1.2,
  };

  const userIcon = {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1,
  };

  if (loading || !userLocation || !isLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <Header />
      <div style={styles.header}>
        <h1 style={styles.title}>Tag Me</h1>
        <div style={styles.placeholder}></div>
      </div>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={styles.infoIcon}>🏷️</div>
        <div style={styles.infoText}>
          <div style={styles.infoTitle}>Help Others Find People in Need</div>
          <div style={styles.infoDesc}>Tag locations where food assistance is needed</div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{tags.length}</div>
          <div style={styles.statLabel}>Total Tags</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{tags.filter(t => t.status === 'verified').length}</div>
          <div style={styles.statLabel}>Verified</div>
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapSection}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={13}
          onLoad={setMap}
        >
          {/* User Location */}
          <Marker position={userLocation} icon={userIcon} title="Your Location" />

          {/* Tagged Locations */}
          {tags.map((tag) => (
            <Marker
              key={tag.id}
              position={{
                lat: parseFloat(tag.latitude),
                lng: parseFloat(tag.longitude)
              }}
              icon={tagIcon}
              title={tag.address}
              onClick={() => handleMarkerClick(tag)}
            />
          ))}

          {/* Info Window */}
          {showInfoWindow && selectedTag && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedTag.latitude),
                lng: parseFloat(selectedTag.longitude)
              }}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div style={styles.infoWindowContent}>
                <div style={styles.infoWindowTitle}>{selectedTag.address}</div>
                <div style={styles.infoWindowDesc}>{selectedTag.description}</div>
                <div style={styles.infoWindowMeta}>
                  👥 ~{selectedTag.estimatedPeople} people
                </div>
                <div style={styles.infoWindowMeta}>
                  ✓ {selectedTag.verificationCount} verifications
                </div>
                <button
                  style={styles.verifyBtn}
                  onClick={() => handleVerifyTag(selectedTag.id)}
                >
                  Verify Location
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Create Tag Button */}
      <button style={styles.createBtn} onClick={() => navigate('/tag-me/create')}>
        + Create New Tag
      </button>

      {/* Tag List */}
      <div style={styles.tagList}>
        <h2 style={styles.listTitle}>Recent Tags</h2>
        {tags.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📍</div>
            <p style={styles.emptyText}>No tags found nearby</p>
          </div>
        ) : (
          tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} onClick={() => handleMarkerClick(tag)} />
          ))
        )}
      </div>
    </div>
  );
};

const TagCard = ({ tag, onClick }) => (
  <div style={styles.tagCard} onClick={onClick}>
    <div style={styles.tagCardIcon}>📍</div>
    <div style={styles.tagCardContent}>
      <div style={styles.tagCardTitle}>{tag.address}</div>
      <div style={styles.tagCardDesc}>{tag.description}</div>
      <div style={styles.tagCardMeta}>
        <span>👥 {tag.estimatedPeople} people</span>
        <span>•</span>
        <span>✓ {tag.verificationCount} verified</span>
        {tag.distance && (
          <>
            <span>•</span>
            <span>📍 {tag.distance} km away</span>
          </>
        )}
      </div>
    </div>
    {tag.status === 'verified' && (
      <div style={styles.verifiedBadge}>✓</div>
    )}
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F9F9F9',
    paddingBottom: '90px',
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
    borderTop: '4px solid #8751d3ee',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'white',
    borderBottom: '1px solid #E0E0E0',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#8751d3ee',
    fontWeight: '600',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C2C2C',
    margin: 0,
  },
  placeholder: {
    width: '40px',
  },
  infoBanner: {
    background: 'linear-gradient(135deg, #5d19fcff 0%, #ff4747ff 100%)',
    padding: '20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: '40px',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
  },
  infoDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.9)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '16px',
  },
  statBox: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8751d3ee',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7D7D7D',
  },
  mapSection: {
    padding: '16px',
  },
  createBtn: {
    margin: '16px',
    padding: '14px',
    background: '#8751d3ee',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'calc(100% - 32px)',
  },
  tagList: {
    padding: '0 16px 16px',
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: '16px',
  },
  emptyState: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#7D7D7D',
  },
  tagCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
  },
  tagCardIcon: {
    fontSize: '24px',
  },
  tagCardContent: {
    flex: 1,
  },
  tagCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: '4px',
  },
  tagCardDesc: {
    fontSize: '13px',
    color: '#7D7D7D',
    marginBottom: '8px',
  },
  tagCardMeta: {
    fontSize: '11px',
    color: '#9CA3AF',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#34C759',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  },
  infoWindowContent: {
    padding: '8px',
  },
  infoWindowTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#2C2C2C',
  },
  infoWindowDesc: {
    fontSize: '12px',
    color: '#7D7D7D',
    marginBottom: '8px',
  },
  infoWindowMeta: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginBottom: '4px',
  },
  verifyBtn: {
    marginTop: '8px',
    padding: '8px 12px',
    background: '#8751d3ee',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default TagMe;