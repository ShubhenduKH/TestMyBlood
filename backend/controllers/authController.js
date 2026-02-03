const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, user_type = 'patient' } = req.body;

        // Check if email exists
        const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            'INSERT INTO users (name, email, password, phone, user_type) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, user_type]
        );

        // Get created user
        const users = await query('SELECT id, name, email, phone, user_type, created_at FROM users WHERE id = ?', [result.insertId]);
        const user = users[0];

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user, token }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, user_type } = req.body;

        // Find user
        let sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
        const params = [email];

        if (user_type) {
            sql += ' AND user_type = ?';
            params.push(user_type);
        }

        const users = await query(sql, params);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Remove password from response
        delete user.password;

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: { user, token }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const users = await query(
            'SELECT id, name, email, phone, user_type, gender, dob, blood_group, profile_image, address_line1, address_line2, city, state, pincode, area, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, dob, blood_group, address_line1, address_line2, city, state, pincode } = req.body;

        // Convert undefined to null for MySQL
        const toNull = (val) => val === undefined ? null : val;

        await query(
            `UPDATE users SET
                name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                gender = COALESCE(?, gender),
                dob = COALESCE(?, dob),
                blood_group = COALESCE(?, blood_group),
                address_line1 = COALESCE(?, address_line1),
                address_line2 = COALESCE(?, address_line2),
                city = COALESCE(?, city),
                state = COALESCE(?, state),
                pincode = COALESCE(?, pincode)
            WHERE id = ?`,
            [toNull(name), toNull(phone), toNull(gender), toNull(dob), toNull(blood_group), toNull(address_line1), toNull(address_line2), toNull(city), toNull(state), toNull(pincode), req.user.id]
        );

        const users = await query(
            'SELECT id, name, email, phone, user_type, gender, dob, blood_group, address_line1, address_line2, city, state, pincode FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get current user with password
        const users = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
