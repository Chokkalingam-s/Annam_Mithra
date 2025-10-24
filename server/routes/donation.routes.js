const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const upload = require('../middleware/upload.middleware');

// Create donation with image upload
router.post('/', upload.single('foodImage'), donationController.createDonation);

// Get all donations
router.get('/', donationController.getDonations);

module.exports = router;
