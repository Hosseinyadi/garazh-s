const jwt = require('jsonwebtoken');
const { dbHelpers } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'bil-flow-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// User authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        // Get user from database
        const user = await dbHelpers.get(
            'SELECT id, phone, name, email, avatar, is_verified FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No admin token provided.'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin token.'
            });
        }

        // Get admin from database
        const admin = await dbHelpers.get(
            'SELECT id, username, role FROM admin_users WHERE id = ? AND is_active = 1',
            [decoded.adminId]
        );

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found or inactive.'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin authentication.'
        });
    }
};

// Optional authentication (for tracking views, etc.)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = verifyToken(token);
            if (decoded && decoded.userId) {
                const user = await dbHelpers.get(
                    'SELECT id, phone, name FROM users WHERE id = ?',
                    [decoded.userId]
                );
                if (user) {
                    req.user = user;
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

module.exports = {
    generateToken,
    verifyToken,
    authenticateUser,
    authenticateAdmin,
    optionalAuth
};
