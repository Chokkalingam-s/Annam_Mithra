 const db = require("../models");
const User = db.User;

// Create or update user profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { firebaseUid, email, name, phone, vegPreference, receiverType, address, latitude, longitude } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { firebaseUid } });

    if (user) {
      // Update existing user
      await user.update({
        name,
        phone,
        vegPreference,
        receiverType,
        address,
        latitude,
        longitude,
        profileCompleted: true
      });
    } else {
      // Create new user
      user = await User.create({
        firebaseUid,
        email,
        name,
        phone,
        role: 'donor', // Default role
        vegPreference,
        receiverType,
        address,
        latitude,
        longitude,
        profileCompleted: true,
        isActive: true,
        language: 'en'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving profile',
      error: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const firebaseUid = req.user.uid; // From auth middleware

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const updates = req.body;

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
