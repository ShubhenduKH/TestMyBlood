const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', labController.getAllLabs);
router.get('/:id', labController.getLabById);

// Admin routes
router.post('/', verifyToken, isAdmin, labController.createLab);
router.put('/:id', verifyToken, isAdmin, labController.updateLab);
router.delete('/:id', verifyToken, isAdmin, labController.deleteLab);

module.exports = router;
