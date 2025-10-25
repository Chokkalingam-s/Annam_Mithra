const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const upload = require('../middleware/upload.middleware');

// Create tag with image upload
router.post('/', upload.single('tagImage'), tagController.createTag);

// Get all tags (with optional location filter)
router.get('/', tagController.getTags);

// Get single tag
router.get('/:id', tagController.getTagById);

// Verify tag
router.post('/verify', tagController.verifyTag);

// Delete tag
router.delete('/:id', tagController.deleteTag);

module.exports = router;