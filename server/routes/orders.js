const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { dbHelpers } = require('../config/database');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', [
  body('ad_id').isInt().withMessage('شناسه آگهی نامعتبر است'),
  body('customer_id').isInt().withMessage('شناسه کاربر نامعتبر است'),
  body('customer_name').isLength({ min: 2 }).withMessage('نام الزامی است'),
  body('customer_phone').isLength({ min: 7 }).withMessage('شماره تماس الزامی است'),
  body('total_amount').isFloat({ min: 0 }).withMessage('مبلغ نامعتبر است')
], authenticateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'اطلاعات ورودی نامعتبر است', errors: errors.array() });
    }

    const { ad_id, customer_id, customer_name, customer_phone, customer_email, message, total_amount } = req.body;

    if (req.user.id !== customer_id) {
      return res.status(403).json({ success: false, message: 'مجوز کافی ندارید' });
    }

    const result = await dbHelpers.run(`
      INSERT INTO orders (ad_id, customer_id, customer_name, customer_phone, customer_email, message, status, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [ad_id, customer_id, customer_name, customer_phone, customer_email || null, message || null, total_amount]);

    const order = await dbHelpers.get('SELECT * FROM orders WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Get user's orders
router.get('/', [
  query('customer_id').optional().isInt(),
  query('ad_id').optional().isInt()
], authenticateUser, async (req, res) => {
  try {
    const { customer_id, ad_id } = req.query;
    let where = [];
    let params = [];

    if (customer_id) {
      if (parseInt(customer_id) !== req.user.id) {
        return res.status(403).json({ success: false, message: 'مجوز کافی ندارید' });
      }
      where.push('customer_id = ?');
      params.push(customer_id);
    }

    if (ad_id) {
      where.push('ad_id = ?');
      params.push(ad_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orders = await dbHelpers.all(`SELECT * FROM orders ${whereClause} ORDER BY created_at DESC`, params);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Get order by id (owner or admin)
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await dbHelpers.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ success: false, message: 'مجوز کافی ندارید' });
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Update order status (admin)
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('وضعیت نامعتبر است')
], authenticateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'اطلاعات ورودی نامعتبر است', errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    await dbHelpers.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    const updated = await dbHelpers.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

module.exports = router;


