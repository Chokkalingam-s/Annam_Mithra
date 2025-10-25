const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const upload = require('../middleware/upload.middleware');

// Create donation with image upload
router.post('/', upload.single('foodImage'), donationController.createDonation);

// Get all donations
router.get('/', donationController.getDonations);

// Get nearby donations
router.get('/nearby', donationController.getNearbyDonations);

// Interest routes
router.post('/interest', donationController.createInterest);
router.get('/interests/received', donationController.getReceivedInterests);
router.get('/interests/sent', donationController.getSentInterests);
router.post('/interests/accept', donationController.acceptInterest);
router.post('/interests/decline', donationController.declineInterest);

module.exports = router;
