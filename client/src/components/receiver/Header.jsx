import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../common/ProfileDropdown";

const Header = () => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  return (
    <div style={styles.topBar}>
      <div style={styles.locationContainer}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg style={styles.logo} viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>

        {/* Location */}
        <div style={styles.locationText}>
          <div style={styles.locationTitle}>Annam Mithra</div>
          <div style={styles.locationSubtitle}>
            {profile.location || "Set your location"}
          </div>
        </div>
        <svg style={styles.chevronIcon} viewBox="0 0 24 24" fill="white">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>

      <div style={styles.topRightIcons}>
        <div style={styles.profileContainer} ref={dropdownRef}>
          <div style={styles.profileButton} onClick={toggleDropdown}>
            <div style={styles.profileAvatar}>{getInitials(profile.name)}</div>
          </div>

          {showDropdown && (
            <ProfileDropdown
              profile={profile}
              getInitials={getInitials}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  topBar: {
    background: "#C1693C",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  logoContainer: {
    width: "32px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "22px",
    height: "22px",
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: "-0.02em",
  },
  locationSubtitle: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: "1px",
  },
  chevronIcon: {
    width: "20px",
    height: "20px",
  },
  topRightIcons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    cursor: "pointer",
  },
  profileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
};

export default Header;
