// ========================================
// Email Configuration (Nodemailer + Gmail SMTP)
// ========================================

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection configuration
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email server connection verified');
        return true;
    } catch (error) {
        console.error('Email server connection failed:', error.message);
        return false;
    }
};

// Send email helper
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"DoorToTest" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '')
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    transporter,
    verifyConnection,
    sendEmail
};
