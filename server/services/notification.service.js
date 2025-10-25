// server/services/notification.service.js
const admin = require("../config/firebase.config");

class NotificationService {
  // Send notification to single device
  async sendToDevice(token, notification, data = {}) {
    try {
      console.log("📤 Attempting to send notification...");
      console.log("📱 To token:", token.substring(0, 20) + "...");
      console.log("📝 Title:", notification.title);

      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data,
        webpush: {
          fcmOptions: {
            link: data.url || "/",
          },
          notification: {
            icon: "/logo.png",
            badge: "/logo.png",
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log("✅ Notification sent successfully:", response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error("❌ Firebase messaging error:", error.code);
      console.error("❌ Error details:", error.message);

      // More descriptive error messages
      let userMessage = error.message;
      if (error.code === "messaging/invalid-registration-token") {
        userMessage = "Invalid FCM token. Please enable notifications again.";
      } else if (error.code === "messaging/registration-token-not-registered") {
        userMessage =
          "FCM token not registered. Please enable notifications again.";
      }

      return { success: false, error: userMessage };
    }
  }

  // Send to multiple devices
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      const message = {
        tokens: tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data,
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log(`✅ ${response.successCount} notifications sent`);
      return response;
    } catch (error) {
      console.error("❌ Error sending notifications:", error);
      return { success: false, error: error.message };
    }
  }

  // Send to topic
  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data,
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error("❌ Error sending to topic:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
