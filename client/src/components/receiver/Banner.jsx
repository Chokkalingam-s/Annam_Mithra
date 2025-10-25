import React from "react";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.bannerSection}>
      <div style={styles.banner}>
        <div style={styles.bannerContent}>
          <div style={styles.bannerBadge}>
            <div style={styles.bannerText}>DONATE</div>
            <div style={styles.bannerDiscount}>& HELP</div>
          </div>
          <button
            style={styles.bannerButton}
            onClick={() => navigate("/donate")}
          >
            Share Food →
          </button>
        </div>
        <div style={styles.bannerImage}>
          <div style={styles.foodEmoji}>🍲</div>
          <div style={styles.foodEmoji2}>🥗</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bannerSection: {
    padding: "0 16px 16px",
    backgroundColor: "#FFFFFF",
  },
  banner: {
    background: "#CD7644",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  bannerContent: {
    zIndex: 2,
  },
  bannerBadge: {
    marginBottom: "12px",
  },
  bannerText: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#FFFFFF",
    fontStyle: "italic",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    lineHeight: "1",
  },
  bannerDiscount: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#FFFFFF",
    fontStyle: "italic",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    lineHeight: "1.2",
  },
  bannerButton: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  bannerImage: {
    position: "relative",
    zIndex: 1,
  },
  foodEmoji: {
    fontSize: "80px",
    filter: "drop-shadow(4px 4px 8px rgba(0,0,0,0.15))",
  },
  foodEmoji2: {
    fontSize: "50px",
    position: "absolute",
    top: "-10px",
    right: "-20px",
    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))",
  },
};

export default Banner;
