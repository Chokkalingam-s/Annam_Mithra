import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { auth } from "../config/firebase";
import api from "../services/api";
import { COLORS, FONT_SIZES } from "../config/theme";
import BottomNav from "../components/receiver/BottomNav";

const FindFoodNearby = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Getting location...");
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [tempLocation, setTempLocation] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

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
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setTempLocation(location);
          reverseGeocode(location.lat, location.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          const defaultLocation = { lat: 17.385044, lng: 78.486671 };
          setUserLocation(defaultLocation);
          setTempLocation(defaultLocation);
          setCurrentAddress("Hyderabad, India");
          setLoading(false);
        },
      );
    }
  };

  const reverseGeocode = async (lat, lng, skipLoadingUpdate = false) => {
    try {
      if (!skipLoadingUpdate) {
        setIsUpdatingAddress(true);
      }
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.results[0]) {
        setCurrentAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      if (!skipLoadingUpdate) {
        setIsUpdatingAddress(false);
      }
      setLoading(false);
    }
  };

  const fetchNearbyDonations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.get("/donations/nearby", {
        params: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 2,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    setIsUpdatingAddress(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      if (data.results[0]) {
        const location = data.results[0].geometry.location;
        const newLocation = { lat: location.lat, lng: location.lng };
        setTempLocation(newLocation);
        if (map) {
          map.panTo(location);
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleMapClick = useCallback((e) => {
    setTempLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  const updateLocation = async () => {
    if (tempLocation) {
      setIsUpdatingAddress(true);
      setUserLocation(tempLocation);
      await reverseGeocode(tempLocation.lat, tempLocation.lng);
      setIsUpdatingAddress(false);
      setShowLocationModal(false);
    }
  };

  const handleMarkerClick = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
    setRequestMessage("");
  };

  const sendWillingness = async () => {
    if (!selectedDonation) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await api.post(
        "/donations/interest",
        {
          donationId: selectedDonation.id,
          message: requestMessage,
          firebaseUid: auth.currentUser?.uid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        alert("Request sent successfully!");
        setShowDetailModal(false);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
  };

  const userLocationIcon = {
    path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
    fillColor: COLORS.primary,
    fillOpacity: 0.9,
    strokeColor: "#fff",
    strokeWeight: 2,
    scale: 1.5,
  };

  const vegIcon = {
    path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
    fillColor: "#34C759",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 2,
    scale: 1,
  };

  const nonVegIcon = {
    path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
    fillColor: "#FF6B6B",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 2,
    scale: 1,
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Getting your location...</p>
          <p style={styles.loadingSubtext}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Find Food Nearby</h1>
        <div
          style={styles.locationBar}
          onClick={() => setShowLocationModal(true)}
        >
          <svg
            style={styles.locationIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style={styles.locationText}>{currentAddress}</span>
          <svg
            style={styles.chevronIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
            onClick={handleMapClick}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={userLocationIcon}
                title="Your Location"
              />
            )}

            {donations.map((donation) => (
              <Marker
                key={donation.id}
                position={{
                  lat: donation.latitude,
                  lng: donation.longitude,
                }}
                icon={donation.foodType === "veg" ? vegIcon : nonVegIcon}
                onClick={() => handleMarkerClick(donation)}
                title={donation.foodName}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Donations List */}
      <div style={styles.listContainer}>
        <h2 style={styles.listTitle}>
          Available Donations ({donations.length})
        </h2>
        {donations.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No donations found nearby</p>
            <p style={styles.emptySubtext}>Try adjusting your location</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div
              key={donation.id}
              style={styles.donationCard}
              onClick={() => handleMarkerClick(donation)}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.foodName}>{donation.foodName}</h3>
                <span
                  style={{
                    ...styles.foodType,
                    ...(donation.foodType === "veg"
                      ? styles.vegBadge
                      : styles.nonVegBadge),
                  }}
                >
                  {donation.foodType === "veg" ? "🌱 Veg" : "🍖 Non-Veg"}
                </span>
              </div>
              <p style={styles.description}>{donation.description}</p>
              <div style={styles.cardFooter}>
                <span style={styles.quantity}>Qty: {donation.quantity}</span>
                <span style={styles.distance}>
                  📍{" "}
                  {donation.distance
                    ? `${donation.distance.toFixed(1)} km`
                    : "Nearby"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowLocationModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Select Location</h2>

            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                style={styles.searchInput}
                onKeyPress={(e) => e.key === "Enter" && searchLocation()}
              />
              <button onClick={searchLocation} style={styles.searchButton}>
                Search
              </button>
            </div>

            <div style={styles.smallMapContainer}>
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              >
                <GoogleMap
                  mapContainerStyle={{
                    width: "100%",
                    height: "250px",
                    borderRadius: "8px",
                  }}
                  center={tempLocation || userLocation}
                  zoom={14}
                  onClick={handleMapClick}
                  onLoad={(mapInstance) => setMap(mapInstance)}
                >
                  {tempLocation && (
                    <Marker position={tempLocation} icon={userLocationIcon} />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowLocationModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={updateLocation}
                style={styles.confirmButton}
                disabled={isUpdatingAddress}
              >
                {isUpdatingAddress ? "Updating..." : "Confirm Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowDetailModal(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{selectedDonation.foodName}</h2>

            <div style={styles.detailSection}>
              <p>
                <strong>Type:</strong>{" "}
                {selectedDonation.foodType === "veg"
                  ? "🌱 Vegetarian"
                  : "🍖 Non-Vegetarian"}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedDonation.quantity}
              </p>
              <p>
                <strong>Description:</strong> {selectedDonation.description}
              </p>
              <p>
                <strong>Distance:</strong>{" "}
                {selectedDonation.distance
                  ? `${selectedDonation.distance.toFixed(1)} km`
                  : "Nearby"}
              </p>
            </div>

            <textarea
              placeholder="Add a message (optional)..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              style={styles.messageInput}
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={styles.cancelButton}
              >
                Close
              </button>
              <button onClick={sendWillingness} style={styles.confirmButton}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentPage="receive" />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    paddingBottom: "80px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  loadingContent: {
    textAlign: "center",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    marginBottom: "8px",
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  header: {
    backgroundColor: "#fff",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: "12px",
  },
  locationBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    cursor: "pointer",
  },
  locationIcon: {
    width: "20px",
    height: "20px",
    color: COLORS.primary,
  },
  locationText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  chevronIcon: {
    width: "16px",
    height: "16px",
    color: COLORS.text.secondary,
  },
  mapContainer: {
    padding: "20px",
  },
  listContainer: {
    padding: "20px",
  },
  listTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  donationCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  foodName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  foodType: {
    fontSize: FONT_SIZES.xs,
    padding: "4px 8px",
    borderRadius: "12px",
    fontWeight: "500",
  },
  vegBadge: {
    backgroundColor: "#E8F5E9",
    color: "#34C759",
  },
  nonVegBadge: {
    backgroundColor: "#FFEBEE",
    color: "#FF6B6B",
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: "12px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  quantity: {},
  distance: {},
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: "20px",
  },
  searchBox: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  searchInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: FONT_SIZES.sm,
  },
  searchButton: {
    padding: "10px 20px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  smallMapContainer: {
    marginBottom: "20px",
  },
  detailSection: {
    marginBottom: "20px",
    fontSize: FONT_SIZES.sm,
    lineHeight: "1.6",
  },
  messageInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: FONT_SIZES.sm,
    minHeight: "80px",
    marginBottom: "20px",
    fontFamily: "inherit",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f5f5f5",
    color: COLORS.text.primary,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  confirmButton: {
    padding: "10px 20px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
};

export default FindFoodNearby;
