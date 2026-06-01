require('dotenv').config();
const bcrypt = require('bcryptjs');
const models = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...\n');

    // Create Users
    console.log('📝 Creating users...');
    const adminUser = await models.User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'admin'
    });

    const staffUser1 = await models.User.create({
      name: 'John Doe',
      email: 'john.doe@company.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'staff'
    });

    const staffUser2 = await models.User.create({
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'staff'
    });

    const viewerUser = await models.User.create({
      name: 'Viewer User',
      email: 'viewer@company.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'viewer'
    });

    console.log('✅ Created 4 users\n');

    // Create Purchases
    console.log('📝 Creating purchases...');
    const purchase1 = await models.Purchase.create({
      purchase_id: 'PO-2024-001',
      vendor_name: 'Dell Technologies',
      vendor_contact: '+1-800-123-4567',
      vendor_email: 'sales@dell.com',
      billing_address: '123 Dell Way, Round Rock, TX 78682',
      shipping_address: '456 Tech Street, Austin, TX 78704',
      purchase_date: new Date('2024-01-15'),
      total_amount: 5500.00,
      status: 'completed'
    });

    const purchase2 = await models.Purchase.create({
      purchase_id: 'PO-2024-002',
      vendor_name: 'HP Inc.',
      vendor_contact: '+1-888-999-8888',
      vendor_email: 'orders@hp.com',
      billing_address: '1501 Page Mill Road, Palo Alto, CA 94304',
      shipping_address: '789 Innovation Drive, San Jose, CA 95110',
      purchase_date: new Date('2024-02-20'),
      total_amount: 3200.00,
      status: 'completed'
    });

    console.log('✅ Created 2 purchases\n');

    // Create Assets with Details
    console.log('📝 Creating assets...');

    // Asset 1: Dell Laptop
    const asset1 = await models.Asset.create({
      asset_tag: 'AST-2024-001',
      category: 'IT',
      sub_type: 'Laptop',
      serial_no: 'DL-12345-6789',
      mac_address: '00:1A:2B:3C:4D:5E',
      status: 'active',
      purchase_id: purchase1.id,
      assigned_to: staffUser1.id
    });

    await models.AssetDetail.create({
      asset_id: asset1.id,
      os_type: 'Windows',
      os_version: '11 Pro',
      product_id: 'WIN-PRO-2024',
      os_activated: true,
      processor_name: 'Intel Core i7-13700K',
      manufacturer: 'Dell',
      cores: 16,
      ram_gb: 32,
      disk_gb: 512,
      disk_model: 'Samsung 980 Pro NVMe',
      ms_office: true,
      office_key: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
      software_list: 'VS Code, Git, Docker, Postman, Slack',
      configuration: 'High-performance development machine',
      others: 'Thunderbolt 4, USB-C'
    });

    // Asset 2: HP Desktop
    const asset2 = await models.Asset.create({
      asset_tag: 'AST-2024-002',
      category: 'IT',
      sub_type: 'Desktop',
      serial_no: 'HP-98765-4321',
      mac_address: '00:2B:3C:4D:5E:6F',
      status: 'active',
      purchase_id: purchase2.id,
      assigned_to: staffUser2.id
    });

    await models.AssetDetail.create({
      asset_id: asset2.id,
      os_type: 'Windows',
      os_version: '10 Home',
      product_id: 'WIN-HOME-2024',
      os_activated: true,
      processor_name: 'AMD Ryzen 5 5600G',
      manufacturer: 'HP',
      cores: 6,
      ram_gb: 16,
      disk_gb: 256,
      disk_model: 'Kingston A2000 SSD',
      ms_office: true,
      office_key: 'YYYYY-YYYYY-YYYYY-YYYYY-YYYYY',
      software_list: 'Microsoft Office, Adobe Reader, Chrome',
      configuration: 'General office workstation',
      others: '4x USB 3.0, HDMI'
    });

    // Asset 3: Monitor
    const asset3 = await models.Asset.create({
      asset_tag: 'AST-2024-003',
      category: 'IT',
      sub_type: 'Monitor',
      serial_no: 'DEL-MON-2024-001',
      mac_address: null,
      status: 'active',
      purchase_id: purchase1.id,
      assigned_to: staffUser1.id
    });

    await models.AssetDetail.create({
      asset_id: asset3.id,
      os_type: null,
      os_version: null,
      product_id: null,
      os_activated: false,
      processor_name: null,
      manufacturer: 'Dell',
      cores: null,
      ram_gb: null,
      disk_gb: null,
      disk_model: null,
      ms_office: false,
      office_key: null,
      software_list: null,
      configuration: 'Dell UltraSharp 27-inch 4K Monitor, 60Hz',
      others: 'USB-C, Thunderbolt 3, Height adjustable stand'
    });

    // Asset 4: Printer
    const asset4 = await models.Asset.create({
      asset_tag: 'AST-2024-004',
      category: 'Non-IT',
      sub_type: 'Printer',
      serial_no: 'HP-PRINT-5678',
      mac_address: '00:3C:4D:5E:6F:7G',
      status: 'active',
      purchase_id: purchase2.id,
      assigned_to: null
    });

    await models.AssetDetail.create({
      asset_id: asset4.id,
      os_type: null,
      os_version: null,
      product_id: null,
      os_activated: false,
      processor_name: null,
      manufacturer: 'HP',
      cores: null,
      ram_gb: null,
      disk_gb: null,
      disk_model: null,
      ms_office: false,
      office_key: null,
      software_list: null,
      configuration: 'HP LaserJet Pro M479fdw - All-in-One',
      others: 'Wireless, Print, Copy, Scan, Fax, Network'
    });

    // Asset 5: Disposed Laptop
    const asset5 = await models.Asset.create({
      asset_tag: 'AST-2024-005',
      category: 'IT',
      sub_type: 'Laptop',
      serial_no: 'OLD-LAP-1234',
      mac_address: '00:4D:5E:6F:7G:8H',
      status: 'disposed',
      purchase_id: null,
      assigned_to: null
    });

    await models.AssetDetail.create({
      asset_id: asset5.id,
      os_type: 'Windows',
      os_version: '7',
      product_id: 'WIN-OLD-2020',
      os_activated: false,
      processor_name: 'Intel Core i5-4210U',
      manufacturer: 'Lenovo',
      cores: 2,
      ram_gb: 8,
      disk_gb: 128,
      disk_model: 'Generic HDD',
      ms_office: false,
      office_key: null,
      software_list: 'Basic office software',
      configuration: 'Old machine - disposed on 2024-03-01',
      others: 'Legacy machine'
    });

    console.log('✅ Created 5 assets with details\n');

    // Create Contracts
    console.log('📝 Creating contracts...');
    await models.Contract.create({
      contract_id: 'CT-2024-001',
      name: 'Dell Hardware Support',
      vendor_name: 'Dell Technologies',
      active_from: new Date('2024-01-15'),
      active_till: new Date('2026-01-15'),
      status: 'active',
      notes: '3-year hardware support and maintenance contract'
    });

    await models.Contract.create({
      contract_id: 'CT-2024-002',
      name: 'Microsoft Office 365',
      vendor_name: 'Microsoft',
      active_from: new Date('2024-01-01'),
      active_till: new Date('2024-12-31'),
      status: 'active',
      notes: 'Cloud-based office productivity suite'
    });

    await models.Contract.create({
      contract_id: 'CT-2024-003',
      name: 'HP Printer Support',
      vendor_name: 'HP Inc.',
      active_from: new Date('2024-06-01'),
      active_till: new Date('2024-05-31'),
      status: 'expired',
      notes: 'Expired support contract'
    });

    console.log('✅ Created 3 contracts\n');

    // Create Audit Logs
    console.log('📝 Creating audit logs...');
    await models.AuditLog.create({
      asset_id: asset1.id,
      user_id: adminUser.id,
      action: 'Asset Created',
      old_value: null,
      new_value: JSON.stringify({ asset_tag: 'AST-2024-001', status: 'active' })
    });

    await models.AuditLog.create({
      asset_id: asset1.id,
      user_id: adminUser.id,
      action: 'Asset Assigned',
      old_value: JSON.stringify({ assigned_to: null }),
      new_value: JSON.stringify({ assigned_to: staffUser1.id })
    });

    console.log('✅ Created audit logs\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Sample Data Summary:');
    console.log('  - Users: 4 (1 admin, 2 staff, 1 viewer)');
    console.log('  - Purchases: 2');
    console.log('  - Assets: 5 (4 active, 1 disposed)');
    console.log('  - Contracts: 3');
    console.log('  - Audit Logs: 2');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
