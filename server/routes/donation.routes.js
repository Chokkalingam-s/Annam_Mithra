const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const upload = require('../middleware/upload.middleware');

// Get nearby donations - MUST BE BEFORE GET /
router.get('/nearby', donationController.getNearbyDonations);

// Create donation with image upload
router.post('/', upload.single('foodImage'), donationController.createDonation);

// Get all donations
router.get('/', donationController.getDonations);

// Create interest
router.post('/interest', donationController.createInterest);

//app.use("/api/tags", require("./routes/tag.routes"));


module.exports = router;
