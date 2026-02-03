const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
    sendBookingConfirmation,
    sendCollectorAssigned,
    sendSampleCollected,
    sendReportReady
} = require('./notificationController');

// Configure multer for report file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/reports');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `report-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only PDF and images
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

exports.uploadMiddleware = upload.single('report');

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const {
            tests, // Array of test IDs
            booking_date,
            time_slot,
            patient_name,
            phone,
            address_line1,
            address_line2,
            city,
            pincode
        } = req.body;

        // Generate booking ID
        const bookingId = 'BK' + Date.now();

        // Calculate total
        let totalAmount = 0;
        const testDetails = [];

        for (const testId of tests) {
            const testResults = await query(`
                SELECT t.*, l.name as lab_name
                FROM tests t
                LEFT JOIN labs l ON t.lab_id = l.id
                WHERE t.id = ?
            `, [testId]);

            if (testResults.length > 0) {
                const test = testResults[0];
                totalAmount += parseFloat(test.price);
                testDetails.push({
                    id: test.id,
                    name: test.name,
                    price: test.price,
                    lab_name: test.lab_name
                });
            }
        }

        // Insert booking
        const result = await query(
            `INSERT INTO bookings (booking_id, user_id, patient_name, phone, address_line1, address_line2, city, pincode, booking_date, time_slot, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bookingId, req.user.id, patient_name, phone, address_line1, address_line2, city, pincode, booking_date, time_slot, totalAmount]
        );

        const bookingDbId = result.insertId;

        // Insert booking tests
        for (const test of testDetails) {
            await query(
                `INSERT INTO booking_tests (booking_id, test_id, test_name, test_price, lab_name)
                 VALUES (?, ?, ?, ?, ?)`,
                [bookingDbId, test.id, test.name, test.price, test.lab_name]
            );
        }

        // Get complete booking
        const bookings = await query('SELECT * FROM bookings WHERE id = ?', [bookingDbId]);
        const booking = bookings[0];

        // Get booking tests
        const bookedTests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [bookingDbId]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { ...booking, tests: bookedTests }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
    try {
        const { status, date } = req.query;

        let sql = 'SELECT * FROM bookings WHERE user_id = ?';
        const params = [req.user.id];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            sql += ' AND booking_date = ?';
            params.push(date);
        }

        sql += ' ORDER BY created_at DESC';

        const bookings = await query(sql, params);

        // Get tests for each booking
        for (let booking of bookings) {
            const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
            booking.tests = tests;
        }

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);

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

        // Get tests
        const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
        booking.tests = tests;

        // Get collector info if assigned
        if (booking.collector_id) {
            const collectors = await query('SELECT id, name, phone, area FROM users WHERE id = ?', [booking.collector_id]);
            booking.collector = collectors[0];
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const { status, date, search, collector_id } = req.query;

        let sql = 'SELECT * FROM bookings WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            sql += ' AND booking_date = ?';
            params.push(date);
        }

        if (search) {
            sql += ' AND (booking_id LIKE ? OR patient_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (collector_id) {
            sql += ' AND collector_id = ?';
            params.push(collector_id);
        }

        sql += ' ORDER BY created_at DESC';

        const bookings = await query(sql, params);

        // Get tests and collector for each booking
        for (let booking of bookings) {
            const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
            booking.tests = tests;

            if (booking.collector_id) {
                const collectors = await query('SELECT id, name, phone FROM users WHERE id = ?', [booking.collector_id]);
                booking.collector = collectors[0];
            }
        }

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update booking status (Admin/Collector)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, collector_id } = req.body;

        let sql = 'UPDATE bookings SET status = ?';
        const params = [status];

        if (collector_id) {
            sql += ', collector_id = ?';
            params.push(collector_id);
        }

        if (status === 'collected') {
            sql += ', collected_at = NOW()';
        }

        if (status === 'completed') {
            sql += ', completed_at = NOW()';
        }

        sql += ' WHERE booking_id = ?';
        params.push(req.params.id);

        await query(sql, params);

        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);
        const booking = bookings[0];

        // Send notification based on status change
        if (status === 'collected') {
            const users = await query('SELECT * FROM users WHERE id = ?', [booking.user_id]);
            if (users.length > 0) {
                try {
                    await sendSampleCollected(users[0], booking);
                } catch (emailError) {
                    console.error('Failed to send sample collected email:', emailError);
                }
            }
        }

        res.json({
            success: true,
            message: 'Booking status updated',
            data: booking
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Assign collector (Admin)
exports.assignCollector = async (req, res) => {
    try {
        const { collector_id } = req.body;

        await query(
            'UPDATE bookings SET collector_id = ?, status = "confirmed" WHERE booking_id = ?',
            [collector_id, req.params.id]
        );

        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);
        const booking = bookings[0];

        // Get user and collector info for notification
        const users = await query('SELECT * FROM users WHERE id = ?', [booking.user_id]);
        const collectors = await query('SELECT * FROM users WHERE id = ?', [collector_id]);

        if (users.length > 0 && collectors.length > 0) {
            // Send notification email
            try {
                await sendCollectorAssigned(users[0], booking, collectors[0]);
            } catch (emailError) {
                console.error('Failed to send collector assigned email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Collector assigned successfully',
            data: booking
        });
    } catch (error) {
        console.error('Assign collector error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Upload report (Admin) - supports both URL and file upload
exports.uploadReport = async (req, res) => {
    try {
        const { report_url, report_notes } = req.body;
        let reportFile = null;

        // If a file was uploaded
        if (req.file) {
            reportFile = req.file.filename;

            // Store file info in reports table
            const bookings = await query('SELECT id FROM bookings WHERE booking_id = ?', [req.params.id]);
            if (bookings.length > 0) {
                await query(
                    `INSERT INTO reports (booking_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        bookings[0].id,
                        req.file.filename,
                        req.file.originalname,
                        req.file.path,
                        req.file.size,
                        req.file.mimetype,
                        req.user.id,
                        report_notes || null
                    ]
                );
            }
        }

        // Update booking with report info
        await query(
            `UPDATE bookings SET
                report_url = ?,
                report_file = ?,
                report_notes = ?,
                status = "completed",
                completed_at = NOW()
             WHERE booking_id = ?`,
            [report_url || null, reportFile, report_notes || null, req.params.id]
        );

        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);
        const booking = bookings[0];

        // Get user info for notification
        const users = await query('SELECT * FROM users WHERE id = ?', [booking.user_id]);

        if (users.length > 0) {
            // Send report ready notification
            try {
                await sendReportReady(users[0], booking);
            } catch (emailError) {
                console.error('Failed to send report ready email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Report uploaded successfully',
            data: booking
        });
    } catch (error) {
        console.error('Upload report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Download report file
exports.downloadReport = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);

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

        if (!booking.report_file) {
            // If no file, redirect to URL if available
            if (booking.report_url) {
                return res.redirect(booking.report_url);
            }
            return res.status(404).json({
                success: false,
                message: 'Report not available'
            });
        }

        const filePath = path.join(__dirname, '../uploads/reports', booking.report_file);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Report file not found'
            });
        }

        // Get original filename from reports table
        const reports = await query('SELECT original_name FROM reports WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1', [booking.id]);
        const fileName = reports.length > 0 ? reports[0].original_name : booking.report_file;

        res.download(filePath, fileName);
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get collector's assigned bookings
exports.getCollectorBookings = async (req, res) => {
    try {
        const { status, date } = req.query;

        let sql = 'SELECT * FROM bookings WHERE collector_id = ?';
        const params = [req.user.id];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            sql += ' AND booking_date = ?';
            params.push(date);
        }

        sql += ' ORDER BY booking_date ASC, time_slot ASC';

        const bookings = await query(sql, params);

        // Get tests for each booking
        for (let booking of bookings) {
            const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
            booking.tests = tests;
        }

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get collector bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookings = await query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);

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

        // Check if can be cancelled
        if (booking.status === 'collected' || booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this booking'
            });
        }

        await query('UPDATE bookings SET status = "cancelled" WHERE booking_id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
