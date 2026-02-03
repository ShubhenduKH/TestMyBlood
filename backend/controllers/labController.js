const { query } = require('../config/database');

// Get all labs
exports.getAllLabs = async (req, res) => {
    try {
        const { search, accreditation, sort } = req.query;

        let sql = 'SELECT * FROM labs WHERE is_active = TRUE';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR address LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (accreditation) {
            sql += ' AND accreditation LIKE ?';
            params.push(`%${accreditation}%`);
        }

        // Sorting
        if (sort === 'rating') {
            sql += ' ORDER BY rating DESC';
        } else if (sort === 'tests') {
            sql += ' ORDER BY tests_count DESC';
        } else {
            sql += ' ORDER BY name ASC';
        }

        const labs = await query(sql, params);

        res.json({
            success: true,
            count: labs.length,
            data: labs
        });
    } catch (error) {
        console.error('Get labs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get lab by ID
exports.getLabById = async (req, res) => {
    try {
        const labs = await query('SELECT * FROM labs WHERE id = ?', [req.params.id]);

        if (labs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Get tests for this lab
        const tests = await query('SELECT * FROM tests WHERE lab_id = ? AND is_active = TRUE', [req.params.id]);

        res.json({
            success: true,
            data: { ...labs[0], tests }
        });
    } catch (error) {
        console.error('Get lab error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create lab (Admin only)
exports.createLab = async (req, res) => {
    try {
        const { name, accreditation, rating, address, phone, email, tests_count, image } = req.body;

        const result = await query(
            `INSERT INTO labs (name, accreditation, rating, address, phone, email, tests_count, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, accreditation, rating || 4.0, address, phone, email, tests_count || 0, image]
        );

        const labs = await query('SELECT * FROM labs WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Lab created successfully',
            data: labs[0]
        });
    } catch (error) {
        console.error('Create lab error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update lab (Admin only)
exports.updateLab = async (req, res) => {
    try {
        const { name, accreditation, rating, address, phone, email, tests_count, image, is_active } = req.body;

        await query(
            `UPDATE labs SET
                name = COALESCE(?, name),
                accreditation = COALESCE(?, accreditation),
                rating = COALESCE(?, rating),
                address = COALESCE(?, address),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                tests_count = COALESCE(?, tests_count),
                image = COALESCE(?, image),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [name, accreditation, rating, address, phone, email, tests_count, image, is_active, req.params.id]
        );

        const labs = await query('SELECT * FROM labs WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Lab updated successfully',
            data: labs[0]
        });
    } catch (error) {
        console.error('Update lab error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete lab (Admin only)
exports.deleteLab = async (req, res) => {
    try {
        await query('UPDATE labs SET is_active = FALSE WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Lab deleted successfully'
        });
    } catch (error) {
        console.error('Delete lab error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
