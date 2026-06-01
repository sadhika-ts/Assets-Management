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
  verifyToken,
  [
    query('status').optional().isIn(['active', 'expired', 'upcoming']).withMessage('Invalid status'),
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

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

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

router.get('/:id', verifyToken, async (req, res) => {
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
  verifyToken,
  requireRole('admin'),
  [
    body('contract_id').trim().notEmpty().withMessage('Contract ID is required'),
    body('name').trim().notEmpty().withMessage('Contract name is required'),
    body('vendor_name').trim().notEmpty().withMessage('Vendor name is required'),
    body('vendor_contact').optional().trim(),
    body('active_from').isISO8601().toDate().withMessage('Invalid active_from date'),
    body('active_till').isISO8601().toDate().withMessage('Invalid active_till date'),
    body('status').optional().isIn(['active', 'expired', 'upcoming']).withMessage('Invalid status'),
    body('notes').optional().trim()
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

      const { contract_id, name, vendor_name, vendor_contact, active_from, active_till, status, notes } = req.body;

      if (new Date(active_from) >= new Date(active_till)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'active_from must be before active_till'
        });
      }

      const existingContract = await models.Contract.findOne({
        where: { contract_id },
        transaction
      });

      if (existingContract) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: 'Contract already exists',
          message: 'A contract with this ID already exists.'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeFrom = new Date(active_from);
      activeFrom.setHours(0, 0, 0, 0);

      let finalStatus = status;
      if (!status) {
        if (activeFrom > today) {
          finalStatus = 'upcoming';
        } else {
          finalStatus = 'active';
        }
      }

      const contract = await models.Contract.create(
        {
          contract_id,
          name,
          vendor_name,
          vendor_contact,
          active_from,
          active_till,
          status: finalStatus,
          notes
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Contract created successfully',
        data: { contract }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create contract error:', error);
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
  verifyToken,
  requireRole('admin'),
  [
    body('contract_id').optional().trim(),
    body('name').optional().trim(),
    body('vendor_name').optional().trim(),
    body('vendor_contact').optional().trim(),
    body('active_from').optional().isISO8601().toDate().withMessage('Invalid active_from date'),
    body('active_till').optional().isISO8601().toDate().withMessage('Invalid active_till date'),
    body('status').optional().isIn(['active', 'expired', 'upcoming']).withMessage('Invalid status'),
    body('notes').optional().trim()
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
      const allowedFields = ['contract_id', 'name', 'vendor_name', 'vendor_contact', 'active_from', 'active_till', 'status', 'notes'];

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

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
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
