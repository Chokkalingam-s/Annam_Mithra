import React from "react";

const SearchBar = () => {
  return (
    <div style={styles.searchSection}>
      <div style={styles.searchBar}>
        <svg
          style={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          placeholder="Search for food donations"
          style={styles.searchInput}
        />
        <svg style={styles.micIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </div>
    </div>
  );
};

const styles = {
  searchSection: {
    padding: "12px 16px",
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  searchIcon: {
    width: "20px",
    height: "20px",
    color: "#C1693C",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    backgroundColor: "transparent",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
  },
  micIcon: {
    width: "20px",
    height: "20px",
    color: "#C1693C",
    flexShrink: 0,
  },
};

// Add placeholder style
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const css = `
  input[style*="searchInput"]::placeholder {
    color: #9CA3AF;
  }
  `;

  try {
    styleSheet.insertRule(css, styleSheet.cssRules.length);
  } catch (e) {
    // Ignore
  }
}

export default SearchBar;
