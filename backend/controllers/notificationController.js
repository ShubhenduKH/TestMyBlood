// ========================================
// Notification Controller - Email Notifications
// ========================================

const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../config/email');
const { query } = require('../config/database');

// Load email template
function loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    try {
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`Failed to load template ${templateName}:`, error);
        return null;
    }
}

// Replace placeholders in template
function replacePlaceholders(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value || '');
    }
    // Remove any unreplaced conditional blocks
    result = result.replace(/{{#if.*?}}[\s\S]*?{{\/if}}/g, '');
    return result;
}

// Format date for display
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Log notification to database
async function logNotification(userId, bookingId, type, template, recipient, subject, status, errorMessage = null) {
    try {
        await query(
            `INSERT INTO notifications (user_id, booking_id, type, template, recipient, subject, status, error_message, sent_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${status === 'sent' ? 'NOW()' : 'NULL'})`,
            [userId, bookingId, type, template, recipient, subject, status, errorMessage]
        );
    } catch (error) {
        console.error('Failed to log notification:', error);
    }
}

// Generate tests HTML for email
function generateTestsHtml(tests) {
    if (!tests || tests.length === 0) return '<li>No tests</li>';
    return tests.map(test =>
        `<li><span>${test.test_name || test.name}</span><span style="float: right;">&#8377;${test.test_price || test.price}</span></li>`
    ).join('');
}

// Get dashboard URL
function getDashboardUrl() {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/pages/patient/dashboard.html`;
}

// Send booking confirmation email
async function sendBookingConfirmation(user, booking) {
    try {
        const template = loadTemplate('booking-confirmed');
        if (!template) throw new Error('Template not found');

        const testsHtml = generateTestsHtml(booking.tests);
        const address = [
            booking.address_line1,
            booking.address_line2,
            `${booking.city} - ${booking.pincode}`
        ].filter(Boolean).join(', ');

        const data = {
            patientName: booking.patient_name || user.name,
            bookingId: booking.booking_id,
            bookingDate: formatDate(booking.booking_date),
            timeSlot: booking.time_slot,
            address: address,
            phone: booking.phone,
            testsHtml: testsHtml,
            totalAmount: booking.total_amount,
            dashboardUrl: getDashboardUrl()
        };

        const html = replacePlaceholders(template, data);
        const subject = `Booking Confirmed - ${booking.booking_id} | DoorToTest`;

        const result = await sendEmail({
            to: user.email,
            subject: subject,
            html: html
        });

        await logNotification(
            user.id,
            booking.id,
            'email',
            'booking-confirmed',
            user.email,
            subject,
            result.success ? 'sent' : 'failed',
            result.error
        );

        return result;
    } catch (error) {
        console.error('Send booking confirmation error:', error);
        return { success: false, error: error.message };
    }
}

// Send collector assigned notification
async function sendCollectorAssigned(user, booking, collector) {
    try {
        const template = loadTemplate('collector-assigned');
        if (!template) throw new Error('Template not found');

        const address = [
            booking.address_line1,
            booking.address_line2,
            `${booking.city} - ${booking.pincode}`
        ].filter(Boolean).join(', ');

        const data = {
            patientName: booking.patient_name || user.name,
            bookingId: booking.booking_id,
            bookingDate: formatDate(booking.booking_date),
            timeSlot: booking.time_slot,
            address: address,
            collectorName: collector.name,
            collectorPhone: collector.phone,
            collectorArea: collector.area || 'Your Area',
            dashboardUrl: getDashboardUrl()
        };

        const html = replacePlaceholders(template, data);
        const subject = `Phlebotomist Assigned - ${booking.booking_id} | DoorToTest`;

        const result = await sendEmail({
            to: user.email,
            subject: subject,
            html: html
        });

        await logNotification(
            user.id,
            booking.id,
            'email',
            'collector-assigned',
            user.email,
            subject,
            result.success ? 'sent' : 'failed',
            result.error
        );

        return result;
    } catch (error) {
        console.error('Send collector assigned error:', error);
        return { success: false, error: error.message };
    }
}

// Send sample collected notification
async function sendSampleCollected(user, booking) {
    try {
        const template = loadTemplate('sample-collected');
        if (!template) throw new Error('Template not found');

        const data = {
            patientName: booking.patient_name || user.name,
            bookingId: booking.booking_id,
            collectedAt: formatDateTime(booking.collected_at || new Date()),
            dashboardUrl: getDashboardUrl()
        };

        const html = replacePlaceholders(template, data);
        const subject = `Sample Collected - ${booking.booking_id} | DoorToTest`;

        const result = await sendEmail({
            to: user.email,
            subject: subject,
            html: html
        });

        await logNotification(
            user.id,
            booking.id,
            'email',
            'sample-collected',
            user.email,
            subject,
            result.success ? 'sent' : 'failed',
            result.error
        );

        return result;
    } catch (error) {
        console.error('Send sample collected error:', error);
        return { success: false, error: error.message };
    }
}

// Send report ready notification
async function sendReportReady(user, booking) {
    try {
        const template = loadTemplate('report-ready');
        if (!template) throw new Error('Template not found');

        // Get tests for this booking
        const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
        const testsHtml = generateTestsHtml(tests);

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const reportUrl = booking.report_file
            ? `${process.env.API_URL || 'http://localhost:5000'}/uploads/reports/${booking.report_file}`
            : booking.report_url || getDashboardUrl();

        const data = {
            patientName: booking.patient_name || user.name,
            bookingId: booking.booking_id,
            completedAt: formatDateTime(booking.completed_at || new Date()),
            testsHtml: testsHtml,
            reportUrl: reportUrl,
            reportNotes: booking.report_notes || '',
            dashboardUrl: getDashboardUrl(),
            doctorsUrl: `${baseUrl}/pages/public/doctors.html`
        };

        let html = replacePlaceholders(template, data);

        // Handle conditional notes block
        if (booking.report_notes) {
            html = html.replace(/{{#if reportNotes}}([\s\S]*?){{\/if}}/g, '$1');
        }

        const subject = `Your Report is Ready - ${booking.booking_id} | DoorToTest`;

        const result = await sendEmail({
            to: user.email,
            subject: subject,
            html: html
        });

        await logNotification(
            user.id,
            booking.id,
            'email',
            'report-ready',
            user.email,
            subject,
            result.success ? 'sent' : 'failed',
            result.error
        );

        return result;
    } catch (error) {
        console.error('Send report ready error:', error);
        return { success: false, error: error.message };
    }
}

// Get notification history (Admin)
async function getNotificationHistory(req, res) {
    try {
        const { user_id, booking_id, status, limit = 50 } = req.query;

        let sql = `
            SELECT n.*, u.name as user_name, u.email as user_email, b.booking_id
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            LEFT JOIN bookings b ON n.booking_id = b.id
            WHERE 1=1
        `;
        const params = [];

        if (user_id) {
            sql += ' AND n.user_id = ?';
            params.push(user_id);
        }

        if (booking_id) {
            sql += ' AND b.booking_id = ?';
            params.push(booking_id);
        }

        if (status) {
            sql += ' AND n.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY n.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const notifications = await query(sql, params);

        res.json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error('Get notification history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

// Resend notification (Admin)
async function resendNotification(req, res) {
    try {
        const { notification_id } = req.params;

        const notifications = await query('SELECT * FROM notifications WHERE id = ?', [notification_id]);

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const notification = notifications[0];

        // Get user and booking
        const users = await query('SELECT * FROM users WHERE id = ?', [notification.user_id]);
        const bookings = await query('SELECT * FROM bookings WHERE id = ?', [notification.booking_id]);

        if (users.length === 0 || bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User or booking not found'
            });
        }

        const user = users[0];
        const booking = bookings[0];

        let result;
        switch (notification.template) {
            case 'booking-confirmed':
                const tests = await query('SELECT * FROM booking_tests WHERE booking_id = ?', [booking.id]);
                result = await sendBookingConfirmation(user, { ...booking, tests });
                break;
            case 'collector-assigned':
                const collectors = await query('SELECT * FROM users WHERE id = ?', [booking.collector_id]);
                result = await sendCollectorAssigned(user, booking, collectors[0] || {});
                break;
            case 'sample-collected':
                result = await sendSampleCollected(user, booking);
                break;
            case 'report-ready':
                result = await sendReportReady(user, booking);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Unknown notification template'
                });
        }

        res.json({
            success: result.success,
            message: result.success ? 'Notification resent successfully' : 'Failed to resend notification',
            error: result.error
        });
    } catch (error) {
        console.error('Resend notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

module.exports = {
    sendBookingConfirmation,
    sendCollectorAssigned,
    sendSampleCollected,
    sendReportReady,
    getNotificationHistory,
    resendNotification
};
