require('dotenv').config();
const sequelize = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const models = require('./models');

const insertData = async () => {
  try {
    console.log('🔄 Starting database connection...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Sync models
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Schema synced\n');

    // Insert Users
    console.log('👥 Inserting users...');
    const users = await models.User.bulkCreate([
      {
        id: uuidv4(),
        name: 'Sadhika TS',
        email: 'sadhika@company.com',
        password_hash: 'hashed_password_1',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Arun Kumar',
        email: 'arun@company.com',
        password_hash: 'hashed_password_2',
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Priya Sharma',
        email: 'priya@company.com',
        password_hash: 'hashed_password_3',
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`✅ Inserted ${users.length} users\n`);

    // Insert Purchases
    console.log('🛒 Inserting purchases...');
    const purchases = await models.Purchase.bulkCreate([
      {
        id: uuidv4(),
        purchase_id: 'PO-2025-001',
        vendor_name: 'Dell Technologies',
        vendor_contact: '+91 9876543210',
        vendor_email: 'sales@dell.com',
        billing_address: 'Chennai Head Office',
        shipping_address: 'Chennai IT Department',
        purchase_date: new Date('2025-05-15'),
        total_amount: 350000,
        status: 'delivered',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        purchase_id: 'PO-2025-002',
        vendor_name: 'HP India',
        vendor_contact: '+91 9123456780',
        vendor_email: 'orders@hp.com',
        billing_address: 'Chennai Head Office',
        shipping_address: 'Chennai Branch Office',
        purchase_date: new Date('2025-05-20'),
        total_amount: 125000,
        status: 'delivered',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`✅ Inserted ${purchases.length} purchases\n`);

    // Insert Assets
    console.log('🖥️  Inserting assets...');
    const assets = await models.Asset.bulkCreate([
      {
        id: uuidv4(),
        asset_tag: 'COMP-001',
        asset_name: 'Desktop Computer',
        category: 'IT',
        sub_type: 'Computer',
        status: 'active',
        purchase_id: purchases[0].id,
        assigned_to: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_tag: 'LAP-001',
        asset_name: 'HP Laptop',
        category: 'IT',
        sub_type: 'Laptop',
        status: 'active',
        purchase_id: purchases[1].id,
        assigned_to: users[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_tag: 'PRT-001',
        asset_name: 'HP Printer',
        category: 'IT',
        sub_type: 'Printer',
        status: 'active',
        purchase_id: purchases[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_tag: 'RTR-001',
        asset_name: 'Cisco Router',
        category: 'IT',
        sub_type: 'Router',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_tag: 'IT-OTH-001',
        asset_name: 'Biometric Attendance Device',
        category: 'IT',
        sub_type: 'Other',
        other_subtype_description: 'Biometric Attendance Device',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`✅ Inserted ${assets.length} assets\n`);

    // Insert Asset Details
    console.log('📋 Inserting asset details...');
    const assetDetails = await models.AssetDetail.bulkCreate([
      {
        id: uuidv4(),
        asset_id: assets[0].id,
        serial_no: 'DELL784512',
        mac_address: '00:1A:2B:3C:4D:5E',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        os_type: 'Windows',
        os_version: '11 Pro',
        processor_name: 'Intel Core i7',
        cores: 8,
        ram_gb: 16,
        disk_gb: 512,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_id: assets[1].id,
        serial_no: 'HP456789123',
        mac_address: '00:AA:BB:CC:DD:EE',
        manufacturer: 'HP',
        model: 'EliteBook 850',
        os_type: 'Windows',
        os_version: '11 Pro',
        processor_name: 'Intel Core i5',
        cores: 6,
        ram_gb: 8,
        disk_gb: 256,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        serial_no: 'HPPRT789456',
        manufacturer: 'HP',
        model: 'LaserJet Pro M404n',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        serial_no: 'CISCO456123',
        mac_address: '11:22:33:44:55:66',
        manufacturer: 'Cisco',
        model: 'ISR 1100-6G',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        serial_no: 'BIO123456',
        manufacturer: 'Realtime',
        model: 'RealFace 10',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`✅ Inserted ${assetDetails.length} asset details\n`);

    // Insert Contracts
    console.log('📜 Inserting contracts...');
    const contracts = await models.Contract.bulkCreate([
      {
        id: uuidv4(),
        contract_id: 'CON-2025-001',
        name: 'Dell Laptop AMC',
        vendor_name: 'Dell Technologies',
        active_from: new Date('2025-01-01'),
        active_till: new Date('2026-01-01'),
        status: 'active',
        notes: 'Annual maintenance contract for Dell devices',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        contract_id: 'CON-2025-002',
        name: 'Microsoft Office License',
        vendor_name: 'Microsoft',
        active_from: new Date('2025-02-01'),
        active_till: new Date('2027-02-01'),
        status: 'active',
        notes: 'Enterprise Office Licensing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`✅ Inserted ${contracts.length} contracts\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ DATABASE SEEDING COMPLETED SUCCESSFULLY ✨');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   ✓ Users: ${users.length}`);
    console.log(`   ✓ Purchases: ${purchases.length}`);
    console.log(`   ✓ Assets: ${assets.length}`);
    console.log(`   ✓ Asset Details: ${assetDetails.length}`);
    console.log(`   ✓ Contracts: ${contracts.length}`);
    console.log(`\n   Total Records: ${users.length + purchases.length + assets.length + assetDetails.length + contracts.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
    console.error(error);
    process.exit(1);
  }
};

insertData();
