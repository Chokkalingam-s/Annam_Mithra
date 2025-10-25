import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import Button from "../components/Button";
import { COLORS, SPACING, FONT_SIZES } from "../config/theme";
import TestNotificationButton from "../components/TestNotificationButton";

const ReceiverHome = () => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="page" style={styles.container}>
      <TestNotificationButton />
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.greeting}>Hello, {profile.name}! 👋</h1>
            <p style={styles.subGreeting}>Welcome to Annam Mithra</p>
          </div>

          {/* Profile Dropdown */}
          <div style={styles.profileContainer} ref={dropdownRef}>
            <div style={styles.profileAvatar} onClick={toggleDropdown}>
              <span style={styles.profileInitials}>
                {getInitials(profile.name)}
              </span>
            </div>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownAvatar}>
                    {getInitials(profile.name)}
                  </div>
                  <div style={styles.dropdownUserInfo}>
                    <div style={styles.dropdownName}>{profile.name}</div>
                    <div style={styles.dropdownEmail}>{profile.email}</div>
                  </div>
                </div>

                <div style={styles.dropdownDivider}></div>

                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownItem} onClick={handleProfileClick}>
                    <span style={styles.dropdownIcon}>👤</span>
                    <span>Profile</span>
                  </div>
                  <div
                    style={{
                      ...styles.dropdownItem,
                      ...styles.dropdownItemLogout,
                    }}
                    onClick={handleSignOut}
                  >
                    <span style={styles.dropdownIcon}>🚪</span>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <br></br>
      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <StatCard icon="🍲" value="0" label="Food Received" />
        <StatCard icon="🎁" value="0" label="Donations" />
        <StatCard icon="🏆" value="0" label="Points" />
      </div>

      {/* Main Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>

        <div style={styles.actionCard} onClick={() => navigate("/donate")}>
          <div style={styles.actionIcon}>🤲</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Donate Food</h3>
            <p style={styles.actionDesc}>
              Share your surplus food with those in need
            </p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>

        <div style={styles.actionCard}>
          <div style={styles.actionIcon}>🗺️</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>Find Food Nearby</h3>
            <p style={styles.actionDesc}>
              Discover available food in your area
            </p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>

        <div style={styles.actionCard}>
          <div style={styles.actionIcon}>📜</div>
          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>My Requests</h3>
            <p style={styles.actionDesc}>View your active food requests</p>
          </div>
          <div style={styles.actionArrow}>→</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>No activity yet</p>
          <p style={styles.emptySubtext}>
            Start by donating or requesting food
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const styles = {
  container: {
    minHeight: "100vh",
    background: "#F9F9F9",
  },
  header: {
    background: COLORS.primary || "#7C9D3D",
    color: "white",
    padding: "20px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: FONT_SIZES.xl || "24px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  subGreeting: {
    fontSize: FONT_SIZES.sm || "14px",
    opacity: 0.9,
  },

  // Profile Avatar & Dropdown Styles
  profileContainer: {
    position: "relative",
  },
  profileAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
  },
  profileInitials: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
    userSelect: "none",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    minWidth: "260px",
    overflow: "hidden",
    zIndex: 1000,
    animation: "dropdownSlideIn 0.2s ease",
  },
  dropdownHeader: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(124, 157, 61, 0.05)",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: COLORS.primary || "#7C9D3D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    flexShrink: 0,
  },
  dropdownUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownName: {
    fontSize: "15px",
    fontWeight: "600",
    color: COLORS.text || "#2C3E50",
    marginBottom: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownEmail: {
    fontSize: "12px",
    color: COLORS.textLight || "#7F8C8D",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownDivider: {
    height: "1px",
    background: "#E0E0E0",
    margin: "0",
  },
  dropdownMenu: {
    padding: "8px",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
    color: COLORS.text || "#2C3E50",
  },
  dropdownItemLogout: {
    color: "#E74C3C",
  },
  dropdownIcon: {
    fontSize: "18px",
  },

  // Existing styles
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    padding: "20px",
    marginTop: "-20px",
  },
  statCard: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: FONT_SIZES.xl || "24px",
    fontWeight: "bold",
    color: COLORS.primary || "#7C9D3D",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: FONT_SIZES.xs || "12px",
    color: COLORS.textLight || "#7F8C8D",
  },
  section: {
    padding: "20px",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg || "18px",
    fontWeight: "600",
    color: COLORS.text || "#2C3E50",
    marginBottom: "16px",
  },
  actionCard: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
  },
  actionIcon: {
    fontSize: "32px",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md || "16px",
    fontWeight: "600",
    color: COLORS.text || "#2C3E50",
    marginBottom: "4px",
  },
  actionDesc: {
    fontSize: FONT_SIZES.xs || "12px",
    color: COLORS.textLight || "#7F8C8D",
  },
  actionArrow: {
    fontSize: "20px",
    color: COLORS.primary || "#7C9D3D",
  },
  emptyState: {
    background: "white",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: FONT_SIZES.md || "16px",
    color: COLORS.text || "#2C3E50",
    marginBottom: "8px",
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm || "14px",
    color: COLORS.textLight || "#7F8C8D",
  },
};

// Add CSS animation for dropdown (add this to your global CSS or App.css)
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
  // Ignore if already exists
}

export default ReceiverHome;
