const express = require('express');
const { dbHelpers } = require('../config/database');

const router = express.Router();

// Get all provinces
router.get('/provinces', async (req, res) => {
  try {
    const provinces = await dbHelpers.all(
      'SELECT * FROM provinces WHERE is_active = 1 ORDER BY name'
    );

    res.json({
      success: true,
      data: { provinces }
    });
  } catch (error) {
    console.error('Get provinces error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// Get cities by province
router.get('/cities/:provinceId', async (req, res) => {
  try {
    const { provinceId } = req.params;

    const cities = await dbHelpers.all(
      'SELECT * FROM cities WHERE province_id = ? AND is_active = 1 ORDER BY name',
      [provinceId]
    );

    res.json({
      success: true,
      data: { cities }
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// Add new province (admin only)
router.post('/provinces', async (req, res) => {
  try {
    const { name, name_en, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'نام استان الزامی است'
      });
    }

    const result = await dbHelpers.run(
      'INSERT INTO provinces (name, name_en, is_active) VALUES (?, ?, ?)',
      [name, name_en, is_active]
    );

    res.status(201).json({
      success: true,
      message: 'استان با موفقیت اضافه شد',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Add province error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

// Add new city (admin only)
router.post('/cities', async (req, res) => {
  try {
    const { name, name_en, province_id, is_active = true } = req.body;

    if (!name || !province_id) {
      return res.status(400).json({
        success: false,
        message: 'نام شهر و استان الزامی است'
      });
    }

    const result = await dbHelpers.run(
      'INSERT INTO cities (name, name_en, province_id, is_active) VALUES (?, ?, ?, ?)',
      [name, name_en, province_id, is_active]
    );

    res.status(201).json({
      success: true,
      message: 'شهر با موفقیت اضافه شد',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Add city error:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور'
    });
  }
});

module.exports = router;
