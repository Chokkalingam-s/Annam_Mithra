const db = require("../models");
const Tag = db.Tag;
const User = db.User;

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { latitude, longitude, address, description, estimatedPeople, tagType, firebaseUid } = req.body;
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const tag = await Tag.create({
      userId: user.id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      description,
      estimatedPeople: parseInt(estimatedPeople) || 0,
      images: imagePath ? [imagePath] : [],
      tagType: tagType || 'other',
      status: 'active',
      verificationCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

// Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};