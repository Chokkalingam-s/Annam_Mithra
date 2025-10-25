import React from "react";
import ExploreCard from "../common/ExploreCard";

const ExploreSection = () => {
  const exploreItems = [
    { icon: "🏷️", label: "Tag me", bgColor: "#E8F5FE" },
    { icon: "📦", label: "Delivery", bgColor: "#FCF0E6" },
    { icon: "🎖️", label: "Badges", bgColor: "#FEF3E0" },
    { icon: "🌐", label: "Multilingual", bgColor: "#FFEAF4" },
  ];

  return (
    <div style={styles.exploreSection}>
      <div style={styles.exploreTitle}>EXPLORE MORE</div>
      <div style={styles.exploreGrid}>
        {exploreItems.map((item, index) => (
          <ExploreCard
            key={index}
            icon={item.icon}
            label={item.label}
            bgColor={item.bgColor}
          />
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
