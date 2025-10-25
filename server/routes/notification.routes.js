// server/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Save FCM token
router.post("/fcm-token", verifyToken, notificationController.saveFCMToken);

// Send test notification
router.post("/test", verifyToken, notificationController.sendTestNotification);

module.exports = router;
