# Sequelize Models Summary

Quick reference for all 6 data models and their relationships.

## Model Files Created

```
models/
├── User.js              # System users (admin, staff, viewer)
├── Asset.js             # Core asset inventory
├── AssetDetail.js       # Detailed IT specifications (1:1 with Asset)
├── Purchase.js          # Purchase orders (1:Many with Asset)
├── Contract.js          # Service contracts
├── AuditLog.js          # Change audit trail
└── index.js             # Model initialization & associations
```

---

## Models at a Glance

### 1. User Model
**Purpose:** System users with role-based access control

```javascript
User.create({
  name: 'John Doe',
  email: 'john@company.com',
  password_hash: bcrypt.hashSync('password', 10),
  role: 'admin'  // admin, staff, viewer
})
```

**Associations:**
- `hasMany` Asset (via assigned_to)
- `hasMany` AuditLog (via user_id)

**Table:** `users`
**Fields:** id, name, email, password_hash, role, created_at

---

### 2. Purchase Model
**Purpose:** Track purchase orders and vendor information

```javascript
Purchase.create({
  purchase_id: 'PO-2024-001',
  vendor_name: 'Dell Technologies',
  vendor_contact: '+1-800-123-4567',
  vendor_email: 'sales@dell.com',
  purchase_date: new Date('2024-01-15'),
  total_amount: 5500.00,
  status: 'completed'  // pending, completed, cancelled
})
```

**Associations:**
- `hasMany` Asset (via purchase_id)

**Table:** `purchases`
**Fields:** id, purchase_id (unique), vendor_name, vendor_contact, vendor_email, billing_address, shipping_address, purchase_date, total_amount, status, created_at

---

### 3. Asset Model
**Purpose:** Core inventory management

```javascript
Asset.create({
  asset_tag: 'AST-2024-001',
  category: 'IT',              // IT, Non-IT
  sub_type: 'Laptop',
  serial_no: 'DL-12345-6789',
  mac_address: '00:1A:2B:3C:4D:5E',
  status: 'active',            // active, inactive, disposed
  purchase_id: purchaseId,
  assigned_to: userId
})
```

**Associations:**
- `belongsTo` Purchase (via purchase_id, as 'purchase')
- `belongsTo` User (via assigned_to, as 'assignedUser')
- `hasOne` AssetDetail (via asset_id, as 'detail')
- `hasMany` AuditLog (via asset_id, as 'auditLogs')

**Table:** `assets`
**Fields:** id, asset_tag (unique), category, sub_type, serial_no, mac_address, status, purchase_id (FK), assigned_to (FK), created_at

---

### 4. AssetDetail Model
**Purpose:** Detailed IT specifications (one-to-one with Asset)

```javascript
AssetDetail.create({
  asset_id: assetId,
  os_type: 'Windows',
  os_version: '11 Pro',
  processor_name: 'Intel Core i7-13700K',
  cores: 16,
  ram_gb: 32,
  disk_gb: 512,
  disk_model: 'Samsung 980 Pro',
  ms_office: true,
  office_key: 'XXXXX-XXXXX-XXXXX...',
  software_list: 'VS Code, Git, Docker, Slack',
  configuration: 'Development machine',
  others: 'Thunderbolt 4, USB-C'
})
```

**Associations:**
- `belongsTo` Asset (via asset_id, as 'asset')

**Table:** `asset_details`
**Fields:** id, asset_id (unique FK), os_type, os_version, product_id, os_activated, processor_name, manufacturer, cores, ram_gb, disk_gb, disk_model, ms_office, office_key, software_list, configuration, others, created_at

---

### 5. Contract Model
**Purpose:** Service and support contracts

```javascript
Contract.create({
  contract_id: 'CT-2024-001',
  name: 'Dell Hardware Support',
  vendor_name: 'Dell Technologies',
  active_from: new Date('2024-01-15'),
  active_till: new Date('2026-01-15'),
  status: 'active',            // active, expired, upcoming
  notes: '3-year hardware support'
})
```

**Associations:** None (standalone)

**Table:** `contracts`
**Fields:** id, contract_id (unique), name, vendor_name, active_from, active_till, status, notes, created_at

---

### 6. AuditLog Model
**Purpose:** Track all changes to assets and user actions

```javascript
AuditLog.create({
  asset_id: assetId,
  user_id: userId,
  action: 'Asset Updated',
  old_value: JSON.stringify({ status: 'active' }),
  new_value: JSON.stringify({ status: 'inactive' })
})
```

**Associations:**
- `belongsTo` Asset (via asset_id, as 'asset')
- `belongsTo` User (via user_id, as 'user')

**Table:** `audit_logs`
**Fields:** id, asset_id (nullable FK), user_id (FK), action, old_value (JSON text), new_value (JSON text), changed_at

---

## Complete Relationship Map

```
┌──────────┐
│  User    │
└────┬─────┘
     │ (1:Many via assigned_to)
     ↓
┌──────────────────────────────────┐
│ Asset                            │
│ ├─ (belongsTo) Purchase          │
│ ├─ (belongsTo) User              │
│ ├─ (hasOne) AssetDetail          │
│ └─ (hasMany) AuditLog            │
└──────────────────────────────────┘
     ↑
     │ (1:Many via purchase_id)
┌──────────┐
│ Purchase │
└──────────┘

┌──────────┐
│ Contract │
└──────────┘ (standalone)

┌──────────────┐
│ AuditLog     │
│ ├─ (FK) asset_id
│ └─ (FK) user_id
└──────────────┘
```

---

## Database Sync Commands

```bash
# Create/update all tables
npm run db:sync

# Drop and recreate (development only)
npm run db:sync:fresh

# Populate with sample data
npm run db:seed

# Both sync and seed
npm run db:setup
```

---

## Common Query Patterns

### Get Asset with All Details
```javascript
const asset = await Asset.findByPk(assetId, {
  include: [
    { association: 'purchase' },
    { association: 'assignedUser' },
    { association: 'detail' },
    { association: 'auditLogs', include: ['user'] }
  ]
});
```

### Get User's Assigned Assets
```javascript
const assets = await Asset.findAll({
  where: { assigned_to: userId },
  include: [{ association: 'detail' }]
});
```

### Get Asset Change History
```javascript
const history = await AuditLog.findAll({
  where: { asset_id: assetId },
  include: ['user'],
  order: [['changed_at', 'DESC']]
});
```

### Find Active Contracts
```javascript
const contracts = await Contract.findAll({
  where: { status: 'active' },
  order: [['active_till', 'ASC']]
});
```

### Count Assets by Status
```javascript
const counts = await Asset.findAll({
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['status']
});
```

---

## Sample Data Generated

When you run `npm run db:seed`:

**Users:** 4
- 1 Admin user
- 2 Staff users
- 1 Viewer user

**Assets:** 5
- 2 Laptops (1 active, 1 disposed)
- 1 Desktop
- 1 Monitor
- 1 Printer

**Purchases:** 2
- Dell Technologies
- HP Inc.

**Contracts:** 3
- Dell Hardware Support
- Microsoft Office 365
- HP Printer Support

**Audit Logs:** 2
- Asset creation
- Asset assignment

---

## Key Features

✅ **UUID Primary Keys** - All models use UUID for security and scalability

✅ **Role-Based Access** - User roles: admin, staff, viewer

✅ **Asset Status Tracking** - active, inactive, disposed

✅ **Detailed Specifications** - One-to-one AssetDetail for IT specs

✅ **Audit Trail** - Complete change history in AuditLog

✅ **Contract Management** - Active, expired, upcoming status

✅ **Vendor Tracking** - Full vendor details in Purchase

✅ **Date Tracking** - created_at timestamps on all records

✅ **Cascading Associations** - All relationships properly defined

✅ **Data Validation** - Email, enum, decimal validation built-in

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Create database
createdb asset_inventory_db

# 4. Sync tables
npm run db:sync

# 5. Seed sample data
npm run db:seed

# 6. Start development server
npm run dev

# 7. Test API
curl http://localhost:5000/api/health
```

---

## File Locations

- **Models:** `/models/` directory
- **Database Config:** `/config/db.js`
- **Sync Script:** `/scripts/syncDb.js`
- **Seed Script:** `/scripts/seedDb.js`
- **Detailed Docs:** `MODELS.md`
- **Setup Guide:** `SETUP.md`

---

## Next Steps

1. Implement authentication routes in `/routes/auth.js`
2. Implement CRUD operations in `/routes/assets.js`
3. Add input validation using express-validator
4. Create reports in `/routes/reports.js`
5. Build frontend to consume API

---

**Models are production-ready! 🚀**
