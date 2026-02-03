// ========================================
// Payment Controller - Razorpay Integration
// ========================================

const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { query } = require('../config/database');
const { sendBookingConfirmation } = require('./notificationController');

// Create Razorpay order
exports.createOrder = async (req, res) => {
    try {
        const { booking_id, amount } = req.body;

        if (!booking_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and amount are required'
            });
        }

        // Verify booking exists and belongs to user
        const bookings = await query(
            'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
            [booking_id, req.user.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        // Check if already paid
        if (booking.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Booking already paid'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: booking_id,
            notes: {
                booking_id: booking_id,
                user_id: req.user.id.toString(),
                user_email: req.user.email
            }
        };

        const order = await razorpay.orders.create(options);

        // Store payment record
        const result = await query(
            `INSERT INTO payments (razorpay_order_id, amount, currency, status)
             VALUES (?, ?, ?, 'created')`,
            [order.id, amount, 'INR']
        );

        // Link payment to booking
        await query(
            'UPDATE bookings SET payment_id = ? WHERE booking_id = ?',
            [result.insertId, booking_id]
        );

        res.json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
        });
    }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            booking_id
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            // Update payment as failed
            await query(
                `UPDATE payments SET status = 'failed', error_description = 'Invalid signature'
                 WHERE razorpay_order_id = ?`,
                [razorpay_order_id]
            );

            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Update payment record
        await query(
            `UPDATE payments SET
                razorpay_payment_id = ?,
                razorpay_signature = ?,
                status = 'paid',
                method = ?,
                bank = ?,
                wallet = ?,
                vpa = ?
             WHERE razorpay_order_id = ?`,
            [
                razorpay_payment_id,
                razorpay_signature,
                payment.method,
                payment.bank || null,
                payment.wallet || null,
                payment.vpa || null,
                razorpay_order_id
            ]
        );

        // Update booking status
        await query(
            `UPDATE bookings SET payment_status = 'paid', status = 'confirmed'
             WHERE booking_id = ?`,
            [booking_id]
        );

        // Get updated booking
        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [booking_id]);
        const booking = bookings[0];

        // Get user info
        const users = await query('SELECT * FROM users WHERE id = ?', [booking.user_id]);
        const user = users[0];

        // Get booking tests
        const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);

        // Send confirmation email
        try {
            await sendBookingConfirmation(user, { ...booking, tests });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the payment verification if email fails
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                booking_id: booking_id,
                payment_id: razorpay_payment_id,
                status: 'paid'
            }
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookings = await query(
            `SELECT b.*, p.razorpay_order_id, p.razorpay_payment_id, p.status as razorpay_status,
                    p.method as payment_method
             FROM bookings b
             LEFT JOIN payments p ON b.payment_id = p.id
             WHERE b.booking_id = ?`,
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        // Check authorization
        if (req.user.user_type === 'patient' && booking.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {
                booking_id: booking.booking_id,
                payment_status: booking.payment_status,
                razorpay_order_id: booking.razorpay_order_id,
                razorpay_payment_id: booking.razorpay_payment_id,
                payment_method: booking.payment_method
            }
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Razorpay webhook handler
exports.handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature if secret is configured
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }
        }

        const event = req.body.event;
        const payload = req.body.payload;

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;

            case 'refund.created':
                await handleRefundCreated(payload.refund.entity);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};

// Handle payment captured webhook
async function handlePaymentCaptured(payment) {
    try {
        await query(
            `UPDATE payments SET
                razorpay_payment_id = ?,
                status = 'paid',
                method = ?,
                bank = ?,
                wallet = ?,
                vpa = ?
             WHERE razorpay_order_id = ?`,
            [
                payment.id,
                payment.method,
                payment.bank || null,
                payment.wallet || null,
                payment.vpa || null,
                payment.order_id
            ]
        );

        // Get payment record to find booking
        const payments = await query(
            'SELECT * FROM payments WHERE razorpay_order_id = ?',
            [payment.order_id]
        );

        if (payments.length > 0) {
            await query(
                `UPDATE bookings SET payment_status = 'paid', status = 'confirmed'
                 WHERE payment_id = ?`,
                [payments[0].id]
            );
        }
    } catch (error) {
        console.error('Handle payment captured error:', error);
    }
}

// Handle payment failed webhook
async function handlePaymentFailed(payment) {
    try {
        await query(
            `UPDATE payments SET
                status = 'failed',
                error_code = ?,
                error_description = ?
             WHERE razorpay_order_id = ?`,
            [
                payment.error_code,
                payment.error_description,
                payment.order_id
            ]
        );

        // Get payment record to find booking
        const payments = await query(
            'SELECT * FROM payments WHERE razorpay_order_id = ?',
            [payment.order_id]
        );

        if (payments.length > 0) {
            await query(
                `UPDATE bookings SET payment_status = 'failed'
                 WHERE payment_id = ?`,
                [payments[0].id]
            );
        }
    } catch (error) {
        console.error('Handle payment failed error:', error);
    }
}

// Handle refund created webhook
async function handleRefundCreated(refund) {
    try {
        await query(
            `UPDATE payments SET status = 'refunded'
             WHERE razorpay_payment_id = ?`,
            [refund.payment_id]
        );

        // Get payment record to find booking
        const payments = await query(
            'SELECT * FROM payments WHERE razorpay_payment_id = ?',
            [refund.payment_id]
        );

        if (payments.length > 0) {
            await query(
                `UPDATE bookings SET payment_status = 'refunded', status = 'cancelled'
                 WHERE payment_id = ?`,
                [payments[0].id]
            );
        }
    } catch (error) {
        console.error('Handle refund created error:', error);
    }
}

// Initiate refund (Admin only)
exports.initiateRefund = async (req, res) => {
    try {
        const { booking_id, reason } = req.body;

        // Get booking with payment info
        const bookings = await query(
            `SELECT b.*, p.razorpay_payment_id, p.amount
             FROM bookings b
             JOIN payments p ON b.payment_id = p.id
             WHERE b.booking_id = ?`,
            [booking_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const booking = bookings[0];

        if (booking.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot refund unpaid booking'
            });
        }

        // Initiate refund via Razorpay
        const refund = await razorpay.payments.refund(booking.razorpay_payment_id, {
            amount: Math.round(booking.amount * 100),
            notes: {
                booking_id: booking_id,
                reason: reason || 'Booking cancelled'
            }
        });

        // Update payment and booking status
        await query(
            `UPDATE payments SET status = 'refunded' WHERE razorpay_payment_id = ?`,
            [booking.razorpay_payment_id]
        );

        await query(
            `UPDATE bookings SET payment_status = 'refunded', status = 'cancelled'
             WHERE booking_id = ?`,
            [booking_id]
        );

        res.json({
            success: true,
            message: 'Refund initiated successfully',
            data: {
                refund_id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });
    } catch (error) {
        console.error('Initiate refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate refund'
        });
    }
};
