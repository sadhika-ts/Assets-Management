# Sequelize Models Documentation

Complete guide to the IT Asset Inventory Management System data models.

## Database Schema Overview

```
users
├── id (UUID, PK)
├── name
├── email (unique)
├── password_hash
├── role (admin|staff|viewer)
└── created_at

purchases
├── id (UUID, PK)
├── purchase_id (unique)
├── vendor_name
├── vendor_contact
├── vendor_email
├── billing_address
├── shipping_address
├── purchase_date
├── total_amount (decimal)
├── status
└── created_at

assets
├── id (UUID, PK)
├── asset_tag (unique)
├── category (IT|Non-IT)
├── sub_type
├── serial_no
├── mac_address
├── status (active|inactive|disposed)
├── purchase_id (FK to purchases)
├── assigned_to (FK to users)
└── created_at
  └── asset_details (1:1)
      ├── os_type
      ├── os_version
      ├── processor_name
      ├── ram_gb
      ├── ms_office
      ├── software_list
      └── ...
  └── audit_logs (1:many)

contracts
├── id (UUID, PK)
├── contract_id (unique)
├── name
├── vendor_name
├── active_from
├── active_till
├── status (active|expired|upcoming)
└── notes

audit_logs
├── id (UUID, PK)
├── asset_id (FK to assets)
├── user_id (FK to users)
├── action
├── old_value (text JSON)
├── new_value (text JSON)
└── changed_at
```

## Model Details

### User Model
Represents system users with role-based access control.

**Table:** `users`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique user identifier |
| name | String | NOT NULL | User full name |
| email | String | NOT NULL, UNIQUE | User email (for authentication) |
| password_hash | String | NOT NULL | Bcrypted password |
| role | ENUM | DEFAULT: 'staff' | admin, staff, or viewer |
| created_at | DateTime | DEFAULT: NOW | Account creation timestamp |

**Associations:**
- `hasMany`: Asset (via `assigned_to`)
- `hasMany`: AuditLog (via `user_id`)

**Usage:**
```javascript
const user = await User.create({
  name: 'John Doe',
  email: 'john@company.com',
  password_hash: bcrypt.hashSync('password123', 10),
  role: 'admin'
});

// Get user with assets
const userWithAssets = await User.findByPk(userId, {
  include: ['assignedAssets']
});

// Get user with audit logs
const userWithLogs = await User.findByPk(userId, {
  include: ['auditLogs']
});
```

---

### Purchase Model
Tracks purchase orders and vendor information.

**Table:** `purchases`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique purchase ID |
| purchase_id | String | NOT NULL, UNIQUE | Purchase order number (e.g., 'PO-2024-001') |
| vendor_name | String | NOT NULL | Vendor/supplier name |
| vendor_contact | String | Nullable | Phone number |
| vendor_email | String | Nullable | Email validation |
| billing_address | Text | Nullable | Billing address |
| shipping_address | Text | Nullable | Shipping address |
| purchase_date | Date | NOT NULL | Date of purchase |
| total_amount | Decimal(12,2) | NOT NULL | Total purchase amount |
| status | String | DEFAULT: 'pending' | pending, completed, cancelled |
| created_at | DateTime | DEFAULT: NOW | Record creation timestamp |

**Associations:**
- `hasMany`: Asset (via `purchase_id`)

**Usage:**
```javascript
const purchase = await Purchase.create({
  purchase_id: 'PO-2024-001',
  vendor_name: 'Dell Technologies',
  vendor_contact: '+1-800-123-4567',
  vendor_email: 'sales@dell.com',
  purchase_date: new Date('2024-01-15'),
  total_amount: 5500.00,
  status: 'completed'
});

// Get purchase with all assets
const purchaseWithAssets = await Purchase.findByPk(purchaseId, {
  include: ['assets']
});
```

---

### Asset Model
Core asset inventory records.

**Table:** `assets`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique asset identifier |
| asset_tag | String | NOT NULL, UNIQUE | Asset inventory tag (e.g., 'AST-2024-001') |
| category | ENUM | NOT NULL | IT or Non-IT |
| sub_type | String | NOT NULL | Laptop, Desktop, Monitor, Printer, etc. |
| serial_no | String | Nullable | Manufacturer serial number |
| mac_address | String | Nullable | Network MAC address |
| status | ENUM | DEFAULT: 'active' | active, inactive, disposed |
| purchase_id | UUID | FK to purchases | Link to purchase order |
| assigned_to | UUID | FK to users | Currently assigned user |
| created_at | DateTime | DEFAULT: NOW | Record creation timestamp |

**Associations:**
- `belongsTo`: Purchase (via `purchase_id`, as 'purchase')
- `belongsTo`: User (via `assigned_to`, as 'assignedUser')
- `hasOne`: AssetDetail (via `asset_id`, as 'detail')
- `hasMany`: AuditLog (via `asset_id`, as 'auditLogs')

**Usage:**
```javascript
const asset = await Asset.create({
  asset_tag: 'AST-2024-001',
  category: 'IT',
  sub_type: 'Laptop',
  serial_no: 'DL-12345-6789',
  mac_address: '00:1A:2B:3C:4D:5E',
  status: 'active',
  purchase_id: purchaseId,
  assigned_to: userId
});

// Get asset with all details
const assetWithDetails = await Asset.findByPk(assetId, {
  include: [
    { association: 'purchase' },
    { association: 'assignedUser' },
    { association: 'detail' },
    { association: 'auditLogs' }
  ]
});

// Search assets by status
const activeAssets = await Asset.findAll({
  where: { status: 'active' }
});
```

---

### AssetDetail Model
Detailed specifications for IT assets.

**Table:** `asset_details`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique detail ID |
| asset_id | UUID | FK to assets, UNIQUE | One-to-one relationship |
| os_type | String | Nullable | Operating system (Windows, Linux, macOS) |
| os_version | String | Nullable | OS version (11 Pro, Ubuntu 22.04, etc.) |
| product_id | String | Nullable | Windows/Office product key ID |
| os_activated | Boolean | DEFAULT: false | License activation status |
| processor_name | String | Nullable | CPU model |
| manufacturer | String | Nullable | Device manufacturer |
| cores | Integer | Nullable | CPU core count |
| ram_gb | Float | Nullable | RAM amount in GB |
| disk_gb | Float | Nullable | Storage capacity in GB |
| disk_model | String | Nullable | Storage type/model |
| ms_office | Boolean | DEFAULT: false | Microsoft Office installed |
| office_key | String | Nullable | Office license key |
| software_list | Text | Nullable | Comma-separated installed software |
| configuration | Text | Nullable | Custom configuration notes |
| others | Text | Nullable | Additional specifications |
| created_at | DateTime | DEFAULT: NOW | Record creation timestamp |

**Associations:**
- `belongsTo`: Asset (via `asset_id`, as 'asset')

**Usage:**
```javascript
const detail = await AssetDetail.create({
  asset_id: assetId,
  os_type: 'Windows',
  os_version: '11 Pro',
  processor_name: 'Intel Core i7-13700K',
  ram_gb: 32,
  disk_gb: 512,
  ms_office: true,
  software_list: 'VS Code, Git, Docker, Postman, Slack'
});

// Get asset with details
const asset = await Asset.findByPk(assetId, {
  include: [{ association: 'detail' }]
});

// Query details
const laptops = await AssetDetail.findAll({
  include: [{
    association: 'asset',
    where: { sub_type: 'Laptop' }
  }]
});
```

---

### Contract Model
Service and support contracts.

**Table:** `contracts`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique contract ID |
| contract_id | String | NOT NULL, UNIQUE | Contract reference (e.g., 'CT-2024-001') |
| name | String | NOT NULL | Contract name |
| vendor_name | String | NOT NULL | Service provider name |
| active_from | Date | NOT NULL | Contract start date |
| active_till | Date | NOT NULL | Contract end date |
| status | ENUM | DEFAULT: 'upcoming' | active, expired, upcoming |
| notes | Text | Nullable | Contract details and terms |
| created_at | DateTime | DEFAULT: NOW | Record creation timestamp |

**Usage:**
```javascript
const contract = await Contract.create({
  contract_id: 'CT-2024-001',
  name: 'Dell Hardware Support',
  vendor_name: 'Dell Technologies',
  active_from: new Date('2024-01-15'),
  active_till: new Date('2026-01-15'),
  status: 'active',
  notes: '3-year hardware support and maintenance'
});

// Find expiring contracts
const today = new Date();
const expiringContracts = await Contract.findAll({
  where: {
    active_till: {
      [Op.lte]: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    }
  }
});
```

---

### AuditLog Model
Tracks all changes to assets and system actions.

**Table:** `audit_logs`

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| id | UUID | PK, Default: UUIDV4 | Unique log entry ID |
| asset_id | UUID | FK to assets, Nullable | Asset being modified (null for general actions) |
| user_id | UUID | FK to users | User performing the action |
| action | String | NOT NULL | Action type (Created, Updated, Assigned, etc.) |
| old_value | Text | Nullable | Previous value (JSON string) |
| new_value | Text | Nullable | New value (JSON string) |
| changed_at | DateTime | DEFAULT: NOW | When change occurred |

**Associations:**
- `belongsTo`: Asset (via `asset_id`, as 'asset')
- `belongsTo`: User (via `user_id`, as 'user')

**Usage:**
```javascript
const log = await AuditLog.create({
  asset_id: assetId,
  user_id: userId,
  action: 'Asset Updated',
  old_value: JSON.stringify({ status: 'active' }),
  new_value: JSON.stringify({ status: 'inactive' })
});

// Get asset change history
const history = await AuditLog.findAll({
  where: { asset_id: assetId },
  include: [{ association: 'user' }],
  order: [['changed_at', 'DESC']]
});

// Get user's actions
const userActions = await AuditLog.findAll({
  where: { user_id: userId },
  include: [{ association: 'asset' }],
  order: [['changed_at', 'DESC']]
});
```

---

## Relationships Diagram

```
User (1) ──→ (Many) Asset (assigned_to)
User (1) ──→ (Many) AuditLog (user_id)

Purchase (1) ──→ (Many) Asset (purchase_id)

Asset (1) ──→ (1) AssetDetail (asset_id)
Asset (1) ──→ (Many) AuditLog (asset_id)

Contract (standalone - no foreign keys)
```

---

## Database Setup Commands

### Sync Database Schema
```bash
npm run db:sync
```

### Reset and Recreate (Development Only)
```bash
npm run db:sync:fresh
```

### Seed Sample Data
```bash
npm run db:seed
```

### Setup Complete Database
```bash
npm run db:setup
```

---

## Query Examples

### Get Asset with All Related Data
```javascript
const asset = await Asset.findByPk(assetId, {
  include: [
    { association: 'purchase' },
    { association: 'assignedUser', attributes: ['id', 'name', 'email'] },
    { association: 'detail' },
    { association: 'auditLogs', include: ['user'] }
  ]
});
```

### Find Active Assets Assigned to User
```javascript
const userAssets = await Asset.findAll({
  where: {
    assigned_to: userId,
    status: 'active'
  },
  include: [{ association: 'detail' }]
});
```

### Get Asset History
```javascript
const history = await AuditLog.findAll({
  where: { asset_id: assetId },
  include: [{ association: 'user', attributes: ['name', 'email'] }],
  order: [['changed_at', 'DESC']]
});
```

### Find All Contracts by Vendor
```javascript
const vendorContracts = await Contract.findAll({
  where: { vendor_name: 'Dell Technologies' },
  order: [['active_till', 'ASC']]
});
```

### Count Assets by Category
```javascript
const counts = await Asset.findAll({
  attributes: [
    'category',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['category']
});
```

---

## Data Validation Rules

### User
- Email must be valid format
- Role must be: admin, staff, or viewer
- Name is required

### Asset
- asset_tag must be unique
- category must be: IT or Non-IT
- status must be: active, inactive, or disposed

### Purchase
- purchase_id must be unique
- purchase_date must be valid date
- total_amount must be positive decimal

### Contract
- contract_id must be unique
- active_from must be before active_till
- status must be: active, expired, or upcoming

### AssetDetail
- asset_id must be unique (one-to-one)
- All fields are optional (for flexibility)

---

## Best Practices

1. **Always include associations** when querying related data
2. **Use attributes** to select only needed fields and improve performance
3. **Store JSON in text fields** as JSON.stringify for old_value/new_value
4. **Create audit logs** whenever assets are modified
5. **Use transactions** for multi-table updates
6. **Index frequently queried fields** (asset_tag, purchase_id, assigned_to)

---

## Troubleshooting

**"Foreign key constraint failed"**
- Ensure referenced records exist (e.g., user exists before assigning asset)
- Check that FK values match primary key types

**"Duplicate key value"**
- asset_tag, purchase_id, contract_id, email must be unique
- Check for existing records before creating

**"Association not found"**
- Ensure models are properly associated in models/index.js
- Use correct association alias name

**"Cannot read property 'model'"**
- Model not initialized - ensure db.sync() completed successfully
- Check database connection in config/db.js
