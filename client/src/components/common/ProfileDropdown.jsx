import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

const ProfileDropdown = ({ profile, getInitials, onClose }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
    onClose();
  };

  const handleRequestsClick = () => {
    navigate("/requests");
    onClose();
  };

  return (
    <div style={styles.dropdown}>
      <div style={styles.dropdownHeader}>
        <div style={styles.dropdownAvatar}>{getInitials(profile.name)}</div>
        <div>
          <div style={styles.dropdownName}>{profile.name || "User"}</div>
          <div style={styles.dropdownEmail}>{profile.email}</div>
        </div>
      </div>

      <div style={styles.dropdownDivider}></div>

      <div style={styles.dropdownItem} onClick={handleProfileClick}>
        <svg
          style={styles.dropdownIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>My Profile</span>
      </div>

      <div style={styles.dropdownItem} onClick={handleRequestsClick}>
        <svg
          style={styles.dropdownIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>My Requests</span>
      </div>

      <div style={styles.dropdownDivider}></div>

      <div
        style={{ ...styles.dropdownItem, color: "#dc2626" }}
        onClick={handleSignOut}
      >
        <svg
          style={styles.dropdownIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </div>
    </div>
  );
};

const styles = {
  dropdown: {
    position: "absolute",
    top: "46px",
    right: "0",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    minWidth: "240px",
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#F9FAFB",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#C1693C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dropdownName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
  },
  dropdownEmail: {
    fontSize: "12px",
    color: "#6B7280",
    marginTop: "2px",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#F3F4F6",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
    transition: "background-color 0.15s ease",
  },
  dropdownIcon: {
    width: "20px",
    height: "20px",
  },
};

// Add hover effect
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const css = `
  div[style*="dropdownItem"]:hover {
    background-color: #F9FAFB !important;
  }
  `;

  try {
    styleSheet.insertRule(css, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore
  }
}

export default ProfileDropdown;
