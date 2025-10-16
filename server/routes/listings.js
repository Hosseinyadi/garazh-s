const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { dbHelpers } = require('../config/database');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all listings with filters
router.get('/', [
    query('type').optional().isIn(['rent', 'sale']).withMessage('نوع آگهی نامعتبر است'),
    query('ad_type').optional().isInt().withMessage('نوع آگهی نامعتبر است'),
    query('category').optional().isInt().withMessage('دسته‌بندی نامعتبر است'),
    query('category_type').optional().isIn(['equipment', 'parts', 'services']).withMessage('نوع دسته‌بندی نامعتبر است'),
    query('tags').optional().isLength({ min: 1, max: 200 }).withMessage('برچسب‌ها نامعتبر است'),
    query('page').optional().isInt({ min: 1 }).withMessage('شماره صفحه نامعتبر است'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('تعداد آیتم نامعتبر است'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('جستجو نامعتبر است')
], optionalAuth, async (req, res) => {
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
            type = 'sale',
            ad_type,
            category,
            category_type,
            tags,
            page = 1,
            limit = 20,
            search,
            min_price,
            max_price,
            location
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['l.is_active = 1'];
        let queryParams = [];

        if (type) {
            whereConditions.push('l.type = ?');
            queryParams.push(type);
        }

        if (ad_type) {
            whereConditions.push('l.ad_type_id = ?');
            queryParams.push(ad_type);
        }

        if (category) {
            whereConditions.push('l.category_id = ?');
            queryParams.push(category);
        }

        if (category_type) {
            whereConditions.push('c.category_type = ?');
            queryParams.push(category_type);
        }

        if (tags) {
            // SQLite json1-compatible lookup: tags stored as JSON array
            // Prefer json_each when available; fallback to LIKE if json_each not present
            // Here we use json_each which works when SQLite is built with json1 (common in Node sqlite3)
            whereConditions.push('EXISTS (SELECT 1 FROM json_each(l.tags) WHERE value = ?)');
            queryParams.push(tags);
        }

        if (search) {
            whereConditions.push('(l.title LIKE ? OR l.description LIKE ? OR l.brand LIKE ? OR l.model LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (min_price) {
            whereConditions.push('l.price >= ?');
            queryParams.push(min_price);
        }

        if (max_price) {
            whereConditions.push('l.price <= ?');
            queryParams.push(max_price);
        }

        if (location) {
            whereConditions.push('l.location LIKE ?');
            queryParams.push(`%${location}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get listings
        const listings = await dbHelpers.all(`
            SELECT
                l.*,
                c.name as category_name,
                c.slug as category_slug,
                c.category_type,
                at.name as ad_type_name,
                at.slug as ad_type_slug,
                u.name as user_name,
                u.phone as user_phone
            FROM listings l
            LEFT JOIN categories c ON l.category_id = c.id
            LEFT JOIN ad_types at ON l.ad_type_id = at.id
            LEFT JOIN users u ON l.user_id = u.id
            ${whereClause}
            ORDER BY l.is_featured DESC, l.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // Get total count
        const countResult = await dbHelpers.get(`
            SELECT COUNT(*) as total
            FROM listings l
            ${whereClause}
        `, queryParams);

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Add favorite status for authenticated users
        if (req.user) {
            for (let listing of listings) {
                const favorite = await dbHelpers.get(
                    'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
                    [req.user.id, listing.id]
                );
                listing.is_favorite = !!favorite;
            }
        }

        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: parseInt(limit),
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get single listing by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await dbHelpers.get(`
            SELECT 
                l.*,
                c.name as category_name,
                c.slug as category_slug,
                u.name as user_name,
                u.phone as user_phone
            FROM listings l
            LEFT JOIN categories c ON l.category_id = c.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.id = ? AND l.is_active = 1
        `, [id]);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        // Track view
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        await dbHelpers.run(
            'INSERT INTO listing_views (listing_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [id, req.user?.id || null, ipAddress, userAgent]
        );

        // Update view count
        await dbHelpers.run(
            'UPDATE listings SET view_count = view_count + 1 WHERE id = ?',
            [id]
        );

        // Add favorite status for authenticated users
        if (req.user) {
            const favorite = await dbHelpers.get(
                'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
                [req.user.id, listing.id]
            );
            listing.is_favorite = !!favorite;
        }

        res.json({
            success: true,
            data: { listing }
        });

    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Create new listing
router.post('/', [
    body('title').isLength({ min: 5, max: 200 }).withMessage('عنوان باید بین 5 تا 200 کاراکتر باشد'),
    body('description').isLength({ min: 10 }).withMessage('توضیحات باید حداقل 10 کاراکتر باشد'),
    body('price').isFloat({ min: 0 }).withMessage('قیمت باید عدد مثبت باشد'),
    body('type').isIn(['rent', 'sale']).withMessage('نوع آگهی نامعتبر است'),
    body('ad_type_id').optional().isInt().withMessage('نوع آگهی نامعتبر است'),
    body('category_id').isInt().withMessage('دسته‌بندی نامعتبر است'),
    body('tags').optional().isArray().withMessage('برچسب‌ها باید آرایه باشند'),
    body('location').isLength({ min: 2 }).withMessage('موقعیت مکانی الزامی است')
], authenticateUser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات آگهی نامعتبر است',
                errors: errors.array()
            });
        }

        const {
            title,
            description,
            price,
            type,
            ad_type_id,
            category_id,
            tags = [],
            images = [],
            location,
            condition,
            year,
            brand,
            model,
            specifications = {}
        } = req.body;

        const result = await dbHelpers.run(`
            INSERT INTO listings (
                title, description, price, type, ad_type_id, category_id, user_id,
                tags, images, location, condition, year, brand, model, specifications
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, description, price, type, ad_type_id || null, category_id, req.user.id,
            JSON.stringify(tags), JSON.stringify(images), location, condition, year, brand, model, JSON.stringify(specifications)
        ]);

        const newListing = await dbHelpers.get(
            'SELECT * FROM listings WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'آگهی با موفقیت ایجاد شد',
            data: { listing: newListing }
        });

    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Update listing
router.put('/:id', [
    body('title').optional().isLength({ min: 5, max: 200 }).withMessage('عنوان باید بین 5 تا 200 کاراکتر باشد'),
    body('description').optional().isLength({ min: 10 }).withMessage('توضیحات باید حداقل 10 کاراکتر باشد'),
    body('price').optional().isFloat({ min: 0 }).withMessage('قیمت باید عدد مثبت باشد')
], authenticateUser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات آگهی نامعتبر است',
                errors: errors.array()
            });
        }

        const { id } = req.params;

        // Check if listing exists and belongs to user
        const listing = await dbHelpers.get(
            'SELECT * FROM listings WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد یا شما مجاز به ویرایش آن نیستید'
            });
        }

        const updateFields = [];
        const updateValues = [];

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'id') {
                updateFields.push(`${key} = ?`);
                updateValues.push(req.body[key]);
            }
        });

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
            message: 'آگهی با موفقیت به‌روزرسانی شد',
            data: { listing: updatedListing }
        });

    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Delete listing
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if listing exists and belongs to user
        const listing = await dbHelpers.get(
            'SELECT * FROM listings WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد یا شما مجاز به حذف آن نیستید'
            });
        }

        await dbHelpers.run(
            'UPDATE listings SET is_active = 0 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'آگهی با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get categories
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await dbHelpers.all(
            'SELECT * FROM categories ORDER BY category_type, name'
        );

        res.json({
            success: true,
            data: { categories }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get ad types
router.get('/ad-types/all', async (req, res) => {
    try {
        const adTypes = await dbHelpers.all(
            'SELECT * FROM ad_types ORDER BY name'
        );

        res.json({
            success: true,
            data: { ad_types: adTypes }
        });

    } catch (error) {
        console.error('Get ad types error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

module.exports = router;
