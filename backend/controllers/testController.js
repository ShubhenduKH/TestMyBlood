const { query } = require('../config/database');

// Get all tests
exports.getAllTests = async (req, res) => {
    try {
        const { category, lab_id, search, sort } = req.query;

        let sql = `
            SELECT t.*, l.name as lab_name
            FROM tests t
            LEFT JOIN labs l ON t.lab_id = l.id
            WHERE t.is_active = TRUE
        `;
        const params = [];

        if (category) {
            sql += ' AND t.category = ?';
            params.push(category);
        }

        if (lab_id) {
            sql += ' AND t.lab_id = ?';
            params.push(lab_id);
        }

        if (search) {
            sql += ' AND (t.name LIKE ? OR t.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Sorting
        if (sort === 'price-low') {
            sql += ' ORDER BY t.price ASC';
        } else if (sort === 'price-high') {
            sql += ' ORDER BY t.price DESC';
        } else {
            sql += ' ORDER BY t.name ASC';
        }

        const tests = await query(sql, params);

        res.json({
            success: true,
            count: tests.length,
            data: tests
        });
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get test by ID
exports.getTestById = async (req, res) => {
    try {
        const tests = await query(`
            SELECT t.*, l.name as lab_name
            FROM tests t
            LEFT JOIN labs l ON t.lab_id = l.id
            WHERE t.id = ?
        `, [req.params.id]);

        if (tests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        res.json({
            success: true,
            data: tests[0]
        });
    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create test (Admin only)
exports.createTest = async (req, res) => {
    try {
        const { name, description, price, original_price, category, lab_id, report_time, fasting_required } = req.body;

        const result = await query(
            `INSERT INTO tests (name, description, price, original_price, category, lab_id, report_time, fasting_required)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, price, original_price || price, category, lab_id, report_time || '24 hrs', fasting_required || false]
        );

        const tests = await query('SELECT * FROM tests WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: tests[0]
        });
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update test (Admin only)
exports.updateTest = async (req, res) => {
    try {
        const { name, description, price, original_price, category, lab_id, report_time, fasting_required, is_active } = req.body;

        await query(
            `UPDATE tests SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                original_price = COALESCE(?, original_price),
                category = COALESCE(?, category),
                lab_id = COALESCE(?, lab_id),
                report_time = COALESCE(?, report_time),
                fasting_required = COALESCE(?, fasting_required),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [name, description, price, original_price, category, lab_id, report_time, fasting_required, is_active, req.params.id]
        );

        const tests = await query('SELECT * FROM tests WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Test updated successfully',
            data: tests[0]
        });
    } catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete test (Admin only)
exports.deleteTest = async (req, res) => {
    try {
        await query('UPDATE tests SET is_active = FALSE WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Test deleted successfully'
        });
    } catch (error) {
        console.error('Delete test error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get test categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await query('SELECT DISTINCT category FROM tests WHERE is_active = TRUE ORDER BY category');

        res.json({
            success: true,
            data: categories.map(c => c.category)
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
