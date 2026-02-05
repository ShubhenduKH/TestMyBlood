const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const initDatabase = require('./config/initDb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const labRoutes = require('./routes/labRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { submitContactMessage } = require('./controllers/adminController');
const { getNotificationHistory, resendNotification } = require('./controllers/notificationController');
const { verifyToken, isAdmin } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded reports)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes (defined before static files so they take priority)
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Public contact form route
app.post('/api/contact', submitContactMessage);

// Notification routes (Admin only)
app.get('/api/notifications', verifyToken, isAdmin, getNotificationHistory);
app.post('/api/notifications/:notification_id/resend', verifyToken, isAdmin, resendNotification);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Test My Blood API is running',
        timestamp: new Date().toISOString()
    });
});

// API documentation
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Test My Blood API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'GET /api/auth/profile': 'Get user profile (requires auth)',
                'PUT /api/auth/profile': 'Update profile (requires auth)',
                'PUT /api/auth/change-password': 'Change password (requires auth)'
            },
            tests: {
                'GET /api/tests': 'Get all tests',
                'GET /api/tests/categories': 'Get test categories',
                'GET /api/tests/:id': 'Get test by ID',
                'POST /api/tests': 'Create test (admin)',
                'PUT /api/tests/:id': 'Update test (admin)',
                'DELETE /api/tests/:id': 'Delete test (admin)'
            },
            labs: {
                'GET /api/labs': 'Get all labs',
                'GET /api/labs/:id': 'Get lab by ID',
                'POST /api/labs': 'Create lab (admin)',
                'PUT /api/labs/:id': 'Update lab (admin)',
                'DELETE /api/labs/:id': 'Delete lab (admin)'
            },
            doctors: {
                'GET /api/doctors': 'Get all doctors',
                'GET /api/doctors/specialties': 'Get specialties',
                'GET /api/doctors/:id': 'Get doctor by ID',
                'POST /api/doctors/appointments': 'Book appointment (requires auth)',
                'GET /api/doctors/appointments/my': 'Get my appointments (requires auth)',
                'POST /api/doctors': 'Create doctor (admin)',
                'PUT /api/doctors/:id': 'Update doctor (admin)',
                'DELETE /api/doctors/:id': 'Delete doctor (admin)'
            },
            bookings: {
                'POST /api/bookings': 'Create booking (requires auth)',
                'GET /api/bookings/my': 'Get my bookings (requires auth)',
                'GET /api/bookings/:id': 'Get booking by ID (requires auth)',
                'PUT /api/bookings/:id/cancel': 'Cancel booking (requires auth)',
                'GET /api/bookings/collector/assigned': 'Get assigned collections (collector)',
                'PUT /api/bookings/:id/collect': 'Mark as collected (collector)',
                'GET /api/bookings': 'Get all bookings (admin)',
                'PUT /api/bookings/:id/status': 'Update status (admin)',
                'PUT /api/bookings/:id/assign': 'Assign collector (admin)',
                'PUT /api/bookings/:id/report': 'Upload report (admin)'
            },
            admin: {
                'GET /api/admin/dashboard': 'Get dashboard stats',
                'GET /api/admin/users': 'Get all users',
                'GET /api/admin/collectors': 'Get all collectors',
                'POST /api/admin/collectors': 'Create collector',
                'PUT /api/admin/users/:id/status': 'Update user status',
                'DELETE /api/admin/users/:id': 'Delete user',
                'GET /api/admin/messages': 'Get contact messages'
            },
            payments: {
                'POST /api/payments/create-order': 'Create Razorpay order (requires auth)',
                'POST /api/payments/verify': 'Verify payment signature (requires auth)',
                'GET /api/payments/status/:bookingId': 'Get payment status (requires auth)',
                'POST /api/payments/webhook': 'Razorpay webhook handler',
                'POST /api/payments/refund': 'Initiate refund (admin only)'
            },
            notifications: {
                'GET /api/notifications': 'Get notification history (admin)',
                'POST /api/notifications/:id/resend': 'Resend notification (admin)'
            },
            contact: {
                'POST /api/contact': 'Submit contact message'
            }
        }
    });
});

// Serve frontend static files (after API routes)
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for frontend routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Start server first so Railway healthcheck passes
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
========================================
   Test My Blood API Server
========================================
   Server running on port ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
========================================
        `);
    });

    // Test database connection with retries
    let dbConnected = false;
    for (let i = 1; i <= 5; i++) {
        dbConnected = await testConnection();
        if (dbConnected) break;
        console.log(`Database connection attempt ${i}/5 failed. Retrying in 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!dbConnected) {
        console.error('Database connection failed. API routes will return errors.');
    } else {
        // Auto-initialize database tables on startup
        console.log('Initializing database tables...');
        try {
            await initDatabase();
            console.log('Database initialized successfully!');
        } catch (err) {
            console.error('Database initialization error:', err.message);
        }
    }
};

startServer();
