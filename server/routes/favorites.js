const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbHelpers } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get user favorites
router.get('/', authenticateUser, async (req, res) => {
    try {
        const favorites = await dbHelpers.all(`
            SELECT 
                f.*,
                l.title,
                l.price,
                l.type,
                l.images,
                l.location,
                l.brand,
                l.model,
                l.view_count,
                l.created_at as listing_created_at,
                c.name as category_name
            FROM user_favorites f
            JOIN listings l ON f.listing_id = l.id
            LEFT JOIN categories c ON l.category_id = c.id
            WHERE f.user_id = ? AND l.is_active = 1
            ORDER BY f.created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            data: { favorites }
        });

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Add to favorites
router.post('/', [
    body('listing_id').isInt().withMessage('شناسه آگهی نامعتبر است')
], authenticateUser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { listing_id } = req.body;

        // Check if listing exists
        const listing = await dbHelpers.get(
            'SELECT id FROM listings WHERE id = ? AND is_active = 1',
            [listing_id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        // Check if already in favorites
        const existingFavorite = await dbHelpers.get(
            'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
            [req.user.id, listing_id]
        );

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: 'این آگهی قبلاً به علاقه‌مندی‌ها اضافه شده است'
            });
        }

        // Add to favorites
        await dbHelpers.run(
            'INSERT INTO user_favorites (user_id, listing_id) VALUES (?, ?)',
            [req.user.id, listing_id]
        );

        res.json({
            success: true,
            message: 'آگهی به علاقه‌مندی‌ها اضافه شد'
        });

    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Remove from favorites
router.delete('/:listing_id', authenticateUser, async (req, res) => {
    try {
        const { listing_id } = req.params;

        // Check if favorite exists
        const favorite = await dbHelpers.get(
            'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
            [req.user.id, listing_id]
        );

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'این آگهی در علاقه‌مندی‌ها نیست'
            });
        }

        // Remove from favorites
        await dbHelpers.run(
            'DELETE FROM user_favorites WHERE user_id = ? AND listing_id = ?',
            [req.user.id, listing_id]
        );

        res.json({
            success: true,
            message: 'آگهی از علاقه‌مندی‌ها حذف شد'
        });

    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Toggle favorite (add if not exists, remove if exists)
router.post('/toggle', [
    body('listing_id').isInt().withMessage('شناسه آگهی نامعتبر است')
], authenticateUser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { listing_id } = req.body;

        // Check if listing exists
        const listing = await dbHelpers.get(
            'SELECT id FROM listings WHERE id = ? AND is_active = 1',
            [listing_id]
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'آگهی یافت نشد'
            });
        }

        // Check if already in favorites
        const existingFavorite = await dbHelpers.get(
            'SELECT id FROM user_favorites WHERE user_id = ? AND listing_id = ?',
            [req.user.id, listing_id]
        );

        if (existingFavorite) {
            // Remove from favorites
            await dbHelpers.run(
                'DELETE FROM user_favorites WHERE user_id = ? AND listing_id = ?',
                [req.user.id, listing_id]
            );

            res.json({
                success: true,
                message: 'آگهی از علاقه‌مندی‌ها حذف شد',
                data: { is_favorite: false }
            });
        } else {
            // Add to favorites
            await dbHelpers.run(
                'INSERT INTO user_favorites (user_id, listing_id) VALUES (?, ?)',
                [req.user.id, listing_id]
            );

            res.json({
                success: true,
                message: 'آگهی به علاقه‌مندی‌ها اضافه شد',
                data: { is_favorite: true }
            });
        }

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

module.exports = router;
