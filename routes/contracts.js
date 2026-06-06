const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const updateContractStatus = async (contract) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active_till = new Date(contract.active_till);
  active_till.setHours(0, 0, 0, 0);

  if (contract.status === 'active' && active_till < today) {
    await contract.update({ status: 'expired' });
    return { ...contract.toJSON(), status: 'expired' };
  }

  return contract.toJSON();
};

router.get(
  '/',
  // verifyToken,  // Commented for development - remove in production
  [
    query('status').optional().isIn(['active', 'expired', 'upcoming']).withMessage('Invalid status'),
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

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      try {
        let contracts = await models.Contract.findAll({
          where,
          limit,
          offset,
          order: [['active_till', 'ASC']],
          raw: false
        });

        contracts = await Promise.all(contracts.map(contract => updateContractStatus(contract)));

        const totalCount = await models.Contract.count({ where });
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
          success: true,
          message: 'Contracts retrieved successfully',
          data: {
            contracts,
            pagination: {
              total: totalCount,
              page,
              limit,
              totalPages
            }
          }
        });
      } catch (dbError) {
        console.warn('Database unavailable, returning mock contracts:', dbError.message);

        const mockContracts = [
          {
            id: '1',
            contract_id: 'CON-2025-001',
            contract_name: 'Dell Laptop AMC',
            vendor_name: 'Dell Technologies',
            active_from: '2025-01-01',
            active_till: '2026-01-01',
            status: 'active',
            contract_value: 150000,
            notes: 'Annual maintenance contract for Dell devices'
          },
          {
            id: '2',
            contract_id: 'CON-2025-002',
            contract_name: 'Microsoft Office License',
            vendor_name: 'Microsoft',
            active_from: '2025-02-01',
            active_till: '2027-02-01',
            status: 'active',
            contract_value: 200000,
            notes: 'Enterprise Office Licensing'
          }
        ];

        res.json({
          success: true,
          message: 'Contracts retrieved (Mock Data - Database unavailable)',
          data: {
            contracts: mockContracts,
            pagination: {
              total: mockContracts.length,
              page: 1,
              limit: 10,
              totalPages: 1
            }
          }
        });
      }
    } catch (error) {
      console.error('Get contracts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve contracts',
        message: error.message
      });
    }
  }
);

router.get('/:id', /* verifyToken, */ async (req, res) => {
  try {
    const contract = await models.Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        message: 'The requested contract does not exist.'
      });
    }

    const updatedContract = await updateContractStatus(contract);

    res.json({
      success: true,
      message: 'Contract retrieved successfully',
      data: { contract: updatedContract }
    });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contract',
      message: error.message
    });
  }
});

router.post(
  '/',
  /* verifyToken, */  // DISABLED FOR DEVELOPMENT
  /* requireRole('admin'), */  // DISABLED FOR DEVELOPMENT
  [
    body('contract_name').trim().notEmpty().withMessage('Contract name is required'),
    body('vendor_name').trim().notEmpty().withMessage('Vendor name is required'),
    body('vendor_contact').optional({ checkFalsy: true }).trim(),
    body('vendor_email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid vendor email'),
    body('vendor_phone').optional({ checkFalsy: true }).trim(),
    body('vendor_address').optional({ checkFalsy: true }).trim(),
    body('vendor_contact_person').optional({ checkFalsy: true }).trim(),
    body('active_from').isISO8601().toDate().withMessage('Invalid active_from date'),
    body('active_till').isISO8601().toDate().withMessage('Invalid active_till date'),
    body('contract_value').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('description').optional({ checkFalsy: true }).trim()
  ],
  async (req, res) => {
    const transaction = await models.sequelize.transaction();

    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📝 POST /api/contracts - Create Contract');
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

      const { contract_name, vendor_name, vendor_contact, vendor_email, vendor_phone, vendor_address, vendor_contact_person, active_from, active_till, contract_value, description } = req.body;

      if (new Date(active_from) >= new Date(active_till)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'active_from must be before active_till'
        });
      }

      // Auto-generate unique contract_id (CON-0001, CON-0002, ...)
      const allContracts = await models.Contract.findAll({
        attributes: ['contract_id'],
        transaction
      });
      let maxNum = 0;
      allContracts.forEach(c => {
        const match = c.contract_id && c.contract_id.match(/^CON-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const contract_id = `CON-${String(maxNum + 1).padStart(4, '0')}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeFrom = new Date(active_from);
      activeFrom.setHours(0, 0, 0, 0);
      const activeTill = new Date(active_till);
      activeTill.setHours(0, 0, 0, 0);

      let finalStatus;
      if (activeTill < today) {
        finalStatus = 'expired';
      } else if (activeFrom > today) {
        finalStatus = 'upcoming';
      } else {
        const daysLeft = Math.ceil((activeTill - today) / (1000 * 60 * 60 * 24));
        finalStatus = daysLeft <= 30 ? 'expiring_soon' : 'active';
      }

      console.log('Creating contract with data:', {
        contract_id,
        contract_name,
        vendor_name,
        active_from,
        active_till,
        status: finalStatus
      });

      const contract = await models.Contract.create(
        {
          contract_id,
          contract_name,
          vendor_name,
          vendor_contact: vendor_contact || null,
          vendor_email: vendor_email || null,
          vendor_phone: vendor_phone || null,
          vendor_address: vendor_address || null,
          vendor_contact_person: vendor_contact_person || null,
          active_from,
          active_till,
          contract_value: contract_value || 0,
          status: finalStatus,
          description: description || null
        },
        { transaction }
      );

      console.log('✓ Contract created:', { id: contract.id, contract_id });

      await transaction.commit();
      console.log('✓ Transaction committed');
      console.log('═══════════════════════════════════════════════════════');

      res.status(201).json({
        success: true,
        message: 'Contract created successfully',
        data: { contract }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating contract:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to create contract',
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
    body('contract_id').optional().trim(),
    body('contract_name').optional().trim(),
    body('vendor_name').optional().trim(),
    body('vendor_contact').optional({ checkFalsy: true }).trim(),
    body('vendor_email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid vendor email'),
    body('vendor_phone').optional({ checkFalsy: true }).trim(),
    body('vendor_address').optional({ checkFalsy: true }).trim(),
    body('vendor_contact_person').optional({ checkFalsy: true }).trim(),
    body('active_from').optional().isISO8601().toDate().withMessage('Invalid active_from date'),
    body('active_till').optional().isISO8601().toDate().withMessage('Invalid active_till date'),
    body('contract_value').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('status').optional().isIn(['active', 'expired', 'upcoming', 'expiring_soon']).withMessage('Invalid status'),
    body('notes').optional().trim(),
    body('description').optional({ checkFalsy: true }).trim()
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

      const contract = await models.Contract.findByPk(req.params.id, { transaction });

      if (!contract) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Contract not found',
          message: 'The requested contract does not exist.'
        });
      }

      if (req.body.active_from && req.body.active_till) {
        if (new Date(req.body.active_from) >= new Date(req.body.active_till)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'active_from must be before active_till'
          });
        }
      } else if (req.body.active_from && req.body.active_from >= contract.active_till) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'active_from must be before active_till'
        });
      } else if (req.body.active_till && contract.active_from >= req.body.active_till) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'active_from must be before active_till'
        });
      }

      const updates = {};
      const allowedFields = ['contract_id', 'contract_name', 'vendor_name', 'vendor_contact', 'vendor_email', 'vendor_phone', 'vendor_address', 'vendor_contact_person', 'active_from', 'active_till', 'contract_value', 'status', 'notes', 'description'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (Object.keys(updates).length > 0) {
        await contract.update(updates, { transaction });
      }

      await transaction.commit();

      const updatedContract = await models.Contract.findByPk(contract.id);
      const finalContract = await updateContractStatus(updatedContract);

      res.json({
        success: true,
        message: 'Contract updated successfully',
        data: { contract: finalContract }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update contract error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update contract',
        message: error.message
      });
    }
  }
);

router.delete('/:id', /* verifyToken, requireRole('admin'), */ async (req, res) => {
  const transaction = await models.sequelize.transaction();

  try {
    const contract = await models.Contract.findByPk(req.params.id, { transaction });

    if (!contract) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        message: 'The requested contract does not exist.'
      });
    }

    await contract.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Contract deleted successfully',
      data: { contract }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contract',
      message: error.message
    });
  }
});

router.get('/expiring/soon', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContracts = await models.Contract.findAll({
      where: {
        active_till: {
          [Op.gte]: today,
          [Op.lte]: thirtyDaysFromNow
        },
        status: 'active'
      },
      order: [['active_till', 'ASC']]
    });

    const updated = await Promise.all(expiringContracts.map(contract => updateContractStatus(contract)));

    res.json({
      success: true,
      message: 'Expiring contracts retrieved successfully',
      data: {
        expiringContracts: updated,
        count: updated.length
      }
    });
  } catch (error) {
    console.error('Get expiring contracts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve expiring contracts',
      message: error.message
    });
  }
});

module.exports = router;
