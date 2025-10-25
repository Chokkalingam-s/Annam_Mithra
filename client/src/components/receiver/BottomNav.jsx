import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect current page from the URL path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === "/home" || path === "/") return "home";
    if (path === "/messages") return "messages";
    if (path === "/find-food") return "receive";
    if (path === "/donate") return "donate";
    return "home";
  };

  const currentPage = getCurrentPage();

  const TabButton = ({ icon, label, page, navigatePath, active }) => (
    <div
      style={{
        ...styles.tabButton,
        ...(active && styles.tabButtonActive),
      }}
      onClick={() => navigate(navigatePath)}
    >
      <div style={{ ...styles.tabIcon, ...(active && styles.tabIconActive) }}>
        {icon}
      </div>
      {active && <span style={styles.tabLabel}>{label}</span>}
    </div>
  );

  return (
    <div style={styles.bottomNavContainer}>
      <div style={styles.bottomBar}>
        {/* 1. Home Tab - First position */}
        <TabButton
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          }
          label="Home"
          page="home"
          navigatePath="/home"
          active={currentPage === "home"}
        />

        {/* 4. Donate Tab - Fourth position */}
        <TabButton
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
            </svg>
          }
          label="Donate"
          page="donate"
          navigatePath="/donate"
          active={currentPage === "donate"}
        />

        {/* 3. Receive Tab - Third position */}
        <TabButton
          icon={
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M8 3c.55 0 1 .45 1 1v7c0 1.66-1.34 3-3 3H5v7c0 .55-.45 1-1 1s-1-.45-1-1V4c0-.55.45-1 1-1s1 .45 1 1v7h1c.55 0 1-.45 1-1V4c0-.55.45-1 1-1zm13 8c0-1.66-1.34-3-3-3V4c0-.55.45-1 1-1s1 .45 1 1v4h1V4c0-.55.45-1 1-1s1 .45 1 1v7h-1zm-8-6c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 2c-3.86 0-7 3.14-7 7 0 3.86 3.14 7 7 7s7-3.14 7-7c0-3.86-3.14-7-7-7z"/>
</svg>

 
          }
          label="Receive"
          page="receive"
          navigatePath="/find-food"
          active={currentPage === "receive"}
        />


      </div>

      {/* Add animation CSS */}
      <style>{`
        @keyframes fadeInLabel {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  bottomNavContainer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "0 16px 20px",
    zIndex: 1000,
    pointerEvents: "none",
  },
  bottomBar: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderRadius: "28px",
    padding: "8px",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: "420px",
    margin: "0 auto",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    pointerEvents: "auto",
    gap: "4px",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    cursor: "pointer",
    borderRadius: "20px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "transparent",
    minWidth: "48px",
  },
  tabButtonActive: {
    backgroundColor: "#8751d3ee",
    paddingLeft: "16px",
    paddingRight: "16px",
    boxShadow: "0 4px 12px rgba(146, 55, 207, 0.3)",
  },
  tabIcon: {
    width: "24px",
    height: "24px",
    color: "#9CA3AF",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconActive: {
    color: "#FFFFFF",
  },
  tabLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    animation: "fadeInLabel 0.3s ease",
  },
};

export default BottomNav;
