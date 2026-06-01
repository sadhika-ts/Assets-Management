require('dotenv').config();
const models = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Syncing database...');

    // Test connection
    await models.sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Drop all tables and recreate (use { force: true } only in development)
    const force = process.env.NODE_ENV === 'development' && process.argv[2] === '--force';

    if (force) {
      console.log('⚠️  Dropping and recreating all tables...');
    }

    // Sync models
    await models.sequelize.sync({
      alter: !force,
      force: force
    });

    console.log('✅ Database synchronized successfully');
    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - purchases');
    console.log('  - assets');
    console.log('  - asset_details');
    console.log('  - contracts');
    console.log('  - audit_logs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  }
};

syncDatabase();
