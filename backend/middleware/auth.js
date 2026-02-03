const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const users = await query('SELECT * FROM users WHERE id = ? AND is_active = TRUE', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive.'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.user_type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

// Check if user is collector
const isCollector = (req, res, next) => {
    if (req.user.user_type !== 'collector') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Collector only.'
        });
    }
    next();
};

// Check if user is patient
const isPatient = (req, res, next) => {
    if (req.user.user_type !== 'patient') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Patient only.'
        });
    }
    next();
};

// Check if admin or collector
const isAdminOrCollector = (req, res, next) => {
    if (req.user.user_type !== 'admin' && req.user.user_type !== 'collector') {
        return res.status(403).json({
            success: false,
            message: 'Access denied.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isCollector,
    isPatient,
    isAdminOrCollector
};
