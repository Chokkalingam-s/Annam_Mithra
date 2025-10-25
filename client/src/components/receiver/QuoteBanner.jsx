import React from "react";

const QuoteBanner = () => {
  return (
    <div style={styles.quoteBanner}>
      <div style={styles.quoteIcon}>💚</div>
      <div style={styles.quoteText}>
        <strong>"No one has ever become poor by giving."</strong> - Share food,
        spread happiness.
      </div>
    </div>
  );
};

const styles = {
  quoteBanner: {
    backgroundColor: "#FFF9E6",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderTop: "1px solid #F3F4F6",
    borderBottom: "1px solid #F3F4F6",
  },
  quoteIcon: {
    fontSize: "28px",
    flexShrink: 0,
  },
  quoteText: {
    fontSize: "13px",
    color: "#111827",
    lineHeight: "1.5",
  },
};

export default QuoteBanner;
