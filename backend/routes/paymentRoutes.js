// ========================================
// Payment Routes
// ========================================

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
    createOrder,
    verifyPayment,
    getPaymentStatus,
    handleWebhook,
    initiateRefund
} = require('../controllers/paymentController');

// Create Razorpay order (requires auth)
router.post('/create-order', verifyToken, createOrder);

// Verify payment (requires auth)
router.post('/verify', verifyToken, verifyPayment);

// Get payment status (requires auth)
router.get('/status/:bookingId', verifyToken, getPaymentStatus);

// Razorpay webhook (no auth - verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Initiate refund (admin only)
router.post('/refund', verifyToken, isAdmin, initiateRefund);

module.exports = router;
