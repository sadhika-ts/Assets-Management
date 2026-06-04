require('dotenv').config();
const sequelize = require('./config/db');

(async () => {
  await sequelize.authenticate();
  const assets = await sequelize.query("SELECT id, asset_tag, asset_name FROM Assets;");
  console.log('Assets in database:');
  assets[0].forEach(a => {
    console.log(`  ${a.asset_tag}: ${a.asset_name}`);
  });
  process.exit(0);
})();
