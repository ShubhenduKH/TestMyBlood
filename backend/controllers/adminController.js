const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Get booking stats
        const totalBookings = await query('SELECT COUNT(*) as count FROM bookings');
        const pendingBookings = await query('SELECT COUNT(*) as count FROM bookings WHERE status = "pending"');
        const completedBookings = await query('SELECT COUNT(*) as count FROM bookings WHERE status = "completed"');

        // Get user stats
        const totalPatients = await query('SELECT COUNT(*) as count FROM users WHERE user_type = "patient"');
        const totalCollectors = await query('SELECT COUNT(*) as count FROM users WHERE user_type = "collector"');

        // Get test stats
        const totalTests = await query('SELECT COUNT(*) as count FROM tests WHERE is_active = TRUE');
        const totalLabs = await query('SELECT COUNT(*) as count FROM labs WHERE is_active = TRUE');
        const totalDoctors = await query('SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE');

        // Recent bookings
        const recentBookings = await query(`
            SELECT * FROM bookings
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // Today's revenue
        const todayRevenue = await query(`
            SELECT COALESCE(SUM(total_amount), 0) as revenue
            FROM bookings
            WHERE DATE(created_at) = CURDATE() AND status != "cancelled"
        `);

        res.json({
            success: true,
            data: {
                bookings: {
                    total: totalBookings[0].count,
                    pending: pendingBookings[0].count,
                    completed: completedBookings[0].count
                },
                users: {
                    patients: totalPatients[0].count,
                    collectors: totalCollectors[0].count
                },
                services: {
                    tests: totalTests[0].count,
                    labs: totalLabs[0].count,
                    doctors: totalDoctors[0].count
                },
                todayRevenue: todayRevenue[0].revenue,
                recentBookings
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { user_type, search } = req.query;

        let sql = 'SELECT id, name, email, phone, user_type, area, is_active, created_at FROM users WHERE 1=1';
        const params = [];

        if (user_type) {
            sql += ' AND user_type = ?';
            params.push(user_type);
        }

        if (search) {
            sql += ' AND (name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY created_at DESC';

        const users = await query(sql, params);

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all collectors
exports.getCollectors = async (req, res) => {
    try {
        const collectors = await query(`
            SELECT id, name, email, phone, area, is_active, created_at
            FROM users
            WHERE user_type = 'collector'
            ORDER BY name
        `);

        // Get assigned bookings count for each collector
        for (let collector of collectors) {
            const assignedCount = await query(
                'SELECT COUNT(*) as count FROM bookings WHERE collector_id = ? AND status NOT IN ("completed", "cancelled")',
                [collector.id]
            );
            collector.assigned_count = assignedCount[0].count;
        }

        res.json({
            success: true,
            count: collectors.length,
            data: collectors
        });
    } catch (error) {
        console.error('Get collectors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create collector
exports.createCollector = async (req, res) => {
    try {
        const { name, email, password, phone, area } = req.body;

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

        // Insert collector
        const result = await query(
            'INSERT INTO users (name, email, password, phone, area, user_type, is_verified) VALUES (?, ?, ?, ?, ?, "collector", TRUE)',
            [name, email, hashedPassword, phone, area]
        );

        const collectors = await query(
            'SELECT id, name, email, phone, area, user_type, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Collector created successfully',
            data: collectors[0]
        });
    } catch (error) {
        console.error('Create collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { is_active } = req.body;

        await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);

        res.json({
            success: true,
            message: 'User status updated'
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        // Don't allow deleting admin
        const users = await query('SELECT user_type FROM users WHERE id = ?', [req.params.id]);
        if (users.length > 0 && users[0].user_type === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin user'
            });
        }

        await query('DELETE FROM users WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get contact messages
exports.getContactMessages = async (req, res) => {
    try {
        const messages = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Submit contact message (Public)
exports.submitContactMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        await query(
            'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, subject, message]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Submit message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
