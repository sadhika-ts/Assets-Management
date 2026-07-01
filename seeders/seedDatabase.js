const { User, Asset, AssetDetail, Purchase, Contract } = require('../models');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Users
    console.log('📝 Seeding users...');
    const users = await User.bulkCreate([
      {
        id: uuidv4(),
        name: 'Sadhika TS',
        email: 'sadhika@company.com',
        password_hash: 'hashed_password_1',
        role: 'admin'
      },
      {
        id: uuidv4(),
        name: 'Arun Kumar',
        email: 'arun@company.com',
        password_hash: 'hashed_password_2',
        role: 'staff'
      },
      {
        id: uuidv4(),
        name: 'Priya Sharma',
        email: 'priya@company.com',
        password_hash: 'hashed_password_3',
        role: 'staff'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Seed Purchases
    console.log('🛒 Seeding purchases...');
    const purchases = await Purchase.bulkCreate([
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
        status: 'delivered'
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
        status: 'delivered'
      }
    ]);
    console.log(`✅ Created ${purchases.length} purchases`);

    // Seed Assets
    console.log('🖥️  Seeding assets...');
    const assets = await Asset.bulkCreate([
      {
        id: uuidv4(),
        asset_tag: 'COMP-001',
        asset_name: 'Desktop Computer',
        category: 'IT',
        sub_type: 'Computer',
        status: 'active',
        purchase_id: purchases[0].id,
        assigned_to: users[0].id
      },
      {
        id: uuidv4(),
        asset_tag: 'LAP-001',
        asset_name: 'HP Laptop',
        category: 'IT',
        sub_type: 'Laptop',
        status: 'active',
        purchase_id: purchases[1].id,
        assigned_to: users[1].id
      },
      {
        id: uuidv4(),
        asset_tag: 'PRT-001',
        asset_name: 'HP Printer',
        category: 'IT',
        sub_type: 'Printer',
        status: 'active',
        purchase_id: purchases[1].id
      },
      {
        id: uuidv4(),
        asset_tag: 'RTR-001',
        asset_name: 'Cisco Router',
        category: 'IT',
        sub_type: 'Router',
        status: 'active'
      },
      {
        id: uuidv4(),
        asset_tag: 'IT-OTH-001',
        asset_name: 'Biometric Attendance Device',
        category: 'IT',
        sub_type: 'Other',
        other_subtype_description: 'Biometric Attendance Device',
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${assets.length} assets`);

    // Seed Asset Details
    console.log('📋 Seeding asset details...');
    await AssetDetail.bulkCreate([
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
        disk_gb: 512
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
        disk_gb: 256
      },
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        serial_no: 'HPPRT789456',
        manufacturer: 'HP',
        model: 'LaserJet Pro M404n'
      },
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        serial_no: 'CISCO456123',
        mac_address: '11:22:33:44:55:66',
        manufacturer: 'Cisco',
        model: 'ISR 1100-6G'
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        serial_no: 'BIO123456',
        manufacturer: 'Realtime',
        model: 'RealFace 10'
      }
    ]);
    console.log(`✅ Created 5 asset details`);

    // Seed Contracts - Disabled (empty table)
    console.log('📜 Seeding contracts...');
    const contracts = [];
    console.log(`✅ Created ${contracts.length} contracts`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`
📊 Summary:
   - Users: ${users.length}
   - Purchases: ${purchases.length}
   - Assets: ${assets.length}
   - Asset Details: 5
   - Contracts: ${contracts.length}
    `);

    return { users, purchases, assets, contracts };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
