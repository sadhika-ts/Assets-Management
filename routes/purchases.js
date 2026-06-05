const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  // verifyToken,  // Commented for development - remove in production
  [
    query('vendor').optional().trim(),
    query('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('from').optional().isISO8601().toDate().withMessage('Invalid from date'),
    query('to').optional().isISO8601().toDate().withMessage('Invalid to date'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 500 }).toInt()
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

      try {
        const { count, rows } = await models.Purchase.findAndCountAll({
          where,
          limit,
          offset,
          order: [['purchase_date', 'DESC']],
          distinct: true
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
      } catch (dbError) {
        console.warn('Database unavailable, returning mock purchases:', dbError.message);

        const mockPurchases = [
          {
            id: '1',
            purchase_id: 'PO-2025-001',
            vendor_name: 'Dell Technologies',
            vendor_contact: '+91 9876543210',
            vendor_email: 'sales@dell.com',
            billing_address: 'Chennai Head Office',
            shipping_address: 'Chennai IT Department',
            purchase_date: '2025-05-15',
            total_amount: 350000,
            status: 'received'
          },
          {
            id: '2',
            purchase_id: 'PO-2025-002',
            vendor_name: 'HP India',
            vendor_contact: '+91 9123456780',
            vendor_email: 'orders@hp.com',
            billing_address: 'Chennai Head Office',
            shipping_address: 'Chennai Branch Office',
            purchase_date: '2025-05-20',
            total_amount: 125000,
            status: 'received'
          }
        ];

        res.json({
          success: true,
          message: 'Purchases retrieved (Mock Data - Database unavailable)',
          data: {
            purchases: mockPurchases,
            pagination: {
              total: mockPurchases.length,
              page: 1,
              limit: 10,
              totalPages: 1
            }
          }
        });
      }
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
          through: { attributes: [] }
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
  /* verifyToken, */  // DISABLED FOR DEVELOPMENT
  /* requireRole('admin'), */  // DISABLED FOR DEVELOPMENT
  [
    // REQUIRED FIELDS
    body('vendor_name').trim().notEmpty().withMessage('Vendor name is required'),
    body('vendor_contact').trim().notEmpty().withMessage('Vendor contact number is required')
      .matches(/^\d{10}$/).withMessage('Contact number must be exactly 10 digits'),
    body('vendor_email').trim().notEmpty().withMessage('Vendor email is required')
      .isEmail().withMessage('Invalid vendor email format'),
    body('vendor_address').trim().notEmpty().withMessage('Vendor address is required'),
    body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
    body('billing_address').trim().notEmpty().withMessage('Billing address is required'),
    body('invoice_number').trim().notEmpty().withMessage('Invoice number is required'),
    body('purchase_date').notEmpty().withMessage('Purchase date is required')
      .isISO8601().toDate().withMessage('Invalid purchase date format'),
    body('total_amount').notEmpty().withMessage('Total amount is required')
      .isFloat({ min: 0.01 }).withMessage('Total amount must be greater than 0').toFloat(),
    // OPTIONAL FIELDS
    body('payment_method').optional({ checkFalsy: true }).trim(),
    body('notes').optional({ checkFalsy: true }).trim(),
    body('status').optional({ checkFalsy: true }).isIn(['pending', 'ordered', 'received', 'cancelled']).withMessage('Invalid status')
  ],
  async (req, res) => {
    const transaction = await models.sequelize.transaction();

    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📝 POST /api/purchases - Create Purchase Order');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Request Body:', req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation failed:', errors.array());
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }
      console.log('✓ Validation passed');

      // Auto-generate purchase_id
      const allPurchases = await models.Purchase.findAll({
        attributes: ['purchase_id'],
        raw: true,
        transaction
      });

      let nextNumber = 1;
      const numericIds = allPurchases
        .map(p => {
          const match = p.purchase_id.match(/PO-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0)
        .sort((a, b) => b - a);

      if (numericIds.length > 0) {
        nextNumber = numericIds[0] + 1;
      }
      const purchase_id = `PO-${String(nextNumber).padStart(4, '0')}`;
      console.log('Generated purchase_id:', purchase_id);

      const {
        vendor_name,
        vendor_contact,
        vendor_email,
        vendor_address,
        billing_address,
        shipping_address,
        invoice_number,
        payment_method,
        notes,
        purchase_date,
        total_amount,
        status
      } = req.body;

      console.log('Creating purchase with data:', {
        purchase_id,
        vendor_name,
        purchase_date,
        status
      });

      const purchase = await models.Purchase.create(
        {
          purchase_id,
          vendor_name,
          vendor_contact: vendor_contact || null,
          vendor_email: vendor_email || null,
          vendor_address: vendor_address || null,
          billing_address: billing_address || null,
          shipping_address: shipping_address || null,
          invoice_number: invoice_number || null,
          payment_method: payment_method || 'Bank Transfer',
          notes: notes || null,
          purchase_date,
          total_amount: total_amount || 0,
          status: (status || 'pending').toLowerCase()
        },
        { transaction }
      );

      console.log('✓ Purchase created:', { id: purchase.id, purchase_id });

      await transaction.commit();
      console.log('✓ Transaction committed');
      console.log('═══════════════════════════════════════════════════════');

      res.status(201).json({
        success: true,
        message: 'Purchase created successfully',
        data: { purchase }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating purchase:', error);
      console.error('Stack:', error.stack);
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
  /* verifyToken, */
  /* requireRole('admin'), */
  [
    body('purchase_id').optional().trim(),
    body('vendor_name').optional().trim(),
    body('vendor_contact').optional().trim(),
    body('vendor_email').optional().isEmail().withMessage('Invalid vendor email'),
    body('billing_address').optional().trim(),
    body('shipping_address').optional().trim(),
    body('purchase_date').optional().isISO8601().toDate().withMessage('Invalid purchase date'),
    body('total_amount').optional().isFloat({ min: 0 }).toFloat().withMessage('Total amount must be positive'),
    body('status').optional().isIn(['pending', 'ordered', 'received', 'cancelled']).withMessage('Invalid status')
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
