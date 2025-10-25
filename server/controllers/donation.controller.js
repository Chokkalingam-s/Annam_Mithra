const db = require("../models");
const Donation = db.Donation;
const User = db.User;

// Create donation
exports.createDonation = async (req, res) => {
  try {
    const { 
      foodItems, 
      foodType, 
      targetReceiverType,
      latitude, 
      longitude, 
      address,
      phone 
    } = req.body;

    // Get user from Firebase token
    const firebaseUid = req.user ? req.user.uid : req.body.firebaseUid;
    
    // Find user
    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse food items if string
    const items = typeof foodItems === 'string' ? JSON.parse(foodItems) : foodItems;

    // Get image path if uploaded
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Create donation for each food item
    const donations = [];
    
    for (const item of items) {
      const donation = await Donation.create({
        donorId: user.id,
        foodName: item.dishName,
        quantity: parseInt(item.quantity) || 1,
        remainingQuantity: parseInt(item.quantity) || 1,
        foodType: foodType,
        description: `${item.dishName} - ${item.quantity}`,
        images: imagePath ? [imagePath] : [],
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address,
        phone: phone,
        targetReceiverType: targetReceiverType || 'both',
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
      donations.push(donation);
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donations
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
};

// Get all active donations
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { status: 'active' },
      include: [{
        model: User,
        as: 'donor',
        attributes: ['id', 'name', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
};


// Add to existing donation.controller.js

// Get nearby donations (within 2km radius)
exports.getNearbyDonations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 2 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    // Haversine formula to calculate distance
    const donations = await Donation.findAll({
      where: { 
        status: 'active',
        expiresAt: {
          [db.Sequelize.Op.gt]: new Date()
        }
      },
      include: [{
        model: User,
        as: 'donor',
        attributes: ['id', 'name', 'phone', 'address']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Filter by distance
    const nearbyDonations = donations.filter(donation => {
      const distance = calculateDistance(
        lat, 
        lng, 
        parseFloat(donation.latitude), 
        parseFloat(donation.longitude)
      );
      return distance <= radiusInKm;
    }).map(donation => ({
      ...donation.toJSON(),
      distance: calculateDistance(
        lat, 
        lng, 
        parseFloat(donation.latitude), 
        parseFloat(donation.longitude)
      ).toFixed(2)
    }));

    res.status(200).json({
      success: true,
      count: nearbyDonations.length,
      data: nearbyDonations
    });

  } catch (error) {
    console.error('Error fetching nearby donations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby donations',
      error: error.message
    });
  }
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Create interest/request for donation
exports.createInterest = async (req, res) => {
  try {
    const { donationId, message } = req.body;
    const firebaseUid = req.user ? req.user.uid : req.body.firebaseUid;

    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const donation = await Donation.findByPk(donationId);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Create interest record (assuming you have Interest model)
    const interest = await db.Interest.create({
      donationId: donationId,
      receiverId: user.id,
      message: message,
      quantityRequested: donation.quantity,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Interest sent successfully',
      data: interest
    });

  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating interest',
      error: error.message
    });
  }
};

// Get interests received (for donors)
// Get interests received (for donors)
exports.getReceivedInterests = async (req, res) => {
  try {
    const firebaseUid = req.user.uid; // ✅ Now this will work because of middleware

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all donations by this user
    const donations = await Donation.findAll({
      where: { donorId: user.id },
      include: [{
        model: db.Interest,
        as: 'interests',
        include: [{
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'phone']
        }]
      }]
    });

    // Flatten interests from all donations
    const interests = donations.flatMap(donation => 
      donation.interests.map(interest => ({
        ...interest.toJSON(),
        donation: {
          id: donation.id,
          foodName: donation.foodName,
          foodType: donation.foodType,
          quantity: donation.quantity
        }
      }))
    );

    res.status(200).json({
      success: true,
      data: interests
    });

  } catch (error) {
    console.error('Error fetching received interests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching received interests',
      error: error.message
    });
  }
};

// Get interests sent (for receivers)
exports.getSentInterests = async (req, res) => {
  try {
    const firebaseUid = req.user.uid; // ✅ Now this will work

    const user = await User.findOne({ where: { firebaseUid } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const interests = await db.Interest.findAll({
      where: { receiverId: user.id },
      include: [{
        model: Donation,
        as: 'donation',
        include: [{
          model: User,
          as: 'donor',
          attributes: ['id', 'name', 'phone']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: interests
    });

  } catch (error) {
    console.error('Error fetching sent interests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent interests',
      error: error.message
    });
  }
};

// Accept interest
exports.acceptInterest = async (req, res) => {
  try {
    const { interestId, donationId } = req.body;

    const interest = await db.Interest.findByPk(interestId);
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    interest.status = 'accepted';
    await interest.save();

    res.status(200).json({
      success: true,
      message: 'Interest accepted',
      data: interest
    });

  } catch (error) {
    console.error('Error accepting interest:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting interest',
      error: error.message
    });
  }
};

// Decline interest
exports.declineInterest = async (req, res) => {
  try {
    const { interestId } = req.body;

    const interest = await db.Interest.findByPk(interestId);
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    interest.status = 'declined';
    await interest.save();

    res.status(200).json({
      success: true,
      message: 'Interest declined',
      data: interest
    });

  } catch (error) {
    console.error('Error declining interest:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining interest',
      error: error.message
    });
  }
};
