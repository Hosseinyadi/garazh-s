const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { dbHelpers } = require('../config/database');
const smsService = require('../services/smsService');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Send OTP for registration/login
router.post('/send-otp', [
    body('phone').isMobilePhone('fa-IR').withMessage('شماره موبایل معتبر نیست')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { phone } = req.body;
        const cleanPhone = smsService.cleanPhoneNumber(phone);

        // Generate OTP
        const otpCode = smsService.generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to database
        await dbHelpers.run(
            'INSERT INTO otp_verifications (phone, otp_code, expires_at) VALUES (?, ?, ?)',
            [cleanPhone, otpCode, expiresAt]
        );

        // Send SMS
        const smsResult = await smsService.sendOTP(cleanPhone, otpCode);

        if (smsResult.success) {
            res.json({
                success: true,
                message: 'کد تایید ارسال شد',
                expiresIn: 300 // 5 minutes in seconds
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'خطا در ارسال پیامک',
                error: smsResult.error
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Verify OTP and login/register
router.post('/verify-otp', [
    body('phone').isMobilePhone('fa-IR').withMessage('شماره موبایل معتبر نیست'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('کد تایید باید 6 رقم باشد')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { phone, otp, name } = req.body;
        const cleanPhone = smsService.cleanPhoneNumber(phone);

        // Verify OTP
        const otpRecord = await dbHelpers.get(
            'SELECT * FROM otp_verifications WHERE phone = ? AND otp_code = ? AND is_used = 0 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
            [cleanPhone, otp]
        );

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'کد تایید نامعتبر یا منقضی شده است'
            });
        }

        // Mark OTP as used
        await dbHelpers.run(
            'UPDATE otp_verifications SET is_used = 1 WHERE id = ?',
            [otpRecord.id]
        );

        // Check if user exists
        let user = await dbHelpers.get(
            'SELECT * FROM users WHERE phone = ?',
            [cleanPhone]
        );

        if (!user) {
            // Create new user
            const result = await dbHelpers.run(
                'INSERT INTO users (phone, name, is_verified) VALUES (?, ?, 1)',
                [cleanPhone, name || 'کاربر']
            );
            
            user = await dbHelpers.get(
                'SELECT id, phone, name, email, avatar, is_verified FROM users WHERE id = ?',
                [result.id]
            );
        } else {
            // Update verification status
            await dbHelpers.run(
                'UPDATE users SET is_verified = 1 WHERE id = ?',
                [user.id]
            );
            user.is_verified = 1;
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            phone: user.phone,
            role: 'user'
        });

        res.json({
            success: true,
            message: 'ورود موفقیت‌آمیز',
            data: {
                user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    is_verified: user.is_verified
                },
                token
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Admin login
router.post('/admin/login', [
    body('username').notEmpty().withMessage('نام کاربری الزامی است'),
    body('password').notEmpty().withMessage('رمز عبور الزامی است')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Get admin user
        const admin = await dbHelpers.get(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
            [username]
        );

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'نام کاربری یا رمز عبور اشتباه است'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'نام کاربری یا رمز عبور اشتباه است'
            });
        }

        // Generate token
        const token = generateToken({
            adminId: admin.id,
            username: admin.username,
            role: 'admin'
        });

        res.json({
            success: true,
            message: 'ورود ادمین موفقیت‌آمیز',
            data: {
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'توکن احراز هویت الزامی است'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bil-flow-secret-key-2024');
        
        const user = await dbHelpers.get(
            'SELECT id, phone, name, email, avatar, is_verified, created_at FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

// Update user profile
router.put('/profile', [
    body('name').optional().isLength({ min: 2 }).withMessage('نام باید حداقل 2 کاراکتر باشد'),
    body('email').optional().isEmail().withMessage('ایمیل معتبر نیست')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'اطلاعات ورودی نامعتبر است',
                errors: errors.array()
            });
        }

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'توکن احراز هویت الزامی است'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bil-flow-secret-key-2024');
        
        const { name, email, avatar } = req.body;
        const updateFields = [];
        const updateValues = [];

        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (avatar) {
            updateFields.push('avatar = ?');
            updateValues.push(avatar);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است'
            });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(decoded.userId);

        await dbHelpers.run(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        const updatedUser = await dbHelpers.get(
            'SELECT id, phone, name, email, avatar, is_verified FROM users WHERE id = ?',
            [decoded.userId]
        );

        res.json({
            success: true,
            message: 'پروفایل با موفقیت به‌روزرسانی شد',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
});

module.exports = router;
