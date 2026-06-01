const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  verifyToken,
  [
    query('vendor').optional().trim(),
    query('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('from').optional().isISO8601().toDate().withMessage('Invalid from date'),
    query('to').optional().isISO8601().toDate().withMessage('Invalid to date'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { vendor, status, from, to, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (vendor) where.vendor_name = { [Op.iLike]: `%${vendor}%` };
      if (status) where.status = status;
      if (from || to) {
        where.purchase_date = {};
        if (from) where.purchase_date[Op.gte] = from;
        if (to) where.purchase_date[Op.lte] = to;
      }

      const { count, rows } = await models.Purchase.findAndCountAll({
        where,
        include: [
          {
            association: 'assets',
            attributes: ['id', 'asset_tag', 'category', 'sub_type', 'status'],
            through: { attributes: [] }
          }
        ],
        limit,
        offset,
        order: [['purchase_date', 'DESC']],
        distinct: true,
        subQuery: false
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        message: 'Purchases retrieved successfully',
        data: {
          purchases: rows,
          pagination: {
            total: count,
            page,
            limit,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get purchases error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve purchases',
        message: error.message
      });
    }
  }
);

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const purchase = await models.Purchase.findByPk(req.params.id, {
      include: [
        {
          association: 'assets',
          attributes: [
            'id',
            'asset_tag',
            'category',
            'sub_type',
            'serial_no',
            'mac_address',
            'status',
            'assigned_to',
            'created_at'
          ],
          through: { attributes: [] },
          include: [
            {
              association: 'assignedUser',
              attributes: ['id', 'name', 'email'],
              required: false
            }
          ]
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
        message: 'The requested purchase does not exist.'
      });
    }

    res.json({
      success: true,
      message: 'Purchase retrieved successfully',
      data: { purchase }
    });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve purchase',
      message: error.message
    });
  }
});

router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  [
    body('purchase_id').trim().notEmpty().withMessage('Purchase ID is required'),
    body('vendor_name').trim().notEmpty().withMessage('Vendor name is required'),
    body('vendor_contact').optional().trim(),
    body('vendor_email').optional().isEmail().withMessage('Invalid vendor email'),
    body('billing_address').optional().trim(),
    body('shipping_address').optional().trim(),
    body('purchase_date').isISO8601().toDate().withMessage('Invalid purchase date'),
    body('total_amount').isFloat({ min: 0 }).toFloat().withMessage('Total amount must be positive'),
    body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status')
  ],
  async (req, res) => {
    const transaction = await models.sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { purchase_id, vendor_name, vendor_contact, vendor_email, billing_address, shipping_address, purchase_date, total_amount, status } = req.body;

      const existingPurchase = await models.Purchase.findOne({
        where: { purchase_id },
        transaction
      });

      if (existingPurchase) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: 'Purchase already exists',
          message: 'A purchase with this ID already exists.'
        });
      }

      const purchase = await models.Purchase.create(
        {
          purchase_id,
          vendor_name,
          vendor_contact,
          vendor_email,
          billing_address,
          shipping_address,
          purchase_date,
          total_amount,
          status: status || 'pending'
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Purchase created successfully',
        data: { purchase }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create purchase error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create purchase',
        message: error.message
      });
    }
  }
);

router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  [
    body('purchase_id').optional().trim(),
    body('vendor_name').optional().trim(),
    body('vendor_contact').optional().trim(),
    body('vendor_email').optional().isEmail().withMessage('Invalid vendor email'),
    body('billing_address').optional().trim(),
    body('shipping_address').optional().trim(),
    body('purchase_date').optional().isISO8601().toDate().withMessage('Invalid purchase date'),
    body('total_amount').optional().isFloat({ min: 0 }).toFloat().withMessage('Total amount must be positive'),
    body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status')
  ],
  async (req, res) => {
    const transaction = await models.sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const purchase = await models.Purchase.findByPk(req.params.id, { transaction });

      if (!purchase) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Purchase not found',
          message: 'The requested purchase does not exist.'
        });
      }

      const updates = {};
      const allowedFields = ['purchase_id', 'vendor_name', 'vendor_contact', 'vendor_email', 'billing_address', 'shipping_address', 'purchase_date', 'total_amount', 'status'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (Object.keys(updates).length > 0) {
        await purchase.update(updates, { transaction });
      }

      await transaction.commit();

      const updatedPurchase = await models.Purchase.findByPk(purchase.id);

      res.json({
        success: true,
        message: 'Purchase updated successfully',
        data: { purchase: updatedPurchase }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update purchase error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update purchase',
        message: error.message
      });
    }
  }
);

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const transaction = await models.sequelize.transaction();

  try {
    const purchase = await models.Purchase.findByPk(req.params.id, { transaction });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
        message: 'The requested purchase does not exist.'
      });
    }

    await purchase.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Purchase deleted successfully',
      data: { purchase }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete purchase',
      message: error.message
    });
  }
});

module.exports = router;
