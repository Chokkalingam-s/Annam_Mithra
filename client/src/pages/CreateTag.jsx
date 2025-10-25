import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import api from '../services/api';
import Header from "../components/receiver/Header";
import BottomNav from "../components/receiver/BottomNav";

const CreateTag = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPeople, setEstimatedPeople] = useState('');
  const [tagType, setTagType] = useState('other');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the faster useJsApiLoader hook
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Fixed: useEffect instead of useState
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          reverseGeocode(loc.lat, loc.lng);
        },
        () => {
          const defaultLoc = { lat: 17.385044, lng: 78.486671 };
          setLocation(defaultLoc);
          setAddress('Hyderabad, India');
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
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        const loc = data.results[0].geometry.location;
        setLocation({ lat: loc.lat, lng: loc.lng });
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleMapClick = useCallback((e) => {
    const newLoc = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setLocation(newLoc);
    reverseGeocode(newLoc.lat, newLoc.lng);
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location || !address || !description) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('address', address);
      formData.append('description', description);
      formData.append('estimatedPeople', estimatedPeople || '0');
      formData.append('tagType', tagType);
      formData.append('firebaseUid', auth.currentUser?.uid);
      
      if (image) {
        formData.append('tagImage', image);
      }

      const token = await auth.currentUser?.getIdToken();
      const response = await api.post('/tags', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Tag created successfully!');
        navigate('/tag-me');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
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

  if (!isLoaded || !location) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <Header />
      <div style={styles.header}>
        <h1 style={styles.title}>Create Tag</h1>
        <div style={styles.placeholder}></div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Search Location */}
        <div style={styles.searchSection}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
          />
          <button type="button" style={styles.searchBtn} onClick={searchLocation}>
            🔍
          </button>
        </div>

        {/* Map */}
        <div style={styles.mapSection}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={location}
            zoom={15}
            onClick={handleMapClick}
          >
            <Marker
              position={location}
              draggable={true}
              onDragEnd={(e) => {
                const newLoc = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                };
                setLocation(newLoc);
                reverseGeocode(newLoc.lat, newLoc.lng);
              }}
            />
          </GoogleMap>
        </div>

        {/* Address */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Location Address *</label>
          <input
            type="text"
            style={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter or select location on map"
            required
          />
        </div>

        {/* Description */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the situation and needs..."
            rows={4}
            required
          />
        </div>

        {/* Estimated People */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Estimated People</label>
          <input
            type="number"
            style={styles.input}
            value={estimatedPeople}
            onChange={(e) => setEstimatedPeople(e.target.value)}
            placeholder="Approximate number of people"
            min="0"
          />
        </div>

        {/* Tag Type */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Location Type</label>
          <select
            style={styles.select}
            value={tagType}
            onChange={(e) => setTagType(e.target.value)}
          >
            <option value="other">Other</option>
            <option value="homeless_shelter">Homeless Shelter</option>
            <option value="street_location">Street Location</option>
            <option value="community_center">Community Center</option>
          </select>
        </div>

        {/* Image Upload */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.fileInput}
          />
          {image && (
            <div style={styles.imagePreview}>
              <img src={URL.createObjectURL(image)} alt="Preview" style={styles.previewImg} />
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating Tag...' : 'Create Tag'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F9F9F9',
    paddingBottom: '20px',
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
  form: {
    padding: '16px',
  },
  searchSection: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    outline: 'none',
  },
  searchBtn: {
    padding: '12px 20px',
    background: '#8751d3ee',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
  },
  mapSection: {
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  imagePreview: {
    marginTop: '12px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#8751d3ee',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
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

export default CreateTag;