const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Collectors management
router.get('/collectors', adminController.getCollectors);
router.post('/collectors', adminController.createCollector);

// Contact messages
router.get('/messages', adminController.getContactMessages);

module.exports = router;
