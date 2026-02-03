const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', testController.getAllTests);
router.get('/categories', testController.getCategories);
router.get('/:id', testController.getTestById);

// Admin routes
router.post('/', verifyToken, isAdmin, testController.createTest);
router.put('/:id', verifyToken, isAdmin, testController.updateTest);
router.delete('/:id', verifyToken, isAdmin, testController.deleteTest);

module.exports = router;
