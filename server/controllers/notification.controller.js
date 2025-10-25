// server/controllers/notification.controller.js
const db = require("../models");
const User = db.User;
const notificationService = require("../services/notification.service");

// Save FCM token to user
exports.saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const firebaseUid = req.user.uid;

    console.log("💾 Saving FCM token for user:", firebaseUid);
    console.log("📱 Token:", fcmToken.substring(0, 20) + "...");

    // Find and update user with FCM token
    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      console.error("❌ User not found:", firebaseUid);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ fcmToken });

    console.log("✅ FCM token saved successfully for:", user.email);

    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Error saving FCM token",
      error: error.message,
    });
  }
};

// Send test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    console.log("🧪 Test notification requested for user:", firebaseUid);

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      console.error("❌ User not found:", firebaseUid);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("👤 User found:", user.email);
    console.log(
      "📱 FCM Token:",
      user.fcmToken ? user.fcmToken.substring(0, 20) + "..." : "NULL",
    );

    if (!user.fcmToken) {
      console.error("❌ No FCM token found for user");
      return res.status(400).json({
        success: false,
        message: "No FCM token found. Please enable notifications.",
      });
    }

    console.log("📤 Sending notification via Firebase...");

    // Send test notification
    const result = await notificationService.sendToDevice(
      user.fcmToken,
      {
        title: "🎉 Test Notification",
        body: "Your notifications are working perfectly!",
      },
      {
        url: "/home",
      },
    );

    console.log("📬 Notification result:", result);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending test notification",
      error: error.message,
    });
  }
};
