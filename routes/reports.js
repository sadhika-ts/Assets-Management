const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op, fn, col, literal } = require('sequelize');
const models = require('../models');

const router = express.Router();

// Helper: safe count
const safeCount = async (model, where = {}) => {
  try { return await model.count({ where }); } catch { return 0; }
};

// Helper: date range where clause
const dateWhere = (field, from, to) => {
  if (!from && !to) return {};
  const clause = {};
  if (from) clause[Op.gte] = new Date(from);
  if (to) clause[Op.lte] = new Date(to);
  return { [field]: clause };
};

// GET /reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);

    const [
      totalAssets, activeAssets, inactiveAssets, maintenanceAssets,
      assignedAssets, unassignedAssets,
      totalContracts, activeContracts, expiredContracts, expiringContracts,
      totalPurchases
    ] = await Promise.all([
      safeCount(models.Asset),
      safeCount(models.Asset, { status: 'active' }),
      safeCount(models.Asset, { status: 'inactive' }),
      safeCount(models.Asset, { status: 'maintenance' }),
      models.Asset.count({ where: { assigned_to: { [Op.not]: null, [Op.ne]: '' } } }).catch(() => 0),
      models.Asset.count({ where: { [Op.or]: [{ assigned_to: null }, { assigned_to: '' }] } }).catch(() => 0),
      safeCount(models.Contract),
      safeCount(models.Contract, { status: 'active' }),
      safeCount(models.Contract, { status: 'expired' }),
      safeCount(models.Contract, { status: 'active', active_till: { [Op.gte]: today, [Op.lte]: in30 } }),
      models.Purchase.findAll({ attributes: [[fn('SUM', col('total_amount')), 'total']], raw: true }).catch(() => [{ total: 0 }])
    ]);

    const totalSpent = parseFloat(totalPurchases[0]?.total) || 0;
    const utilization = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalAssets, activeAssets, inactiveAssets, maintenanceAssets,
        assignedAssets, unassignedAssets,
        totalContracts, activeContracts, expiredContracts, expiringContracts,
        totalSpent, utilization
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /reports/assets
router.get('/assets', async (req, res) => {
  try {
    const { from, to, category, status } = req.query;

    const where = {};
    if (category && category !== 'all') where.category = category;
    if (status && status !== 'all') where.status = status;
    if (from || to) {
      const dw = dateWhere('created_at', from, to);
      Object.assign(where, dw);
    }

    // Category-wise distribution
    const categoryWise = await models.Asset.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      where,
      group: ['category'],
      raw: true
    });

    // Sub-type distribution
    const subTypeWise = await models.Asset.findAll({
      attributes: ['sub_type', [fn('COUNT', col('id')), 'count']],
      where,
      group: ['sub_type'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    // Status distribution
    const statusWise = await models.Asset.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      where: category && category !== 'all' ? { category } : {},
      group: ['status'],
      raw: true
    });

    // Assigned vs unassigned
    const assignedCount = await models.Asset.count({
      where: { ...where, assigned_to: { [Op.not]: null, [Op.ne]: '' } }
    });
    const totalCount = await models.Asset.count({ where });
    const unassignedCount = totalCount - assignedCount;

    // Department (assigned_to) wise
    const deptWise = await models.Asset.findAll({
      attributes: ['assigned_to', [fn('COUNT', col('id')), 'count']],
      where: { ...where, assigned_to: { [Op.not]: null, [Op.ne]: '' } },
      group: ['assigned_to'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Recently added
    const recentlyAdded = await models.Asset.findAll({
      attributes: ['asset_tag', 'asset_name', 'category', 'sub_type', 'status', 'assigned_to', 'created_at'],
      where,
      order: [['created_at', 'DESC']],
      limit: 10,
      raw: true
    });

    // Monthly additions trend
    const allAssets = await models.Asset.findAll({
      attributes: ['created_at'],
      where,
      raw: true
    });
    const monthlyMap = {};
    allAssets.forEach(a => {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[key]) monthlyMap[key] = { month: label, count: 0 };
      monthlyMap[key].count++;
    });
    const monthlyTrend = Object.values(monthlyMap).sort((a,b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: {
        total: totalCount,
        assigned: assignedCount,
        unassigned: unassignedCount,
        categoryWise: categoryWise.map(r => ({ name: r.category, value: parseInt(r.count) })),
        subTypeWise: subTypeWise.map(r => ({ name: r.sub_type, value: parseInt(r.count) })),
        statusWise: statusWise.map(r => ({ name: r.status, value: parseInt(r.count) })),
        deptWise: deptWise.map(r => ({ name: r.assigned_to, value: parseInt(r.count) })),
        monthlyTrend,
        recentlyAdded
      }
    });
  } catch (error) {
    console.error('Asset report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /reports/purchases
router.get('/purchases', async (req, res) => {
  try {
    const { from, to, vendor } = req.query;
    const where = {};
    if (vendor && vendor !== 'all') where.vendor_name = vendor;
    if (from || to) Object.assign(where, dateWhere('purchase_date', from, to));

    const allPurchases = await models.Purchase.findAll({ where, raw: true });

    // Monthly trend
    const monthlyMap = {};
    allPurchases.forEach(p => {
      const d = new Date(p.purchase_date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[key]) monthlyMap[key] = { month: label, amount: 0, count: 0 };
      monthlyMap[key].amount += parseFloat(p.total_amount) || 0;
      monthlyMap[key].count++;
    });
    const monthly = Object.values(monthlyMap).sort((a,b) => a.month.localeCompare(b.month));

    // Vendor-wise
    const vendorMap = {};
    allPurchases.forEach(p => {
      if (!vendorMap[p.vendor_name]) vendorMap[p.vendor_name] = { name: p.vendor_name, amount: 0, count: 0 };
      vendorMap[p.vendor_name].amount += parseFloat(p.total_amount) || 0;
      vendorMap[p.vendor_name].count++;
    });
    const vendorWise = Object.values(vendorMap).sort((a,b) => b.amount - a.amount).slice(0, 10);

    // Status-wise
    const statusMap = {};
    allPurchases.forEach(p => {
      if (!statusMap[p.status]) statusMap[p.status] = { name: p.status, count: 0, amount: 0 };
      statusMap[p.status].count++;
      statusMap[p.status].amount += parseFloat(p.total_amount) || 0;
    });
    const statusWise = Object.values(statusMap);

    // Top purchases by amount
    const topPurchases = [...allPurchases]
      .sort((a,b) => parseFloat(b.total_amount) - parseFloat(a.total_amount))
      .slice(0, 10)
      .map(p => ({
        purchase_id: p.purchase_id,
        vendor_name: p.vendor_name,
        total_amount: parseFloat(p.total_amount),
        purchase_date: p.purchase_date,
        status: p.status
      }));

    const totalAmount = allPurchases.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0);

    res.json({
      success: true,
      data: {
        total: allPurchases.length,
        totalAmount,
        monthly,
        vendorWise,
        statusWise,
        topPurchases
      }
    });
  } catch (error) {
    console.error('Purchase report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /reports/contracts
router.get('/contracts', async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (from || to) Object.assign(where, dateWhere('active_from', from, to));

    const today = new Date(); today.setHours(0,0,0,0);
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
    const in60 = new Date(today); in60.setDate(in60.getDate() + 60);
    const in90 = new Date(today); in90.setDate(in90.getDate() + 90);

    const allContracts = await models.Contract.findAll({ where, raw: true });

    // Status-wise
    const statusMap = {};
    allContracts.forEach(c => {
      if (!statusMap[c.status]) statusMap[c.status] = { name: c.status, count: 0, value: 0 };
      statusMap[c.status].count++;
      statusMap[c.status].value += parseFloat(c.contract_value) || 0;
    });

    // Expiry buckets
    const expiring30 = allContracts.filter(c => {
      const d = new Date(c.active_till);
      return d >= today && d <= in30 && c.status !== 'expired';
    });
    const expiring60 = allContracts.filter(c => {
      const d = new Date(c.active_till);
      return d > in30 && d <= in60 && c.status !== 'expired';
    });
    const expiring90 = allContracts.filter(c => {
      const d = new Date(c.active_till);
      return d > in60 && d <= in90 && c.status !== 'expired';
    });

    // Vendor-wise
    const vendorMap = {};
    allContracts.forEach(c => {
      if (!vendorMap[c.vendor_name]) vendorMap[c.vendor_name] = { name: c.vendor_name, count: 0, value: 0 };
      vendorMap[c.vendor_name].count++;
      vendorMap[c.vendor_name].value += parseFloat(c.contract_value) || 0;
    });
    const vendorWise = Object.values(vendorMap).sort((a,b) => b.value - a.value);

    const totalValue = allContracts.reduce((s,c) => s + (parseFloat(c.contract_value) || 0), 0);

    res.json({
      success: true,
      data: {
        total: allContracts.length,
        totalValue,
        statusWise: Object.values(statusMap),
        expiring30: expiring30.map(c => ({ ...c, contract_value: parseFloat(c.contract_value) })),
        expiring60: expiring60.map(c => ({ ...c, contract_value: parseFloat(c.contract_value) })),
        expiring90: expiring90.map(c => ({ ...c, contract_value: parseFloat(c.contract_value) })),
        vendorWise,
        allContracts: allContracts.map(c => ({ ...c, contract_value: parseFloat(c.contract_value) || 0 }))
      }
    });
  } catch (error) {
    console.error('Contract report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /reports/maintenance (assets under maintenance)
router.get('/maintenance', async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { status: 'maintenance' };
    if (from || to) Object.assign(where, dateWhere('updated_at', from, to));

    const assets = await models.Asset.findAll({
      attributes: ['asset_tag', 'asset_name', 'category', 'sub_type', 'assigned_to', 'updated_at'],
      where,
      order: [['updated_at', 'DESC']],
      raw: true
    });

    // Sub-type wise maintenance breakdown
    const subTypeMap = {};
    assets.forEach(a => {
      if (!subTypeMap[a.sub_type]) subTypeMap[a.sub_type] = 0;
      subTypeMap[a.sub_type]++;
    });
    const subTypeWise = Object.entries(subTypeMap).map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count);

    // Category-wise
    const categoryMap = {};
    assets.forEach(a => {
      if (!categoryMap[a.category]) categoryMap[a.category] = 0;
      categoryMap[a.category]++;
    });
    const categoryWise = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        total: assets.length,
        assets,
        subTypeWise,
        categoryWise
      }
    });
  } catch (error) {
    console.error('Maintenance report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /reports/frequently-requested
router.get('/frequently-requested', async (req, res) => {
  try {
    // Most assigned sub_types
    const mostAssigned = await models.Asset.findAll({
      attributes: ['sub_type', 'category', [fn('COUNT', col('id')), 'count']],
      where: { assigned_to: { [Op.not]: null, [Op.ne]: '' } },
      group: ['sub_type', 'category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Per-user asset counts
    const perUser = await models.Asset.findAll({
      attributes: ['assigned_to', [fn('COUNT', col('id')), 'count']],
      where: { assigned_to: { [Op.not]: null, [Op.ne]: '' } },
      group: ['assigned_to'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Category demand
    const categoryDemand = await models.Asset.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      where: { assigned_to: { [Op.not]: null, [Op.ne]: '' } },
      group: ['category'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        mostAssigned: mostAssigned.map(r => ({ name: r.sub_type, category: r.category, count: parseInt(r.count) })),
        perUser: perUser.map(r => ({ name: r.assigned_to, count: parseInt(r.count) })),
        categoryDemand: categoryDemand.map(r => ({ name: r.category, count: parseInt(r.count) }))
      }
    });
  } catch (error) {
    console.error('Frequently requested error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
