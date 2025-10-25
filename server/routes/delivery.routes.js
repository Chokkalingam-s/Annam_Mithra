// server/routes/delivery.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const deliveryController = require('../controllers/delivery.controller');

router.post('/request-partner', verifyToken, deliveryController.requestPartner);

module.exports = router;
