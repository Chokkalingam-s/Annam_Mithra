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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAndSetupNotifications();

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

  const checkAndSetupNotifications = async () => {
    console.log("🔍 Checking notification status...");
    console.log("📋 Permission:", Notification.permission);

    // Check if permission is granted
    if (Notification.permission === "granted") {
      console.log("✅ Permission granted, checking token...");

      // Try to get/refresh token
      try {
        await setupNotifications();
      } catch (error) {
        console.error("❌ Error setting up notifications:", error);
        // Token might be invalid, show prompt
        setShowPermissionPrompt(true);
      }
    } else if (Notification.permission === "default") {
      // Permission not requested yet
      console.log("⏳ Permission not requested, showing prompt");
      setShowPermissionPrompt(true);
    } else {
      // Permission denied
      console.log("⛔ Permission denied");
    }
  };

  const setupNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      const result = await saveFCMToken(token);
      if (result && result.success) {
        localStorage.setItem("fcmToken", token);
        console.log("✅ Notifications setup complete");
      } else {
        console.error("❌ Failed to save token");
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    // Close dialog immediately
    setShowPermissionPrompt(false);

    // Setup notifications in background
    try {
      await setupNotifications();
      console.log("✅ Notifications enabled successfully");
    } catch (error) {
      console.error("❌ Error enabling notifications:", error);
      // Show prompt again if failed
      setTimeout(() => setShowPermissionPrompt(true), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotNow = () => {
    setShowPermissionPrompt(false);
  };

  const handleReEnable = () => {
    // Force show the prompt again
    setShowPermissionPrompt(true);
  };

  // Add global error handler for invalid token errors
  useEffect(() => {
    const handleInvalidToken = () => {
      console.log("🔄 Invalid token detected, showing re-enable prompt");
      setShowPermissionPrompt(true);
    };

    window.addEventListener("fcm-token-invalid", handleInvalidToken);

    return () => {
      window.removeEventListener("fcm-token-invalid", handleInvalidToken);
    };
  }, []);

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
                disabled={isLoading}
                style={{
                  ...styles.enableBtn,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </button>
              <button
                onClick={handleNotNow}
                disabled={isLoading}
                style={{
                  ...styles.cancelBtn,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
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
    width: "90%",
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
    transition: "all 0.2s",
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
    transition: "all 0.2s",
  },
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
