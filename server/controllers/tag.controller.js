const db = require("../models");
const Tag = db.Tag;
const User = db.User;
const TagVerification = db.TagVerification;

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { latitude, longitude, address, description, estimatedPeople, tagType, firebaseUid } = req.body;

    console.log('📝 Creating tag with data:', req.body);

    // Find user
    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get image path if uploaded
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

    console.log('✅ Tag created successfully:', tag.id);

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });

  } catch (error) {
    console.error('❌ Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

// Get all tags (with optional radius filter)
exports.getTags = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    const tags = await Tag.findAll({
      where: { status: ['active', 'verified'] },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }, {
        model: TagVerification,
        as: 'verifications',
        attributes: ['id', 'verified']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Filter by distance if location provided
    let filteredTags = tags;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInKm = parseFloat(radius);

      filteredTags = tags.filter(tag => {
        const distance = calculateDistance(
          lat, lng,
          parseFloat(tag.latitude),
          parseFloat(tag.longitude)
        );
        return distance <= radiusInKm;
      }).map(tag => ({
        ...tag.toJSON(),
        distance: calculateDistance(
          lat, lng,
          parseFloat(tag.latitude),
          parseFloat(tag.longitude)
        ).toFixed(2)
      }));
    }

    res.status(200).json({
      success: true,
      count: filteredTags.length,
      data: filteredTags
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// Verify a tag
exports.verifyTag = async (req, res) => {
  try {
    const { tagId, verified, comment, firebaseUid } = req.body;

    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    // Check if user already verified this tag
    const existingVerification = await TagVerification.findOne({
      where: { tagId, userId: user.id }
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: 'You have already verified this tag'
      });
    }

    // Create verification
    await TagVerification.create({
      tagId,
      userId: user.id,
      verified,
      comment
    });

    // Update verification count
    const newCount = tag.verificationCount + 1;
    await tag.update({
      verificationCount: newCount,
      status: newCount >= 3 ? 'verified' : tag.status
    });

    res.status(200).json({
      success: true,
      message: 'Tag verified successfully'
    });

  } catch (error) {
    console.error('Error verifying tag:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying tag',
      error: error.message
    });
  }
};

// Helper function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}