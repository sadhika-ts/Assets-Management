const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const models = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard - Quick overview of system
router.get('/dashboard', /* verifyToken, */ async (req, res) => {  // Commented for development - remove in production
  try {
    try {
      const totalAssets = await models.Asset.count();
      const itAssets = await models.Asset.count({ where: { category: 'IT' } });
      const nonItAssets = await models.Asset.count({ where: { category: 'Non-IT' } });
      const activeAssets = await models.Asset.count({ where: { status: 'active' } });
      const inactiveAssets = await models.Asset.count({ where: { status: 'inactive' } });
      const disposedAssets = await models.Asset.count({ where: { status: 'disposed' } });

      // Expiring contracts (next 30 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringContracts = await models.Contract.findAll({
        where: {
          status: 'active',
          active_till: {
            [Op.gte]: today,
            [Op.lte]: thirtyDaysFromNow
          }
        },
        order: [['active_till', 'ASC']]
      });

      // Recent assets (last 5 added)
      const recentAssets = await models.Asset.findAll({
        attributes: ['id', 'asset_tag', 'category', 'sub_type', 'status', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 5,
        include: [
          {
            association: 'detail',
            attributes: ['os_type', 'processor_name']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          total_assets: totalAssets,
          it_assets: itAssets,
          non_it_assets: nonItAssets,
          active: activeAssets,
          inactive: inactiveAssets,
          disposed: disposedAssets,
          expiring_contracts: expiringContracts,
          recent_assets: recentAssets
        }
      });
    } catch (dbError) {
      console.warn('Database unavailable, returning mock dashboard data:', dbError.message);

      res.json({
        success: true,
        message: 'Dashboard data (Mock Data - Database unavailable)',
        data: {
          totalAssets: 5,
          itAssets: 5,
          nonItAssets: 0,
          activeContracts: 2,
          expiringContracts: 0,
          purchasedThisMonth: 2,
          underWarranty: 2,
          assignedAssets: 2,
          inStock: 3,
          needingMaintenance: 0
        }
      });
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
      message: error.message
    });
  }
});

// Assets by sub_type with count
router.get(
  '/by-category',
  verifyToken,
  async (req, res) => {
    try {
      const byCategory = await models.Asset.findAll({
        attributes: [
          'sub_type',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['sub_type'],
        order: [[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'DESC']],
        raw: true
      });

      res.json({
        success: true,
        message: 'Assets by category retrieved successfully',
        data: {
          total: byCategory.reduce((sum, item) => sum + parseInt(item.count), 0),
          breakdown: byCategory
        }
      });
    } catch (error) {
      console.error('Assets by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assets by category',
        message: error.message
      });
    }
  }
);

// Assets by status with count
router.get(
  '/by-status',
  verifyToken,
  async (req, res) => {
    try {
      const byStatus = await models.Asset.findAll({
        attributes: [
          'status',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        order: [[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'DESC']],
        raw: true
      });

      res.json({
        success: true,
        message: 'Assets by status retrieved successfully',
        data: {
          total: byStatus.reduce((sum, item) => sum + parseInt(item.count), 0),
          breakdown: byStatus
        }
      });
    } catch (error) {
      console.error('Assets by status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assets by status',
        message: error.message
      });
    }
  }
);

// OS Activation status count
router.get(
  '/os-activation',
  verifyToken,
  async (req, res) => {
    try {
      const osActivation = await models.AssetDetail.findAll({
        attributes: [
          'os_activated',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['os_activated'],
        raw: true
      });

      const activated = osActivation.find(item => item.os_activated === true)?.count || 0;
      const notActivated = osActivation.find(item => item.os_activated === false)?.count || 0;

      res.json({
        success: true,
        message: 'OS activation status retrieved successfully',
        data: {
          total: parseInt(activated) + parseInt(notActivated),
          activated: parseInt(activated),
          not_activated: parseInt(notActivated)
        }
      });
    } catch (error) {
      console.error('OS activation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve OS activation status',
        message: error.message
      });
    }
  }
);

// MS Office installation count
router.get(
  '/ms-office',
  verifyToken,
  async (req, res) => {
    try {
      const msOffice = await models.AssetDetail.findAll({
        attributes: [
          'ms_office',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        group: ['ms_office'],
        raw: true
      });

      const installed = msOffice.find(item => item.ms_office === true)?.count || 0;
      const notInstalled = msOffice.find(item => item.ms_office === false)?.count || 0;

      res.json({
        success: true,
        message: 'MS Office status retrieved successfully',
        data: {
          total: parseInt(installed) + parseInt(notInstalled),
          installed: parseInt(installed),
          not_installed: parseInt(notInstalled)
        }
      });
    } catch (error) {
      console.error('MS Office error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve MS Office status',
        message: error.message
      });
    }
  }
);

// Audit log - recent 50 entries with user and asset info
router.get(
  '/audit-log',
  verifyToken,
  async (req, res) => {
    try {
      const auditLogs = await models.AuditLog.findAll({
        attributes: [
          'id',
          'asset_id',
          'action',
          'old_value',
          'new_value',
          'changed_at'
        ],
        include: [
          {
            association: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            association: 'asset',
            attributes: ['id', 'asset_tag', 'category', 'sub_type']
          }
        ],
        order: [['changed_at', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: {
          total: auditLogs.length,
          logs: auditLogs
        }
      });
    } catch (error) {
      console.error('Audit log error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit logs',
        message: error.message
      });
    }
  }
);

// Export all assets as JSON (for CSV conversion on frontend)
router.get(
  '/export',
  verifyToken,
  async (req, res) => {
    try {
      const assets = await models.Asset.findAll({
        attributes: [
          'id',
          'asset_tag',
          'category',
          'sub_type',
          'status',
          'serial_no',
          'mac_address',
          'location',
          'assigned_to',
          'created_at'
        ],
        include: [
          {
            association: 'detail',
            attributes: [
              'os_type',
              'os_version',
              'processor_name',
              'manufacturer',
              'cores',
              'ram_gb',
              'disk_gb',
              'ms_office',
              'software_list'
            ]
          },
          {
            association: 'assignedUser',
            attributes: ['id', 'name', 'email']
          },
          {
            association: 'purchase',
            attributes: ['id', 'purchase_id', 'vendor_name', 'purchase_date', 'total_amount']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Format for CSV export
      const exportData = assets.map(asset => ({
        asset_tag: asset.asset_tag,
        category: asset.category,
        sub_type: asset.sub_type,
        status: asset.status,
        serial_no: asset.serial_no || '',
        mac_address: asset.mac_address || '',
        location: asset.location || '',
        assigned_to: asset.assignedUser?.name || '',
        os_type: asset.detail?.os_type || '',
        os_version: asset.detail?.os_version || '',
        processor_name: asset.detail?.processor_name || '',
        manufacturer: asset.detail?.manufacturer || '',
        cores: asset.detail?.cores || '',
        ram_gb: asset.detail?.ram_gb || '',
        disk_gb: asset.detail?.disk_gb || '',
        ms_office: asset.detail?.ms_office ? 'Yes' : 'No',
        software_list: asset.detail?.software_list || '',
        vendor_name: asset.purchase?.vendor_name || '',
        purchase_date: asset.purchase?.purchase_date || '',
        total_amount: asset.purchase?.total_amount || '',
        created_at: asset.created_at
      }));

      res.json({
        success: true,
        message: 'Assets exported successfully',
        data: exportData
      });
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export assets',
        message: error.message
      });
    }
  }
);

module.exports = router;
