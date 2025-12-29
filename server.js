require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const validator = require('validator');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet());
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:8080',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));

// ===== DATABASE CONNECTION =====
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'businessform_db',
});

// Test database connection
pool.on('connect', () => {
    console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('✗ Unexpected error on idle client', err);
    process.exit(-1);
});

// ===== VALIDATION HELPERS =====
const validateSubmission = (data) => {
    const errors = [];

    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
        errors.push('First name is required and must be a non-empty string');
    }

    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
        errors.push('Last name is required and must be a non-empty string');
    }

    if (!data.email || !validator.isEmail(data.email)) {
        errors.push('Valid email address is required');
    }

    if (!data.phone || !validator.isMobilePhone(data.phone, 'any', { strictMode: false })) {
        errors.push('Valid phone number is required');
    }

    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
        errors.push('Street address is required');
    }

    if (!data.postalCode || typeof data.postalCode !== 'string' || data.postalCode.trim().length === 0) {
        errors.push('Postal code is required');
    }

    if (!data.businessIdea || typeof data.businessIdea !== 'string' || data.businessIdea.trim().length < 5) {
        errors.push('Business idea must be at least 5 characters long');
    }

    if (!data.requirements || typeof data.requirements !== 'string' || data.requirements.trim().length < 10) {
        errors.push('Detailed requirements must be at least 10 characters long');
    }

    return errors;
};

// ===== ROUTES =====

/**
 * Health Check Endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: result.rows[0].now
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Database connection failed'
        });
    }
});

/**
 * Submit Business Idea
 * POST /api/submit
 */
app.post('/api/submit', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, postalCode, businessIdea, requirements } = req.body;

        // Validate input
        const validationErrors = validateSubmission(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            firstName: validator.trim(validator.escape(firstName)),
            lastName: validator.trim(validator.escape(lastName)),
            email: validator.normalizeEmail(email),
            phone: validator.trim(phone),
            address: validator.trim(validator.escape(address)),
            postalCode: validator.trim(validator.escape(postalCode)),
            businessIdea: validator.trim(validator.escape(businessIdea)),
            requirements: validator.trim(validator.escape(requirements)),
        };

        // Insert into database
        const query = `
            INSERT INTO submissions 
            (first_name, last_name, email, phone, address, postal_code, business_idea, requirements, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id, created_at;
        `;

        const result = await pool.query(query, [
            sanitizedData.firstName,
            sanitizedData.lastName,
            sanitizedData.email,
            sanitizedData.phone,
            sanitizedData.address,
            sanitizedData.postalCode,
            sanitizedData.businessIdea,
            sanitizedData.requirements,
        ]);

        res.status(201).json({
            success: true,
            message: 'Submission received successfully!',
            data: {
                id: result.rows[0].id,
                createdAt: result.rows[0].created_at,
                ...sanitizedData
            }
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process submission',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get All Submissions (Admin Endpoint)
 * GET /api/submissions
 */
app.get('/api/submissions', async (req, res) => {
    try {
        const { limit = 20, offset = 0, sortBy = 'created_at', order = 'DESC' } = req.query;

        // Validate sort parameters
        const validSortFields = ['id', 'created_at', 'first_name', 'email'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        const query = `
            SELECT * FROM submissions
            ORDER BY ${sortField} ${sortOrder}
            LIMIT $1 OFFSET $2;
        `;

        const countQuery = 'SELECT COUNT(*) as total FROM submissions;';

        const [result, countResult] = await Promise.all([
            pool.query(query, [parseInt(limit), parseInt(offset)]),
            pool.query(countQuery)
        ]);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: countResult.rows[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
            }
        });

    } catch (error) {
        console.error('Fetch submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions'
        });
    }
});

/**
 * Get Single Submission by ID
 * GET /api/submissions/:id
 */
app.get('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM submissions WHERE id = $1;';
        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Fetch submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission'
        });
    }
});

/**
 * Update Submission by ID
 * PUT /api/submissions/:id
 */
app.put('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, address, postalCode, businessIdea, requirements } = req.body;

        // Check if submission exists
        const existsQuery = 'SELECT id FROM submissions WHERE id = $1;';
        const existsResult = await pool.query(existsQuery, [parseInt(id)]);

        if (existsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (firstName !== undefined) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(validator.escape(firstName));
        }
        if (lastName !== undefined) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(validator.escape(lastName));
        }
        if (email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(validator.normalizeEmail(email));
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(validator.escape(address));
        }
        if (postalCode !== undefined) {
            updates.push(`postal_code = $${paramCount++}`);
            values.push(validator.escape(postalCode));
        }
        if (businessIdea !== undefined) {
            updates.push(`business_idea = $${paramCount++}`);
            values.push(validator.escape(businessIdea));
        }
        if (requirements !== undefined) {
            updates.push(`requirements = $${paramCount++}`);
            values.push(validator.escape(requirements));
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(parseInt(id));

        const query = `
            UPDATE submissions 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            message: 'Submission updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update submission'
        });
    }
});

/**
 * Delete Submission by ID
 * DELETE /api/submissions/:id
 */
app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM submissions WHERE id = $1 RETURNING id;';
        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Submission deleted successfully',
            deletedId: result.rows[0].id
        });

    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete submission'
        });
    }
});

/**
 * Get Statistics/Dashboard Data
 * GET /api/statistics
 */
app.get('/api/statistics', async (req, res) => {
    try {
        const totalQuery = 'SELECT COUNT(*) as total FROM submissions;';
        const recentQuery = `
            SELECT COUNT(*) as recent FROM submissions 
            WHERE created_at >= NOW() - INTERVAL '7 days';
        `;
        const averageQuery = `
            SELECT 
                MIN(created_at) as first_submission,
                MAX(created_at) as last_submission,
                COUNT(*) as total
            FROM submissions;
        `;

        const [total, recent, stats] = await Promise.all([
            pool.query(totalQuery),
            pool.query(recentQuery),
            pool.query(averageQuery)
        ]);

        res.status(200).json({
            success: true,
            statistics: {
                totalSubmissions: total.rows[0].total,
                recentSubmissions: recent.rows[0].recent,
                firstSubmission: stats.rows[0].first_submission,
                lastSubmission: stats.rows[0].last_submission
            }
        });

    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// ===== ERROR HANDLING =====

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ===== START SERVER =====
const server = app.listen(port, () => {
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`📊 API Documentation:`);
    console.log(`   - Health Check: GET /api/health`);
    console.log(`   - Submit Idea: POST /api/submit`);
    console.log(`   - Get All: GET /api/submissions`);
    console.log(`   - Get One: GET /api/submissions/:id`);
    console.log(`   - Update: PUT /api/submissions/:id`);
    console.log(`   - Delete: DELETE /api/submissions/:id`);
    console.log(`   - Stats: GET /api/statistics\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

module.exports = app;
