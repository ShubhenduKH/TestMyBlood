const { query } = require('../config/database');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const { search, specialty, sort } = req.query;

        let sql = 'SELECT * FROM doctors WHERE is_active = TRUE';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR specialty LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (specialty) {
            sql += ' AND specialty = ?';
            params.push(specialty);
        }

        // Sorting
        if (sort === 'experience') {
            sql += ' ORDER BY experience DESC';
        } else if (sort === 'fee') {
            sql += ' ORDER BY fee ASC';
        } else {
            sql += ' ORDER BY name ASC';
        }

        const doctors = await query(sql, params);

        // Parse available_days
        const formattedDoctors = doctors.map(doc => ({
            ...doc,
            available: doc.available_days ? doc.available_days.split(',') : []
        }));

        res.json({
            success: true,
            count: doctors.length,
            data: formattedDoctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctors = await query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const doctor = {
            ...doctors[0],
            available: doctors[0].available_days ? doctors[0].available_days.split(',') : []
        };

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create doctor (Admin only)
exports.createDoctor = async (req, res) => {
    try {
        const { name, specialty, qualification, experience, fee, image, available_days } = req.body;

        const availableDaysStr = Array.isArray(available_days) ? available_days.join(',') : available_days;

        const result = await query(
            `INSERT INTO doctors (name, specialty, qualification, experience, fee, image, available_days)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, specialty, qualification, experience || 0, fee || 500, image, availableDaysStr]
        );

        const doctors = await query('SELECT * FROM doctors WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: doctors[0]
        });
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update doctor (Admin only)
exports.updateDoctor = async (req, res) => {
    try {
        const { name, specialty, qualification, experience, fee, image, available_days, is_active } = req.body;

        const availableDaysStr = Array.isArray(available_days) ? available_days.join(',') : available_days;

        await query(
            `UPDATE doctors SET
                name = COALESCE(?, name),
                specialty = COALESCE(?, specialty),
                qualification = COALESCE(?, qualification),
                experience = COALESCE(?, experience),
                fee = COALESCE(?, fee),
                image = COALESCE(?, image),
                available_days = COALESCE(?, available_days),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [name, specialty, qualification, experience, fee, image, availableDaysStr, is_active, req.params.id]
        );

        const doctors = await query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctors[0]
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete doctor (Admin only)
exports.deleteDoctor = async (req, res) => {
    try {
        await query('UPDATE doctors SET is_active = FALSE WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get specialties
exports.getSpecialties = async (req, res) => {
    try {
        const specialties = await query('SELECT DISTINCT specialty FROM doctors WHERE is_active = TRUE ORDER BY specialty');

        res.json({
            success: true,
            data: specialties.map(s => s.specialty)
        });
    } catch (error) {
        console.error('Get specialties error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Book appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, time_slot, reason } = req.body;

        // Get doctor details
        const doctors = await query('SELECT * FROM doctors WHERE id = ?', [doctor_id]);
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const appointmentId = 'APT' + Date.now();

        const result = await query(
            `INSERT INTO doctor_appointments (appointment_id, user_id, doctor_id, appointment_date, time_slot, reason, fee)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [appointmentId, req.user.id, doctor_id, appointment_date, time_slot, reason, doctors[0].fee]
        );

        const appointments = await query(`
            SELECT da.*, d.name as doctor_name, d.specialty
            FROM doctor_appointments da
            JOIN doctors d ON da.doctor_id = d.id
            WHERE da.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointments[0]
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get user appointments
exports.getUserAppointments = async (req, res) => {
    try {
        const appointments = await query(`
            SELECT da.*, d.name as doctor_name, d.specialty, d.image as doctor_image
            FROM doctor_appointments da
            JOIN doctors d ON da.doctor_id = d.id
            WHERE da.user_id = ?
            ORDER BY da.appointment_date DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
