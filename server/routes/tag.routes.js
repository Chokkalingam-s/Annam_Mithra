const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const upload = require('../middleware/upload.middleware');

router.post('/', upload.single('tagImage'), tagController.createTag);
router.get('/', tagController.getTags);

module.exports = router;
