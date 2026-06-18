const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const models = require('../models');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { username, password } = req.body;

      const user = await models.User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }

      res.json({
        success: true,
        data: { user: { id: user.id, username: user.username, role: user.role } }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Login failed.' });
    }
  }
);

// PUT /api/auth/update-credentials
router.put(
  '/update-credentials',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { username, currentPassword, newPassword } = req.body;

      const user = await models.User.findOne({ where: { username } })
        || await models.User.findOne({ where: {} });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await user.update({ username, password_hash: hash });

      res.json({ success: true, message: 'Credentials updated successfully.' });
    } catch (err) {
      console.error('Update credentials error:', err);
      res.status(500).json({ success: false, message: 'Failed to update credentials.' });
    }
  }
);

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: ['id', 'username', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'ASC']],
    });
    res.json({ success: true, data: { users } });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// POST /api/auth/users
router.post(
  '/users',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'staff', 'viewer']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { username, password, name, email, role } = req.body;

      const existing = await models.User.findOne({ where: { username } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        username,
        password_hash,
        name: name || null,
        email: email || null,
        role: role || 'staff',
      });

      res.status(201).json({
        success: true,
        data: { user: { id: user.id, username: user.username, role: user.role } },
        message: 'User created successfully.',
      });
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ success: false, message: 'Failed to create user.' });
    }
  }
);

// DELETE /api/auth/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const total = await models.User.count();
    if (total <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the last user.' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;
