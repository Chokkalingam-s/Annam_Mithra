// client/src/services/notification.service.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, auth } from "../config/firebase";

const messaging = getMessaging(app);
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log("📱 FCM Token obtained:", token.substring(0, 20) + "...");
        return token;
      } else {
        console.log("❌ No registration token available");
        return null;
      }
    } else {
      console.log("⛔ Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting notification permission:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Message received in foreground:", payload);
      resolve(payload);
    });
  });

// Save FCM token to backend
export const saveFCMToken = async (token) => {
  try {
    console.log("💾 Saving FCM token to backend...");

    const user = auth.currentUser;
    if (!user) {
      console.error("❌ No user logged in");
      return { success: false, message: "No user logged in" };
    }

    const authToken = await user.getIdToken();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    console.log("📤 Sending token to:", `${apiUrl}/notifications/fcm-token`);

    const response = await fetch(`${apiUrl}/notifications/fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ FCM Token saved to backend:", data);
      return data;
    } else {
      console.error("❌ Failed to save FCM token:", data);
      return data;
    }
  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
    return { success: false, message: error.message };
  }
};

// Send test notification (calls backend)
export const sendTestNotification = async () => {
  try {
    console.log("🧪 Sending test notification...");

    const user = auth.currentUser;
    if (!user) {
      console.error("❌ No user logged in");
      return { success: false, message: "User not logged in" };
    }

    const authToken = await user.getIdToken();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    console.log(
      "📤 Requesting test notification from:",
      `${apiUrl}/notifications/test`,
    );

    const response = await fetch(`${apiUrl}/notifications/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    console.log("✅ Test notification response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    return { success: false, message: error.message };
  }
};
