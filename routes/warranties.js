const express = require('express');
const { Op } = require('sequelize');
const models = require('../models');

const router = express.Router();

const daysLeft = (end_date) => {
  if (!end_date) return null;
  return Math.ceil((new Date(end_date) - new Date()) / 86400000);
};

const computeStatus = (end_date) => {
  if (!end_date) return 'unknown';
  const d = daysLeft(end_date);
  if (d < 0) return 'expired';
  if (d <= 30) return 'expiring_soon';
  return 'active';
};

const formatWarranty = (w) => ({
  ...w.toJSON(),
  status: computeStatus(w.end_date),
  days_left: daysLeft(w.end_date),
});

// GET /api/warranties
router.get('/', async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    const warranties = await models.Warranty.findAll({
      include: [{
        association: 'asset',
        attributes: ['id', 'asset_tag', 'asset_name', 'category', 'sub_type', 'status']
      }],
      order: [['end_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    let result = warranties.map(formatWarranty);

    if (status && status !== 'all') result = result.filter(w => w.status === status);
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(w =>
        w.warranty_number?.toLowerCase().includes(term) ||
        w.warranty_provider?.toLowerCase().includes(term) ||
        w.asset?.asset_tag?.toLowerCase().includes(term) ||
        w.asset?.asset_name?.toLowerCase().includes(term)
      );
    }

    const now = new Date();
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    const in90 = new Date(); in90.setDate(in90.getDate() + 90);

    res.json({
      success: true,
      data: {
        warranties: result,
        stats: {
          total: result.length,
          active: result.filter(w => w.status === 'active').length,
          expiring_soon: result.filter(w => w.status === 'expiring_soon').length,
          expired: result.filter(w => w.status === 'expired').length,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/warranties/:id
router.get('/:id', async (req, res) => {
  try {
    const w = await models.Warranty.findByPk(req.params.id, {
      include: [{ association: 'asset', attributes: ['id', 'asset_tag', 'asset_name', 'category', 'sub_type', 'status'] }]
    });
    if (!w) return res.status(404).json({ success: false, message: 'Warranty not found' });
    res.json({ success: true, data: { warranty: formatWarranty(w) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/warranties
router.post('/', async (req, res) => {
  try {
    const { asset_id, warranty_provider, warranty_type, start_date, end_date, warranty_number, contact_number, notes } = req.body;
    if (!asset_id) return res.status(400).json({ success: false, message: 'asset_id is required' });
    const asset = await models.Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    const warranty = await models.Warranty.create({ asset_id, warranty_provider, warranty_type, start_date, end_date, warranty_number, contact_number, notes });
    const fresh = await models.Warranty.findByPk(warranty.id, {
      include: [{ association: 'asset', attributes: ['id', 'asset_tag', 'asset_name', 'category', 'sub_type', 'status'] }]
    });
    res.status(201).json({ success: true, message: 'Warranty created', data: { warranty: formatWarranty(fresh) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/warranties/:id
router.put('/:id', async (req, res) => {
  try {
    const w = await models.Warranty.findByPk(req.params.id);
    if (!w) return res.status(404).json({ success: false, message: 'Warranty not found' });
    const { warranty_provider, warranty_type, start_date, end_date, warranty_number, contact_number, notes } = req.body;
    await w.update({ warranty_provider, warranty_type, start_date, end_date, warranty_number, contact_number, notes });
    const fresh = await models.Warranty.findByPk(w.id, {
      include: [{ association: 'asset', attributes: ['id', 'asset_tag', 'asset_name', 'category', 'sub_type', 'status'] }]
    });
    res.json({ success: true, message: 'Warranty updated', data: { warranty: formatWarranty(fresh) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/warranties/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await models.Warranty.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Warranty not found' });
    res.json({ success: true, message: 'Warranty deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
