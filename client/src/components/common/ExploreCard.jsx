import React from "react";
import { useNavigate } from "react-router-dom";


const ExploreCard = ({ icon, label, bgColor }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (label === 'Tag me') {
      navigate('/tag-me');
    }
    // Add other navigation handlers here
  };

  return (
    <div style={{ ...styles.exploreCard, backgroundColor: bgColor }} onClick={handleClick}>
      <div style={styles.exploreIcon}>{icon}</div>
      <div style={styles.exploreLabel}>{label}</div>
    </div>
  );
};

const styles = {
  exploreCard: {
    borderRadius: "12px",
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  exploreIcon: {
    fontSize: "32px",
  },
  exploreLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    lineHeight: "1.3",
  },
};

// Add hover effect
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const css = `
  div[style*="exploreCard"]:hover {
    transform: translateY(-2px);
  }
  `;

  try {
    styleSheet.insertRule(css, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore
  }
}

export default ExploreCard;