const db = require("../models");
const Donation = db.Donation;
const User = db.User;

// Create donation
exports.createDonation = async (req, res) => {
  try {
    const { 
      foodItems, 
      foodType, 
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
        targetReceiverType: 'both',
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
