const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const assetTagGenerator = require('../services/assetTagGenerator');

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

// Generate Asset Tag Endpoint
router.post(
  '/generate-tag',
  [
    body('category').isIn(['IT', 'Non-IT']).withMessage('Category must be IT or Non-IT'),
    body('sub_type').trim().notEmpty().withMessage('Sub type is required')
  ],
  async (req, res) => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🏷️  POST /api/assets/generate-tag - Generate Asset Tag');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Request Body:', req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation Errors:', errors.array());
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { category, sub_type } = req.body;

      // Generate the asset tag
      const assetTag = await assetTagGenerator.generateAssetTag(models, category, sub_type);

      console.log('✓ Asset tag generated:', assetTag);
      console.log('═══════════════════════════════════════════════════════');

      res.json({
        success: true,
        message: 'Asset tag generated successfully',
        data: {
          asset_tag: assetTag,
          category,
          sub_type
        }
      });
    } catch (error) {
      console.error('❌ Error generating asset tag:', error.message);
      console.error('═══════════════════════════════════════════════════════');

      res.status(400).json({
        success: false,
        error: 'Failed to generate asset tag',
        message: error.message
      });
    }
  }
);

router.get(
  '/',
  // verifyToken,  // Commented for development - remove in production
  [
    query('category').optional().isIn(['IT', 'Non-IT']).withMessage('Invalid category'),
    query('sub_type').optional().trim(),
    query('status').optional().isIn(['active', 'inactive', 'retired']).withMessage('Invalid status'),
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
            'other_applications_installed',
            'software_list'
          ]
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

      try {
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
      } catch (dbError) {
        console.warn('Database connection failed, returning mock data:', dbError.message);

        // Return mock data when database is unavailable
        const mockAssets = [
          {
            id: '1',
            asset_tag: 'COMP-001',
            asset_name: 'Desktop Computer',
            category: 'IT',
            sub_type: 'Computer',
            status: 'active',
            assigned_to: 'Sadhika TS',
            detail: { serial_no: 'DELL784512', mac_address: '00:1A:2B:3C:4D:5E' }
          },
          {
            id: '2',
            asset_tag: 'LAP-001',
            asset_name: 'HP Laptop',
            category: 'IT',
            sub_type: 'Laptop',
            status: 'active',
            assigned_to: 'Arun Kumar',
            detail: { serial_no: 'HP456789123', mac_address: '00:AA:BB:CC:DD:EE' }
          },
          {
            id: '3',
            asset_tag: 'PRT-001',
            asset_name: 'HP Printer',
            category: 'IT',
            sub_type: 'Printer',
            status: 'active',
            detail: { serial_no: 'HPPRT789456' }
          },
          {
            id: '4',
            asset_tag: 'RTR-001',
            asset_name: 'Cisco Router',
            category: 'IT',
            sub_type: 'Router',
            status: 'active',
            detail: { serial_no: 'CISCO456123', mac_address: '11:22:33:44:55:66' }
          },
          {
            id: '5',
            asset_tag: 'IT-OTH-001',
            asset_name: 'Biometric Attendance Device',
            category: 'IT',
            sub_type: 'Other',
            status: 'active',
            detail: { serial_no: 'BIO123456' }
          }
        ];

        res.json({
          success: true,
          message: 'Assets retrieved (Mock Data - Database unavailable)',
          data: {
            assets: mockAssets,
            pagination: {
              total: mockAssets.length,
              page: 1,
              limit: 10,
              totalPages: 1
            }
          }
        });
      }
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

router.get('/:id', /* verifyToken, */ async (req, res) => {  // DISABLED FOR DEVELOPMENT
  try {
    console.log(`📋 GET /api/assets/${req.params.id} - Fetch Asset Detail`);
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
            'other_applications_installed',
            'other_applications_description',
            'software_list',
            'configuration',
            'others'
          ]
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
  // verifyToken,  // DISABLED FOR DEVELOPMENT - Remove comment for production
  // requireRole('admin', 'staff'),  // DISABLED FOR DEVELOPMENT - Remove comment for production
  [
    // Asset tag is optional - will be auto-generated based on category and sub_type
    body('asset_tag').optional({ checkFalsy: true }).trim(),
    body('asset_name').trim().notEmpty().withMessage('Asset name is required'),
    body('category').isIn(['IT', 'Non-IT']).withMessage('Category must be IT or Non-IT'),
    body('sub_type').trim().notEmpty().withMessage('Sub type is required'),
    body('other_subtype_description').optional({ checkFalsy: true }).trim(),
    body('serial_no').optional({ checkFalsy: true }).trim(),
    // MAC Address only required for IT assets, but optional for all
    body('mac_address').optional({ checkFalsy: true }).trim(),
    body('status').optional({ checkFalsy: true }).isIn(['active', 'inactive', 'retired']).withMessage('Invalid status'),
    body('purchase_id').optional({ checkFalsy: true }).isUUID().withMessage('Invalid purchase ID'),
    // Assigned To validation: must be valid if provided, and only allowed for active assets
    body('assigned_to')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 1 })
      .withMessage('Invalid username')
      .custom((value, { req }) => {
        // If assigned_to is provided but status is not active, reject it
        if (value && req.body.status && req.body.status !== 'active') {
          throw new Error(`Cannot assign assets with status "${req.body.status}". Only active assets can be assigned.`);
        }
        return true;
      }),
    body('location').optional({ checkFalsy: true }).trim(),
    body('os_type').optional({ checkFalsy: true }).trim(),
    body('os_version').optional({ checkFalsy: true }).trim(),
    body('product_id').optional({ checkFalsy: true }).trim(),
    body('os_activated').optional({ checkFalsy: true }).isBoolean().toBoolean(),
    body('processor_name').optional({ checkFalsy: true }).trim(),
    body('manufacturer').optional({ checkFalsy: true }).trim(),
    body('cores').optional({ checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('ram_gb').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('disk_gb').optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('disk_model').optional({ checkFalsy: true }).trim(),
    body('ms_office').optional({ checkFalsy: true }).isBoolean().toBoolean(),
    body('office_key').optional({ checkFalsy: true }).trim(),
    body('other_applications_installed').optional({ checkFalsy: true }).isBoolean().toBoolean(),
    body('other_applications_description').optional({ checkFalsy: true }).trim(),
    body('software_list').optional({ checkFalsy: true }).trim(),
    body('configuration').optional({ checkFalsy: true }).trim(),
    body('others').optional({ checkFalsy: true }).trim()
  ],
  async (req, res) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 POST /api/assets - Create Asset');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const transaction = await models.sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation Errors:', errors.array());
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      let { asset_tag, asset_name, category, sub_type, other_subtype_description, serial_no, mac_address, purchase_id, assigned_to, location, status = 'active' } = req.body;

      // Auto-generate asset tag if not provided
      if (!asset_tag) {
        console.log('Generating asset tag for category:', category, 'sub_type:', sub_type);
        try {
          asset_tag = await assetTagGenerator.generateAssetTag(models, category, sub_type);
          console.log('✓ Auto-generated asset tag:', asset_tag);
        } catch (tagError) {
          console.error('❌ Failed to generate asset tag:', tagError.message);
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Failed to generate asset tag',
            message: tagError.message
          });
        }
      } else {
        // Validate provided asset tag format
        try {
          const isValidFormat = assetTagGenerator.validateAssetTagFormat(asset_tag, category, sub_type);
          if (!isValidFormat) {
            console.warn('⚠️ Provided asset tag format may not match expected pattern');
          }
        } catch (err) {
          console.warn('⚠️ Could not validate asset tag format:', err.message);
        }
      }

      // BUSINESS RULE: MAC Address should only be stored for IT assets
      if (category === 'Non-IT' && mac_address) {
        console.warn('⚠️ MAC Address provided for Non-IT asset - will be ignored');
      }

      // BUSINESS RULE: assigned_to can only be set for active assets
      if (assigned_to && status !== 'active') {
        console.error('❌ Attempted to assign non-active asset:', { status, assigned_to });
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: `Cannot assign assets with status "${status}". Only active assets can be assigned.`
        });
      }

      // Check for duplicate asset tag
      const existingAsset = await models.Asset.findOne({
        where: { asset_tag },
        transaction
      });

      if (existingAsset) {
        console.error('❌ Asset tag already exists:', asset_tag);
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: 'Asset already exists',
          message: `An asset with tag "${asset_tag}" already exists.`
        });
      }

      console.log('✓ Validation passed');
      console.log('Creating asset:', { asset_tag, asset_name, category, sub_type, status });

      // Prepare asset data with business rules applied
      const assetData = {
        asset_tag,
        asset_name,
        category,
        sub_type,
        other_subtype_description,
        serial_no,
        // Only save MAC address for IT assets
        mac_address: category === 'IT' ? mac_address : null,
        purchase_id,
        // Only save assigned_to for active assets
        assigned_to: status === 'active' ? assigned_to : null,
        location,
        status
      };

      const asset = await models.Asset.create(assetData, { transaction });

      console.log('✓ Asset created:', { id: asset.id, asset_tag });

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
        other_applications_installed,
        other_applications_description,
        software_list,
        configuration,
        others
      } = req.body;

      console.log('Creating asset detail:', { asset_id: asset.id, os_type, processor_name });

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
          other_applications_installed: other_applications_installed || false,
          other_applications_description,
          software_list,
          configuration,
          others
        },
        { transaction }
      );

      console.log('✓ Asset detail created:', { id: detail.id });

      // Log audit (without requiring user auth for development)
      if (req.user?.id) {
        await logAuditEvent(asset.id, req.user.id, 'Asset Created', null, {
          asset_tag,
          asset_name,
          category,
          sub_type,
          status
        });
        console.log('✓ Audit log created');
      }

      await transaction.commit();
      console.log('✓ Transaction committed');

      const createdAsset = await models.Asset.findByPk(asset.id, {
        include: [
          { association: 'detail' }
        ]
      });

      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ Asset created successfully');
      console.log('═══════════════════════════════════════════════════════');

      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: { id: createdAsset.id, asset: createdAsset }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ Create asset error:', error.message);
      console.error('Stack:', error.stack);
      console.error('═══════════════════════════════════════════════════════');
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
  /* verifyToken, */
  /* requireRole('admin', 'staff'), */
  [
    body('asset_tag').optional().trim(),
    body('category').optional().isIn(['IT', 'Non-IT']).withMessage('Category must be IT or Non-IT'),
    body('sub_type').optional().trim(),
    body('other_subtype_description').optional().trim(),
    body('serial_no').optional().trim(),
    body('mac_address').optional().trim(),
    body('purchase_id').optional().isUUID().withMessage('Invalid purchase ID'),
    body('status').optional().isIn(['active', 'inactive', 'retired']).withMessage('Invalid status'),
    // Assigned To validation: must be valid if provided, and only allowed for active assets
    body('assigned_to')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 1 })
      .withMessage('Invalid username')
      .custom((value, { req }) => {
        // If assigned_to is provided but status is not active, reject it
        if (value && req.body.status && req.body.status !== 'active') {
          throw new Error(`Cannot assign assets with status "${req.body.status}". Only active assets can be assigned.`);
        }
        return true;
      }),
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
    body('other_applications_installed').optional().isBoolean().toBoolean(),
    body('other_applications_description').optional().trim(),
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

      // Get current category or use the one being updated
      const currentCategory = req.body.category || asset.category;
      const currentStatus = req.body.status || asset.status;

      // BUSINESS RULE: Check if trying to assign non-active asset
      if (req.body.assigned_to && currentStatus !== 'active') {
        console.error('❌ Attempted to assign non-active asset:', { status: currentStatus, assigned_to: req.body.assigned_to });
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: `Cannot assign assets with status "${currentStatus}". Only active assets can be assigned.`
        });
      }

      const assetUpdates = {};
      const assetFields = ['asset_tag', 'category', 'sub_type', 'other_subtype_description', 'serial_no', 'mac_address', 'purchase_id', 'assigned_to', 'location', 'status'];

      assetFields.forEach(field => {
        if (req.body[field] !== undefined) {
          // BUSINESS RULE: Don't save MAC address for Non-IT assets
          if (field === 'mac_address' && currentCategory === 'Non-IT') {
            console.warn('⚠️ MAC Address provided for Non-IT asset - will not be saved');
            assetUpdates[field] = null;
          }
          // BUSINESS RULE: Don't save assigned_to for non-active assets
          else if (field === 'assigned_to' && currentStatus !== 'active') {
            console.warn(`⚠️ assigned_to provided for ${currentStatus} asset - will not be saved`);
            assetUpdates[field] = null;
          }
          // BUSINESS RULE: If status changes to non-active, clear assigned_to
          else if (field === 'status' && req.body.status !== 'active' && asset.assigned_to) {
            assetUpdates[field] = req.body[field];
            assetUpdates['assigned_to'] = null;
            console.log(`Status changed to ${req.body.status} - clearing assigned_to`);
          } else {
            assetUpdates[field] = req.body[field];
          }
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
        'other_applications_installed',
        'other_applications_description',
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

      if ((Object.keys(changedFields).length > 0 || Object.keys(detailUpdates).length > 0) && req.user?.id) {
        await logAuditEvent(asset.id, req.user.id, 'Asset Updated', oldAssetValues, {
          ...assetUpdates,
          ...detailUpdates
        });
      }

      await transaction.commit();

      const updatedAsset = await models.Asset.findByPk(asset.id, {
        include: [
          { association: 'detail' }
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

router.delete('/:id', /* verifyToken, */ /* requireRole('admin'), */ async (req, res) => {
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

    if (req.user?.id) {
      await logAuditEvent(asset.id, req.user.id, 'Asset Disposed', { status: oldStatus }, { status: 'disposed' });
    }

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
  /* verifyToken, */
  /* requireRole('admin', 'staff'), */
  [
    body('assigned_to').trim().isLength({ min: 1 }).withMessage('Valid username is required')
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

      const assignedToUsername = req.body.assigned_to.trim();

      if (!assignedToUsername) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Invalid username',
          message: 'Username is required.'
        });
      }

      const oldAssignedTo = asset.assigned_to;

      await asset.update({ assigned_to: assignedToUsername }, { transaction });

      await logAuditEvent(
        asset.id,
        req.user?.id || 'system',
        'Asset Assigned',
        { assigned_to: oldAssignedTo },
        { assigned_to: assignedToUsername }
      );

      await transaction.commit();

      const updatedAsset = await models.Asset.findByPk(asset.id);

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
