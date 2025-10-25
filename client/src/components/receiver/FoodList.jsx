import React from "react";

const FoodList = () => {
  return (
    <div style={styles.foodListSection}>
      <div style={styles.foodListTitle}>Available Food Near You</div>
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <p style={styles.emptyText}>No donations available right now</p>
        <p style={styles.emptySubtext}>
          Check back soon or donate food to help others
        </p>
      </div>
    </div>
  );
};

const styles = {
  foodListSection: {
    padding: "24px 16px",
    backgroundColor: "#FFFFFF",
  },
  foodListTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
    letterSpacing: "-0.01em",
  },
  emptyState: {
    backgroundColor: "#FAFAFA",
    border: "1px solid #F3F4F6",
    borderRadius: "16px",
    padding: "48px 24px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 16px",
    color: "#D1D5DB",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "6px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.5",
  },
};

export default FoodList;
