// server/controllers/notification.controller.js
const db = require("../models");
const User = db.User;
const notificationService = require("../services/notification.service");

// Save FCM token to user
exports.saveFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const firebaseUid = req.user.uid;

    // Find and update user with FCM token
    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ fcmToken });

    console.log("✅ FCM token saved for user:", user.email);

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

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.fcmToken) {
      return res.status(400).json({
        success: false,
        message: "No FCM token found. Please enable notifications.",
      });
    }

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

// Helper function - Send notification when new donation is created
exports.notifyNearbyReceivers = async (donation, donorName) => {
  try {
    // Find all active users with FCM tokens
    const receivers = await User.findAll({
      where: {
        fcmToken: { [db.Sequelize.Op.ne]: null },
        isActive: true,
      },
    });

    if (receivers.length === 0) {
      console.log("No receivers with FCM tokens found");
      return;
    }

    const tokens = receivers.map((r) => r.fcmToken);

    // Send notification to all receivers
    await notificationService.sendToMultipleDevices(
      tokens,
      {
        title: "🍲 New Food Donation Available!",
        body: `${donorName} donated ${donation.foodName} in your area`,
      },
      {
        donationId: donation.id.toString(),
        url: "/home",
      },
    );

    console.log(`✅ Notified ${receivers.length} receivers about new donation`);
  } catch (error) {
    console.error("❌ Error notifying receivers:", error);
  }
};
