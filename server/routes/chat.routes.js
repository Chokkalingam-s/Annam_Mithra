const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get chat messages
router.get('/:donationId/:receiverId', verifyToken, chatController.getChatMessages);

// Send message
router.post('/send', verifyToken, chatController.sendMessage);

module.exports = router;
