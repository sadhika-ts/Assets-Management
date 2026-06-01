require('dotenv').config();
const db = require('../config/db');
const models = require('../models');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Test connection
    await db.authenticate();
    console.log('Database connected successfully');

    // Sync models with database
    await db.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');

    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
