const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const logAuditEvent = async (assetId, userId, action, oldValue, newValue) => {
  try {
    await models.AuditLog.create({
      asset_id: assetId,
      user_id: userId,
      action,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

router.get(
  '/',
  verifyToken,
  [
    query('category').optional().isIn(['IT', 'Non-IT']).withMessage('Invalid category'),
    query('sub_type').optional().trim(),
    query('status').optional().isIn(['active', 'inactive', 'disposed']).withMessage('Invalid status'),
    query('search').optional().trim(),
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

      const { category, sub_type, status, search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (category) where.category = category;
      if (sub_type) where.sub_type = { [Op.iLike]: `%${sub_type}%` };
      if (status) where.status = status;

      let include = [
        {
          association: 'detail',
          attributes: [
            'os_type',
            'os_version',
            'processor_name',
            'cores',
            'ram_gb',
            'disk_gb',
            'ms_office',
            'software_list'
          ]
        },
        {
          association: 'assignedUser',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          association: 'purchase',
          attributes: ['purchase_id', 'vendor_name', 'purchase_date']
        }
      ];

      if (search) {
        where[Op.or] = [
          { asset_tag: { [Op.iLike]: `%${search}%` } },
          { serial_no: { [Op.iLike]: `%${search}%` } },
          { '$detail.software_list$': { [Op.iLike]: `%${search}%` } }
        ];
        include = include.map(inc => ({ ...inc, required: false }));
      }

      const { count, rows } = await models.Asset.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        distinct: true,
        subQuery: false
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        message: 'Assets retrieved successfully',
        data: {
          assets: rows,
          pagination: {
            total: count,
            page,
            limit,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get assets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assets',
        message: error.message
      });
    }
  }
);

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const asset = await models.Asset.findByPk(req.params.id, {
      include: [
        {
          association: 'detail',
          attributes: [
            'id',
            'asset_id',
            'os_type',
            'os_version',
            'product_id',
            'os_activated',
            'processor_name',
            'manufacturer',
            'cores',
            'ram_gb',
            'disk_gb',
            'disk_model',
            'ms_office',
            'office_key',
            'software_list',
            'configuration',
            'others'
          ]
        },
        {
          association: 'assignedUser',
          attributes: ['id', 'name', 'email', 'role', 'created_at']
        },
        {
          association: 'purchase',
          attributes: ['id', 'purchase_id', 'vendor_name', 'vendor_contact', 'purchase_date', 'total_amount']
        },
        {
          association: 'auditLogs',
          attributes: ['id', 'action', 'old_value', 'new_value', 'changed_at'],
          include: [{ association: 'user', attributes: ['name', 'email'] }],
          order: [['changed_at', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        message: 'The requested asset does not exist.'
      });
    }

    res.json({
      success: true,
      message: 'Asset retrieved successfully',
      data: { asset }
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve asset',
      message: error.message
    });
  }
});

router.post(
  '/',
  verifyToken,
  requireRole('admin', 'staff'),
  [
    body('asset_tag').trim().notEmpty().withMessage('Asset tag is required'),
    body('category').isIn(['IT', 'Non-IT']).withMessage('Category must be IT or Non-IT'),
    body('sub_type').trim().notEmpty().withMessage('Sub type is required'),
    body('serial_no').optional().trim(),
    body('mac_address').optional().trim(),
    body('purchase_id').optional().isUUID().withMessage('Invalid purchase ID'),
    body('assigned_to').optional().isUUID().withMessage('Invalid user ID'),
    body('location').optional().trim(),
    body('os_type').optional().trim(),
    body('os_version').optional().trim(),
    body('processor_name').optional().trim(),
    body('ram_gb').optional().isFloat({ min: 0 }).toFloat(),
    body('disk_gb').optional().isFloat({ min: 0 }).toFloat(),
    body('ms_office').optional().isBoolean().toBoolean(),
    body('software_list').optional().trim()
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

      const { asset_tag, category, sub_type, serial_no, mac_address, purchase_id, assigned_to, location } = req.body;

      const existingAsset = await models.Asset.findOne({
        where: { asset_tag },
        transaction
      });

      if (existingAsset) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: 'Asset already exists',
          message: 'An asset with this tag already exists.'
        });
      }

      const asset = await models.Asset.create(
        {
          asset_tag,
          category,
          sub_type,
          serial_no,
          mac_address,
          purchase_id,
          assigned_to,
          location,
          status: 'active'
        },
        { transaction }
      );

      const {
        os_type,
        os_version,
        product_id,
        os_activated,
        processor_name,
        manufacturer,
        cores,
        ram_gb,
        disk_gb,
        disk_model,
        ms_office,
        office_key,
        software_list,
        configuration,
        others
      } = req.body;

      const detail = await models.AssetDetail.create(
        {
          asset_id: asset.id,
          os_type,
          os_version,
          product_id,
          os_activated: os_activated || false,
          processor_name,
          manufacturer,
          cores,
          ram_gb,
          disk_gb,
          disk_model,
          ms_office: ms_office || false,
          office_key,
          software_list,
          configuration,
          others
        },
        { transaction }
      );

      await logAuditEvent(asset.id, req.user.id, 'Asset Created', null, {
        asset_tag,
        category,
        sub_type,
        status: 'active'
      });

      await transaction.commit();

      const createdAsset = await models.Asset.findByPk(asset.id, {
        include: [
          { association: 'detail' },
          { association: 'assignedUser', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: { asset: createdAsset }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create asset',
        message: error.message
      });
    }
  }
);

router.put(
  '/:id',
  verifyToken,
  requireRole('admin', 'staff'),
  [
    body('asset_tag').optional().trim(),
    body('category').optional().isIn(['IT', 'Non-IT']).withMessage('Category must be IT or Non-IT'),
    body('sub_type').optional().trim(),
    body('serial_no').optional().trim(),
    body('mac_address').optional().trim(),
    body('purchase_id').optional().isUUID().withMessage('Invalid purchase ID'),
    body('assigned_to').optional().isUUID().withMessage('Invalid user ID'),
    body('location').optional().trim(),
    body('os_type').optional().trim(),
    body('os_version').optional().trim(),
    body('processor_name').optional().trim(),
    body('manufacturer').optional().trim(),
    body('cores').optional().isInt({ min: 1 }).toInt(),
    body('ram_gb').optional().isFloat({ min: 0 }).toFloat(),
    body('disk_gb').optional().isFloat({ min: 0 }).toFloat(),
    body('disk_model').optional().trim(),
    body('ms_office').optional().isBoolean().toBoolean(),
    body('office_key').optional().trim(),
    body('software_list').optional().trim(),
    body('configuration').optional().trim()
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

      const asset = await models.Asset.findByPk(req.params.id, { transaction });

      if (!asset) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          message: 'The requested asset does not exist.'
        });
      }

      const oldAssetValues = asset.toJSON();

      const assetUpdates = {};
      const assetFields = ['asset_tag', 'category', 'sub_type', 'serial_no', 'mac_address', 'purchase_id', 'assigned_to', 'location'];

      assetFields.forEach(field => {
        if (req.body[field] !== undefined) {
          assetUpdates[field] = req.body[field];
        }
      });

      if (Object.keys(assetUpdates).length > 0) {
        await asset.update(assetUpdates, { transaction });
      }

      const detail = await models.AssetDetail.findOne({
        where: { asset_id: asset.id },
        transaction
      });

      const detailFields = [
        'os_type',
        'os_version',
        'product_id',
        'os_activated',
        'processor_name',
        'manufacturer',
        'cores',
        'ram_gb',
        'disk_gb',
        'disk_model',
        'ms_office',
        'office_key',
        'software_list',
        'configuration',
        'others'
      ];

      const detailUpdates = {};
      detailFields.forEach(field => {
        if (req.body[field] !== undefined) {
          detailUpdates[field] = req.body[field];
        }
      });

      if (Object.keys(detailUpdates).length > 0 && detail) {
        await detail.update(detailUpdates, { transaction });
      }

      const newAssetValues = asset.toJSON();
      const changedFields = {};

      Object.keys(oldAssetValues).forEach(key => {
        if (oldAssetValues[key] !== newAssetValues[key]) {
          changedFields[key] = {
            old: oldAssetValues[key],
            new: newAssetValues[key]
          };
        }
      });

      if (Object.keys(changedFields).length > 0 || Object.keys(detailUpdates).length > 0) {
        await logAuditEvent(asset.id, req.user.id, 'Asset Updated', oldAssetValues, {
          ...assetUpdates,
          ...detailUpdates
        });
      }

      await transaction.commit();

      const updatedAsset = await models.Asset.findByPk(asset.id, {
        include: [
          { association: 'detail' },
          { association: 'assignedUser', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.json({
        success: true,
        message: 'Asset updated successfully',
        data: { asset: updatedAsset }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update asset',
        message: error.message
      });
    }
  }
);

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const transaction = await models.sequelize.transaction();

  try {
    const asset = await models.Asset.findByPk(req.params.id, { transaction });

    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        message: 'The requested asset does not exist.'
      });
    }

    const oldStatus = asset.status;

    await asset.update({ status: 'disposed' }, { transaction });

    await logAuditEvent(asset.id, req.user.id, 'Asset Disposed', { status: oldStatus }, { status: 'disposed' });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Asset disposed successfully',
      data: { asset }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dispose asset',
      message: error.message
    });
  }
});

router.patch(
  '/:id/assign',
  verifyToken,
  requireRole('admin', 'staff'),
  [
    body('assigned_to').isUUID().withMessage('Valid user ID is required')
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

      const asset = await models.Asset.findByPk(req.params.id, {
        include: [{ association: 'assignedUser', attributes: ['id', 'name', 'email'] }],
        transaction
      });

      if (!asset) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          message: 'The requested asset does not exist.'
        });
      }

      const user = await models.User.findByPk(req.body.assigned_to, { transaction });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'The specified user does not exist.'
        });
      }

      const oldAssignedTo = asset.assigned_to;

      await asset.update({ assigned_to: req.body.assigned_to }, { transaction });

      const oldUser = oldAssignedTo ? await models.User.findByPk(oldAssignedTo) : null;

      await logAuditEvent(
        asset.id,
        req.user.id,
        'Asset Assigned',
        { assigned_to: oldAssignedTo, assigned_user: oldUser?.name },
        { assigned_to: req.body.assigned_to, assigned_user: user.name }
      );

      await transaction.commit();

      const updatedAsset = await models.Asset.findByPk(asset.id, {
        include: [{ association: 'assignedUser', attributes: ['id', 'name', 'email'] }]
      });

      res.json({
        success: true,
        message: 'Asset assigned successfully',
        data: { asset: updatedAsset }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Assign asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign asset',
        message: error.message
      });
    }
  }
);

module.exports = router;
