require('dotenv').config();
const sequelize = require('./config/db');

(async () => {
  await sequelize.authenticate();
  const result = await sequelize.query("PRAGMA table_info(Assets);");
  console.log('Asset table columns:');
  result[0].forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  process.exit(0);
})();
