// client/src/components/NotificationSetup.jsx
import React, { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onMessageListener,
  saveFCMToken,
} from "../services/notification.service";
import { COLORS } from "../config/theme";

const NotificationSetup = () => {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    // Check if permission already granted
    if (Notification.permission === "granted") {
      setupNotifications();
    } else if (Notification.permission === "default") {
      // Show prompt to user
      setShowPermissionPrompt(true);
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("📩 Foreground notification:", payload);
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
          data: payload.data,
        });
        setShow(true);

        setTimeout(() => setShow(false), 5000);
      })
      .catch((err) => console.log("Failed to receive message:", err));
  }, []);

  const setupNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      await saveFCMToken(token);
      localStorage.setItem("fcmToken", token);
      setShowPermissionPrompt(false);
    }
  };

  const handleEnableNotifications = async () => {
    await setupNotifications();
  };

  if (!show && !notification && !showPermissionPrompt) return null;

  return (
    <>
      {/* Permission Prompt */}
      {showPermissionPrompt && (
        <div style={styles.promptContainer}>
          <div style={styles.promptCard}>
            <h3 style={styles.promptTitle}>🔔 Enable Notifications</h3>
            <p style={styles.promptText}>
              Get instant updates when new food donations are available in your
              area
            </p>
            <div style={styles.promptButtons}>
              <button
                onClick={handleEnableNotifications}
                style={styles.enableBtn}
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowPermissionPrompt(false)}
                style={styles.cancelBtn}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Display */}
      {show && notification && (
        <div style={styles.container}>
          <div style={styles.notification}>
            <div style={styles.header}>
              <h4 style={styles.title}>🔔 {notification.title}</h4>
              <button onClick={() => setShow(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>
            <p style={styles.body}>{notification.body}</p>
            {notification.data?.url && (
              <button
                style={styles.actionBtn}
                onClick={() => {
                  window.location.href = notification.data.url;
                }}
              >
                View
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  // Permission prompt styles
  promptContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  promptCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "400px",
    margin: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  promptTitle: {
    margin: "0 0 12px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: COLORS.text,
  },
  promptText: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    color: COLORS.textLight,
    lineHeight: "1.5",
  },
  promptButtons: {
    display: "flex",
    gap: "12px",
  },
  enableBtn: {
    flex: 1,
    background: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    background: "transparent",
    color: COLORS.textLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Notification display styles
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
  },
  notification: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    minWidth: "300px",
    maxWidth: "400px",
    border: `2px solid ${COLORS.primary}`,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.text,
  },
  body: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    color: COLORS.textLight,
    lineHeight: "1.4",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: COLORS.textLight,
    padding: "0",
    marginLeft: "8px",
  },
  actionBtn: {
    background: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
};

export default NotificationSetup;
