// src/components/receiver/ExploreSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ExploreCard from "../common/ExploreCard"; // Adjust path if needed

const ExploreSection = () => {
  const navigate = useNavigate();

  const exploreItems = [
    { icon: "🏷️", label: "Tag me", bgColor: "#E8F5FE", route: "/tag-me" },
    { icon: "📦", label: "Delivery", bgColor: "#FCF0E6", route: "/delivery" },
    { icon: "🎖️", label: "Badges", bgColor: "#FEF3E0", route: "/badges" }, // This will navigate to BadgesPage
    { icon: "🌐", label: "Multilingual", bgColor: "#FFEAF4", route: "/multilingual" },
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={styles.exploreSection}>
      <div style={styles.exploreTitle}>EXPLORE MORE</div>
      <div style={styles.exploreGrid}>
        {exploreItems.map((item, index) => (
          <div key={index} onClick={() => handleCardClick(item.route)}>
            <ExploreCard
              icon={item.icon}
              label={item.label}
              bgColor={item.bgColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  exploreSection: {
    padding: "24px 16px 16px",
    backgroundColor: "#FFFFFF",
  },
  exploreTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: "0.5px",
    marginBottom: "16px",
  },
  exploreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
};

export default ExploreSection;
