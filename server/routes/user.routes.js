const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public route - create/update profile (first time)
router.post('/profile', userController.createOrUpdateProfile);

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;
