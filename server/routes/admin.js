const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { dbHelpers } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all listings for admin
router.get('/listings', [
    query('page').optional().isInt({ min: 1 }).withMessage('شماره صفحه نامعتبر است'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('تعداد آیتم نامعتبر است'),
    query('type').optional().isIn(['rent', 'sale']).withMessage('نوع آگهی نامعتبر است'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('وضعیت نامعتبر است')
], authenticateAdmin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'پارامترهای جستجو نامعتبر است',
                errors: errors.array()
            });
        }

        const {
            page = 1,
            limit = 20,
            type,
            status,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];

        if (type) {
            whereConditions.push('l.type = ?');
            queryParams.push(type);
        }

        if (status === 'active') {
            whereConditions.push('l.is_active = 1');
        } else if (status === 'inactive') {
            whereConditions.push('l.is_active = 0');
        }

        if (search) {
            whereConditions.push('(l.title LIKE ? OR l.description LIKE ? OR u.name LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get listings
        const listings = await dbHelpers.all(`
            SELECT 
                l.*,
                c.name as category_name,
                u.name as user_name,
                u.phone as user_phone,
                COUNT(v.id) as total_views
            FROM listings l
            LEFT JOIN categories c ON l.category_id = c.id
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN listing_views v ON l.id = v.listing_id
            ${whereClause}
            GROUP BY l.id
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // Get total count
        const countResult = await dbHelpers.get(`
            SELECT COUNT(*) as total
            FROM listings l
            LEFT JOIN users u ON l.user_id = u.id
            ${whereClause}
        `, queryParams);

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Admin get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get single listing for admin
router.get('/listings/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await dbHelpers.get(`
            SELECT 
                l.*,
                c.name as category_name,
                u.name as user_name,
                u.phone as user_phone,
                u.email as user_email
            FROM listings l
            LEFT JOIN categories c ON l.category_id = c.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.id = ?
        `, [id]);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        // Get view statistics
        const viewStats = await dbHelpers.all(`
            SELECT 
                DATE(viewed_at) as date,
                COUNT(*) as views,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT ip_address) as unique_ips
            FROM listing_views 
            WHERE listing_id = ?
            GROUP BY DATE(viewed_at)
            ORDER BY date DESC
            LIMIT 30
        `, [id]);

        res.json({
            success: true,
            data: {
                listing,
                view_stats: viewStats
            }
        });

    } catch (error) {
        console.error('Admin get listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Update listing status
router.patch('/listings/:id/status', [
    body('is_active').isBoolean().withMessage('وضعیت فعال بودن نامعتبر است'),
    body('is_featured').optional().isBoolean().withMessage('وضعیت ویژه بودن نامعتبر است')
], authenticateAdmin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { is_active, is_featured } = req.body;

        // Check if listing exists
        const listing = await dbHelpers.get(
            'SELECT id FROM listings WHERE id = ?',
            [id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        const updateFields = [];
        const updateValues = [];

        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        if (is_featured !== undefined) {
            updateFields.push('is_featured = ?');
            updateValues.push(is_featured);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است'
            });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        await dbHelpers.run(
            `UPDATE listings SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        const updatedListing = await dbHelpers.get(
            'SELECT * FROM listings WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'وضعیت آگهی به‌روزرسانی شد',
            data: { listing: updatedListing }
        });

    } catch (error) {
        console.error('Admin update listing status error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Delete listing (admin)
router.delete('/listings/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if listing exists
        const listing = await dbHelpers.get(
            'SELECT id FROM listings WHERE id = ?',
            [id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        // Soft delete
        await dbHelpers.run(
            'UPDATE listings SET is_active = 0 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'آگهی حذف شد'
        });

    } catch (error) {
        console.error('Admin delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        // Get basic stats
        const [
            totalListings,
            activeListings,
            totalUsers,
            totalViews,
            recentListings,
            topCategories
        ] = await Promise.all([
            dbHelpers.get('SELECT COUNT(*) as count FROM listings'),
            dbHelpers.get('SELECT COUNT(*) as count FROM listings WHERE is_active = 1'),
            dbHelpers.get('SELECT COUNT(*) as count FROM users'),
            dbHelpers.get('SELECT COUNT(*) as count FROM listing_views'),
            dbHelpers.all(`
                SELECT l.*, u.name as user_name, c.name as category_name
                FROM listings l
                LEFT JOIN users u ON l.user_id = u.id
                LEFT JOIN categories c ON l.category_id = c.id
                ORDER BY l.created_at DESC
                LIMIT 5
            `),
            dbHelpers.all(`
                SELECT c.name, COUNT(l.id) as count
                FROM categories c
                LEFT JOIN listings l ON c.id = l.category_id AND l.is_active = 1
                GROUP BY c.id, c.name
                ORDER BY count DESC
                LIMIT 5
            `)
        ]);

        // Get daily stats for last 30 days
        const dailyStats = await dbHelpers.all(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as listings,
                SUM(view_count) as views
            FROM listings
            WHERE created_at >= date('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        res.json({
            success: true,
            data: {
                stats: {
                    total_listings: totalListings.count,
                    active_listings: activeListings.count,
                    total_users: totalUsers.count,
                    total_views: totalViews.count
                },
                recent_listings: recentListings,
                top_categories: topCategories,
                daily_stats: dailyStats
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get all users
router.get('/users', [
    query('page').optional().isInt({ min: 1 }).withMessage('شماره صفحه نامعتبر است'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('تعداد آیتم نامعتبر است')
], authenticateAdmin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'پارامترهای جستجو نامعتبر است',
                errors: errors.array()
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const users = await dbHelpers.all(`
            SELECT 
                u.*,
                COUNT(l.id) as listings_count,
                COUNT(f.id) as favorites_count
            FROM users u
            LEFT JOIN listings l ON u.id = l.user_id AND l.is_active = 1
            LEFT JOIN user_favorites f ON u.id = f.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);

        const countResult = await dbHelpers.get('SELECT COUNT(*) as total FROM users');
        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

module.exports = router;
