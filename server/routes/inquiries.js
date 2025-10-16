const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { dbHelpers } = require('../config/database');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Create inquiry (public or authenticated)
router.post('/', [
  body('ad_id').isInt().withMessage('شناسه آگهی نامعتبر است'),
  body('customer_name').isLength({ min: 2 }).withMessage('نام الزامی است'),
  body('customer_phone').isLength({ min: 7 }).withMessage('شماره تماس الزامی است'),
  body('message').isLength({ min: 5 }).withMessage('پیام خیلی کوتاه است')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'اطلاعات ورودی نامعتبر است', errors: errors.array() });
    }

    const { ad_id, customer_name, customer_phone, customer_email, message } = req.body;

    const result = await dbHelpers.run(`
      INSERT INTO inquiries (ad_id, customer_name, customer_phone, customer_email, message, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `, [ad_id, customer_name, customer_phone, customer_email || null, message]);

    const inquiry = await dbHelpers.get('SELECT * FROM inquiries WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// List inquiries by ad (admin)
router.get('/', [
  query('ad_id').optional().isInt(),
  query('status').optional().isIn(['new','read','replied'])
], authenticateAdmin, async (req, res) => {
  try {
    const { ad_id, status } = req.query;
    const where = [];
    const params = [];
    if (ad_id) { where.push('ad_id = ?'); params.push(ad_id); }
    if (status) { where.push('status = ?'); params.push(status); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await dbHelpers.all(`SELECT * FROM inquiries ${whereClause} ORDER BY created_at DESC`, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('List inquiries error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

// Mark as read/replied (admin)
router.patch('/:id/status', [
  body('status').isIn(['new','read','replied']).withMessage('وضعیت نامعتبر است')
], authenticateAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'اطلاعات ورودی نامعتبر است', errors: errors.array() });
    }
    const { id } = req.params;
    const { status } = req.body;
    await dbHelpers.run('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    const row = await dbHelpers.get('SELECT * FROM inquiries WHERE id = ?', [id]);
    res.json({ success: true, data: row });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ success: false, message: 'خطای سرور' });
  }
});

module.exports = router;


