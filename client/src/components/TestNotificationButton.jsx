// client/src/components/TestNotificationButton.jsx
import React, { useState } from "react";
import { sendTestNotification } from "../services/notification.service";
import { COLORS } from "../config/theme";

const TestNotificationButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await sendTestNotification();

      if (result?.success) {
        setMessage("✅ Test notification sent! Check your notifications.");
      } else {
        setMessage("❌ Failed to send notification. Check console.");
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleTestNotification}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "📤 Sending..." : "🔔 Send Test Notification"}
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  button: {
    background: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
  message: {
    marginTop: "8px",
    padding: "8px 12px",
    background: "white",
    borderRadius: "8px",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

export default TestNotificationButton;
