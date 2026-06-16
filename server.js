require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Import Routes
const assetsRoutes = require('./routes/assets');
const purchasesRoutes = require('./routes/purchases');
const contractsRoutes = require('./routes/contracts');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');
const warrantiesRoutes = require('./routes/warranties');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date(),
    database: 'Connected'
  });
});

// API Routes
app.use('/api/assets', assetsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/warranties', warrantiesRoutes);

// 404 handler - MUST be last
app.use((req, res) => {
  console.error(`[ERROR] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`✅ Backend Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 CORS Enabled: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`═══════════════════════════════════════════════════════\n`);
  console.log(`Available Routes:`);
  console.log(`  ✓ GET    /api/health`);
  console.log(`  ✓ GET    /api/assets`);
  console.log(`  ✓ POST   /api/assets`);
  console.log(`  ✓ GET    /api/purchases`);
  console.log(`  ✓ POST   /api/purchases`);
  console.log(`  ✓ GET    /api/contracts`);
  console.log(`  ✓ POST   /api/contracts`);
  console.log(`  ✓ GET    /api/reports/dashboard`);
  console.log(`  ✓ POST   /api/auth/login\n`);
});

module.exports = app;
