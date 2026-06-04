require('dotenv').config();
const models = require('./models');

(async () => {
  await models.sequelize.authenticate();
  
  const assets = await models.Asset.findAll({
    limit: 1,
    include: [
      { association: 'detail', attributes: ['os_type', 'os_version', 'processor_name', 'cores', 'ram_gb', 'disk_gb', 'ms_office', 'other_applications_installed', 'software_list'] },
      { association: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
      { association: 'purchase', attributes: ['purchase_id', 'vendor_name', 'purchase_date'] }
    ]
  });
  
  console.log(JSON.stringify(assets[0].toJSON(), null, 2));
  process.exit(0);
})();
