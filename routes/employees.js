const express = require('express');
const models = require('../models');

const router = express.Router();

const DEFAULT_EMPLOYEES = [
  'Prakash', 'Vaidyanathan', 'Hema Priya', 'Leojudej', 'Srinivasan.r',
  'Ratchika', 'Priyanka.s', 'Kishore', 'Manjula.M', 'Siyasamy R',
  'Geetha', 'Leelavathi.m', 'Vaishnavi', 'Jyappan A', 'Jeevitha.R',
  'Sree Sree', 'Siddhartha Gho'
];

// Seed defaults if table is empty
const seedIfEmpty = async () => {
  const count = await models.Employee.count();
  if (count === 0) {
    await models.Employee.bulkCreate(DEFAULT_EMPLOYEES.map(name => ({ name })));
  }
};

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    await seedIfEmpty();
    const employees = await models.Employee.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: { employees } });
  } catch (err) {
    console.error('List employees error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch employees.' });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    const existing = await models.Employee.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This name already exists.' });
    }
    const employee = await models.Employee.create({ name: name.trim() });
    res.status(201).json({ success: true, data: { employee } });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ success: false, message: 'Failed to create employee.' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    const employee = await models.Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    await employee.destroy();
    res.json({ success: true, message: 'Employee deleted.' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete employee.' });
  }
});

module.exports = router;
