import React from "react";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  const TabButton = ({ icon, label, active, onClick }) => (
    <div
      style={{ ...styles.tabButton, ...(active && styles.tabButtonActive) }}
      onClick={onClick}
    >
      <div style={{ ...styles.tabIcon, ...(active && styles.tabIconActive) }}>
        {icon}
      </div>
      <div style={{ ...styles.tabLabel, ...(active && styles.tabLabelActive) }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={styles.bottomBar}>
      <TabButton
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
          </svg>
        }
        label="Donate"
        onClick={() => navigate("/donate")}
      />
      <TabButton
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        }
        label="Home"
        active
        onClick={() => navigate("/receiver-home")}
      />
      <TabButton
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
          </svg>
        }
        label="Receive"
        onClick={() => navigate("/find-food")}
      />
    </div>
  );
};

const styles = {
  bottomBar: {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #F3F4F6",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 0 12px",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
    zIndex: 100,
  },
  tabButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    flex: 1,
    padding: "4px",
  },
  tabButtonActive: {},
  tabIcon: {
    width: "24px",
    height: "24px",
    color: "#9CA3AF",
  },
  tabIconActive: {
    color: "#C1693C",
  },
  tabLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabLabelActive: {
    color: "#8056baff",
  },
};

export default BottomNav;
