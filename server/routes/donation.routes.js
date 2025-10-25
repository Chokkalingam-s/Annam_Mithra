const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const upload = require('../middleware/upload.middleware');
const { verifyToken } = require('../middleware/auth.middleware'); // ✅ Import existing middleware

// Public routes (no auth required)
router.get('/nearby', donationController.getNearbyDonations);

// Protected routes (auth required)
router.post('/', verifyToken, upload.single('foodImage'), donationController.createDonation);
router.get('/', verifyToken, donationController.getDonations);

// Interest routes (all require auth)
router.post('/interest', verifyToken, donationController.createInterest);
router.get('/interests/received', verifyToken, donationController.getReceivedInterests); // ✅ Add middleware here
router.get('/interests/sent', verifyToken, donationController.getSentInterests); // ✅ Add middleware here
router.post('/interests/accept', verifyToken, donationController.acceptInterest);
router.post('/interests/decline', verifyToken, donationController.declineInterest);

module.exports = router;
