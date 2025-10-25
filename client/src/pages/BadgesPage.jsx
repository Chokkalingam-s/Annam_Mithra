import React from "react";
import { useNavigate } from "react-router-dom";

const BadgesPage = () => {
  const navigate = useNavigate();

  // Badge categories with their icons and counts
  const badgeCategories = [
    { id: 1, icon: "🏆", name: "First Donation", color: "purple", unlocked: true },
    { id: 2, icon: "🏰", name: "3 Donations Castle", color: "orange", unlocked: true },
    { id: 3, icon: "⚔️", name: "5 Donations Combat", color: "gray", unlocked: true },
    { id: 4, icon: "👑", name: "10 Donations Royal", color: "blue", unlocked: true },
    { id: 5, icon: "🦸‍♀️", name: "Hero 15", color: "pink", unlocked: false },
    { id: 6, icon: "😄", name: "20 Champion", color: "blue", unlocked: false },
    { id: 7, icon: "👹", name: "25 Monster", color: "green", unlocked: false },
    { id: 8, icon: "💀", name: "50 Skull", color: "blue", unlocked: false },
  ];

  // Badge color gradients
  const badgeColors = {
    purple: "linear-gradient(135deg, #9333EAdd, #9333EA99)",
    orange: "linear-gradient(135deg, #F97316dd, #F9731699)",
    gray: "linear-gradient(135deg, #64748Bdd, #64748B99)",
    blue: "linear-gradient(135deg, #3B82F6dd, #3B82F699)",
    pink: "linear-gradient(135deg, #EC4899dd, #EC489999)",
    green: "linear-gradient(135deg, #22C55Edd, #22C55E99)",
  };

  // Static badge history data
  const badgeHistory = [
    {
      id: 1,
      date: "2025-10-25",
      action: "Food Donation",
      description: "Donated 20 rotis to homeless community",
      badges: 20,
      icon: "🍽️",
      type: "donation"
    },
    {
      id: 2,
      date: "2025-10-23",
      action: "Delivery Completed",
      description: "Delivered food to NGO - Annam Foundation",
      badges: 15,
      icon: "🚚",
      type: "delivery"
    },
    {
      id: 3,
      date: "2025-10-20",
      action: "Food Donation",
      description: "Donated 10kg rice to Prime Spot",
      badges: 30,
      icon: "🍽️",
      type: "donation"
    },
    {
      id: 4,
      date: "2025-10-18",
      action: "First Donation",
      description: "Completed your first donation milestone!",
      badges: 50,
      icon: "🎉",
      type: "milestone"
    },
    {
      id: 5,
      date: "2025-10-15",
      action: "Delivery Completed",
      description: "Delivered food to receiver",
      badges: 10,
      icon: "🚚",
      type: "delivery"
    },
    {
      id: 6,
      date: "2025-10-10",
      action: "Food Donation",
      description: "Donated food at Railway Station area",
      badges: 25,
      icon: "🍽️",
      type: "donation"
    }
  ];

  const totalBadges = badgeHistory.reduce((sum, item) => sum + item.badges, 0);
  const silverLevelThreshold = 200;
  const badgesNeeded = silverLevelThreshold - totalBadges;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: "24px", height: "24px" }}
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 style={styles.title}>Badges</h1>
        <div style={{ width: "24px" }} />
      </div>

      {/* Total Badges Card */}
      <div style={styles.totalCard}>
        <div style={styles.badgesDisplay}>
          <h2 style={styles.totalBadgesNumber}>{totalBadges}</h2>
          <div style={styles.badgeIconLarge}>🥉</div>
        </div>
        <p style={styles.totalBadgesLabel}>Bronze Level</p>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(totalBadges / silverLevelThreshold) * 100}%`
            }}
          />
        </div>
        <p style={styles.progressText}>
          {badgesNeeded} more badges to reach Silver Level! 🥈
        </p>
      </div>

      {/* Badge Categories Grid */}
      <div style={styles.badgesSection}>
        <h3 style={styles.sectionTitle}>Badges Collection</h3>
        <div style={styles.badgesGrid}>
          {badgeCategories.map((badge) => (
            <div
              key={badge.id}
              style={{
                ...styles.badgeCard,
                opacity: badge.unlocked ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  ...styles.badgeIconContainer,
                  background: badge.unlocked
                    ? badgeColors[badge.color]
                    : "#E5E7EB",
                }}
              >
                <span style={styles.badgeIcon}>{badge.icon}</span>
              </div>
              <p style={styles.badgeName}>{badge.name}</p>
              {badge.unlocked && <span style={styles.unlockedBadge}>✓</span>}
            </div>
          ))}
        </div>
        <button style={styles.showCollectionButton}>
          Show Collection
        </button>
      </div>

      {/* History Section */}
      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Badge History</h3>

        <div style={styles.timeline}>
          {badgeHistory.map((item, index) => (
            <div key={item.id} style={styles.timelineItem}>
              <div style={styles.timelineLeft}>
                <div
                  style={{
                    ...styles.timelineDot,
                    backgroundColor:
                      item.type === "milestone"
                        ? "#FFD700"
                        : item.type === "donation"
                        ? "#C1693C"
                        : "#708238"
                  }}
                />
                {index !== badgeHistory.length - 1 && (
                  <div style={styles.timelineLine} />
                )}
              </div>

              <div style={styles.timelineContent}>
                <div style={styles.historyCard}>
                  <div style={styles.historyCardHeader}>
                    <div style={styles.historyIconContainer}>
                      <span style={styles.historyIcon}>{item.icon}</span>
                    </div>
                    <div style={styles.historyInfo}>
                      <h4 style={styles.historyAction}>{item.action}</h4>
                      <p style={styles.historyDate}>
                        {formatDate(item.date)} • {getRelativeTime(item.date)}
                      </p>
                    </div>
                    <div style={styles.badgeCountContainer}>
                      <span style={styles.badgeCountPlus}>+</span>
                      <span style={styles.badgeCount}>{item.badges}</span>
                      <span style={styles.badgeLabel}>badges</span>
                    </div>
                  </div>
                  <p style={styles.historyDescription}>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    paddingBottom: "100px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #F3F4F6",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.2s ease"
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0
  },
  totalCard: {
    padding: "20px",
    margin: "16px",
    background: "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)",
    borderRadius: "20px",
    boxShadow: "0 8px 24px rgba(205, 127, 50, 0.3)",
    textAlign: "center",
    color: "#FFFFFF"
  },
  badgesDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },
  badgeIconLarge: {
    fontSize: "32px",
    display: "inline-block",
    marginLeft: "8px"
  },
  totalBadgesNumber: {
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    display: "inline-block"
  },
  totalBadgesLabel: {
    fontSize: "14px",
    fontWeight: "500",
    margin: "8px 0 16px 0",
    opacity: 0.9
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "12px"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: "4px",
    transition: "width 0.5s ease",
    boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)"
  },
  progressText: {
    fontSize: "13px",
    margin: 0,
    opacity: 0.85
  },
  badgesSection: {
    padding: "0 16px 24px",
    backgroundColor: "#FFFFFF",
    margin: "16px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 16px 0",
    paddingTop: "20px"
  },
  badgesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px"
  },
  badgeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    transition: "transform 0.2s ease"
  },
  badgeIconContainer: {
    width: "70px",
    height: "70px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "3px solid #FFFFFF",
    position: "relative"
  },
  badgeIcon: {
    fontSize: "32px"
  },
  badgeName: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    margin: 0
  },
  unlockedBadge: {
    position: "absolute",
    top: "-4px",
    right: "8px",
    width: "20px",
    height: "20px",
    backgroundColor: "#10B981",
    borderRadius: "50%",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    border: "2px solid #FFFFFF",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },
  showCollectionButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    transition: "all 0.2s ease"
  },
  historySection: {
    padding: "0 20px 20px"
  },
  historyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 20px 0"
  },
  timeline: {
    position: "relative"
  },
  timelineItem: {
    display: "flex",
    marginBottom: "24px",
    position: "relative"
  },
  timelineLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "16px",
    position: "relative"
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "3px solid #FFFFFF",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: 2
  },
  timelineLine: {
    width: "2px",
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: "4px",
    marginBottom: "-24px"
  },
  timelineContent: {
    flex: 1
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F3F4F6"
  },
  historyCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px"
  },
  historyIconContainer: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#FEF3EE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  historyIcon: {
    fontSize: "20px"
  },
  historyInfo: {
    flex: 1,
    minWidth: 0
  },
  historyAction: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 4px 0"
  },
  historyDate: {
    fontSize: "12px",
    color: "#9CA3AF",
    margin: 0
  },
  badgeCountContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0
  },
  badgeCountPlus: {
    fontSize: "12px",
    color: "#10B981",
    fontWeight: "700",
    lineHeight: 1
  },
  badgeCount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#C1693C",
    lineHeight: 1,
    margin: "2px 0"
  },
  badgeLabel: {
    fontSize: "10px",
    color: "#9CA3AF",
    fontWeight: "500"
  },
  historyDescription: {
    fontSize: "13px",
    color: "#6B7280",
    margin: 0,
    lineHeight: 1.5
  }
};

export default BadgesPage;
