# Sequelize Model Associations

Complete reference for all model relationships and associations.

## Association Matrix

| From Model | Association Type | To Model | Foreign Key | Alias |
|------------|------------------|----------|-------------|-------|
| User | hasMany | Asset | assigned_to | assignedAssets |
| User | hasMany | AuditLog | user_id | auditLogs |
| Purchase | hasMany | Asset | purchase_id | assets |
| Asset | belongsTo | Purchase | purchase_id | purchase |
| Asset | belongsTo | User | assigned_to | assignedUser |
| Asset | hasOne | AssetDetail | asset_id | detail |
| Asset | hasMany | AuditLog | asset_id | auditLogs |
| AssetDetail | belongsTo | Asset | asset_id | asset |
| AuditLog | belongsTo | Asset | asset_id | asset |
| AuditLog | belongsTo | User | user_id | user |

---

## Detailed Association Definitions

### 1. User → Asset (1:Many)
**Type:** hasMany / belongsTo

**User side:**
```javascript
User.associate = (models) => {
  User.hasMany(models.Asset, {
    foreignKey: 'assigned_to',
    as: 'assignedAssets'
  });
};
```

**Asset side:**
```javascript
Asset.associate = (models) => {
  Asset.belongsTo(models.User, {
    foreignKey: 'assigned_to',
    as: 'assignedUser'
  });
};
```

**Usage:**
```javascript
// Get user with assigned assets
const user = await User.findByPk(userId, {
  include: [{ association: 'assignedAssets' }]
});

// Get asset with assigned user
const asset = await Asset.findByPk(assetId, {
  include: [{ association: 'assignedUser' }]
});

// Find all assets assigned to a user
const userAssets = await Asset.findAll({
  where: { assigned_to: userId }
});
```

---

### 2. User → AuditLog (1:Many)
**Type:** hasMany / belongsTo

**User side:**
```javascript
User.associate = (models) => {
  User.hasMany(models.AuditLog, {
    foreignKey: 'user_id',
    as: 'auditLogs'
  });
};
```

**AuditLog side:**
```javascript
AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};
```

**Usage:**
```javascript
// Get user with their audit logs
const user = await User.findByPk(userId, {
  include: [{ association: 'auditLogs' }]
});

// Get all actions by a user
const userActions = await AuditLog.findAll({
  where: { user_id: userId },
  order: [['changed_at', 'DESC']]
});

// Get audit log with user info
const log = await AuditLog.findByPk(logId, {
  include: [{ association: 'user' }]
});
```

---

### 3. Purchase → Asset (1:Many)
**Type:** hasMany / belongsTo

**Purchase side:**
```javascript
Purchase.associate = (models) => {
  Purchase.hasMany(models.Asset, {
    foreignKey: 'purchase_id',
    as: 'assets'
  });
};
```

**Asset side:**
```javascript
Asset.associate = (models) => {
  Asset.belongsTo(models.Purchase, {
    foreignKey: 'purchase_id',
    as: 'purchase'
  });
};
```

**Usage:**
```javascript
// Get purchase with all assets
const purchase = await Purchase.findByPk(purchaseId, {
  include: [{ association: 'assets' }]
});

// Get asset with purchase info
const asset = await Asset.findByPk(assetId, {
  include: [{ association: 'purchase' }]
});

// Find all assets from a purchase
const purchaseAssets = await Asset.findAll({
  where: { purchase_id: purchaseId }
});
```

---

### 4. Asset → AssetDetail (1:1)
**Type:** hasOne / belongsTo

**Asset side:**
```javascript
Asset.associate = (models) => {
  Asset.hasOne(models.AssetDetail, {
    foreignKey: 'asset_id',
    as: 'detail'
  });
};
```

**AssetDetail side:**
```javascript
AssetDetail.associate = (models) => {
  AssetDetail.belongsTo(models.Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
  });
};
```

**Usage:**
```javascript
// Get asset with details
const asset = await Asset.findByPk(assetId, {
  include: [{ association: 'detail' }]
});

// Get details for an asset
const details = await AssetDetail.findOne({
  where: { asset_id: assetId }
});

// Get detail with asset
const detail = await AssetDetail.findByPk(detailId, {
  include: [{ association: 'asset' }]
});

// Create asset with detail
const asset = await Asset.create({
  asset_tag: 'AST-001',
  category: 'IT',
  // ...
});

await AssetDetail.create({
  asset_id: asset.id,
  os_type: 'Windows',
  // ...
});
```

---

### 5. Asset → AuditLog (1:Many)
**Type:** hasMany / belongsTo

**Asset side:**
```javascript
Asset.associate = (models) => {
  Asset.hasMany(models.AuditLog, {
    foreignKey: 'asset_id',
    as: 'auditLogs'
  });
};
```

**AuditLog side:**
```javascript
AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
  });
};
```

**Usage:**
```javascript
// Get asset with change history
const asset = await Asset.findByPk(assetId, {
  include: [{ association: 'auditLogs', include: ['user'] }]
});

// Get asset change history
const history = await AuditLog.findAll({
  where: { asset_id: assetId },
  order: [['changed_at', 'DESC']]
});

// Log an asset change
await AuditLog.create({
  asset_id: assetId,
  user_id: userId,
  action: 'Status Changed',
  old_value: JSON.stringify({ status: 'active' }),
  new_value: JSON.stringify({ status: 'inactive' })
});
```

---

## Complete Asset with All Relationships

Get a full asset record with all related data:

```javascript
const completeAsset = await Asset.findByPk(assetId, {
  include: [
    {
      association: 'purchase',
      attributes: ['purchase_id', 'vendor_name', 'total_amount']
    },
    {
      association: 'assignedUser',
      attributes: ['id', 'name', 'email', 'role']
    },
    {
      association: 'detail',
      attributes: [
        'os_type', 'os_version', 'processor_name',
        'cores', 'ram_gb', 'disk_gb', 'ms_office'
      ]
    },
    {
      association: 'auditLogs',
      include: [{
        association: 'user',
        attributes: ['name', 'email']
      }],
      order: [['changed_at', 'DESC']],
      limit: 10
    }
  ]
});
```

**Returns:**
```json
{
  "id": "uuid",
  "asset_tag": "AST-2024-001",
  "category": "IT",
  "sub_type": "Laptop",
  "serial_no": "DL-12345-6789",
  "mac_address": "00:1A:2B:3C:4D:5E",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "purchase": {
    "purchase_id": "PO-2024-001",
    "vendor_name": "Dell Technologies",
    "total_amount": "5500.00"
  },
  "assignedUser": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "staff"
  },
  "detail": {
    "os_type": "Windows",
    "os_version": "11 Pro",
    "processor_name": "Intel Core i7-13700K",
    "cores": 16,
    "ram_gb": 32,
    "disk_gb": 512,
    "ms_office": true
  },
  "auditLogs": [
    {
      "id": "uuid",
      "action": "Asset Created",
      "changed_at": "2024-01-15T10:30:00Z",
      "user": {
        "name": "Admin User",
        "email": "admin@company.com"
      }
    }
  ]
}
```

---

## Advanced Query Patterns

### Get User with All Related Data
```javascript
const user = await User.findByPk(userId, {
  include: [
    {
      association: 'assignedAssets',
      include: [
        { association: 'detail' },
        { association: 'purchase' }
      ]
    },
    {
      association: 'auditLogs',
      include: [{ association: 'asset' }],
      order: [['changed_at', 'DESC']],
      limit: 20
    }
  ]
});
```

### Get Purchase with All Assets and Details
```javascript
const purchase = await Purchase.findByPk(purchaseId, {
  include: [
    {
      association: 'assets',
      include: [
        { association: 'detail' },
        { association: 'assignedUser' }
      ]
    }
  ]
});
```

### Get Active Assets with Assigned Users
```javascript
const activeAssets = await Asset.findAll({
  where: { status: 'active' },
  include: [
    { association: 'assignedUser', attributes: ['name', 'email'] },
    { association: 'detail' },
    { association: 'purchase' }
  ]
});
```

### Get Recent Changes with User Info
```javascript
const recentChanges = await AuditLog.findAll({
  include: [
    { association: 'user', attributes: ['name', 'email'] },
    { association: 'asset', attributes: ['asset_tag', 'sub_type'] }
  ],
  order: [['changed_at', 'DESC']],
  limit: 50
});
```

### Count Assets by User
```javascript
const assetsByUser = await Asset.findAll({
  attributes: [
    'assigned_to',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  include: [{
    association: 'assignedUser',
    attributes: ['name', 'email'],
    required: true
  }],
  group: ['assigned_to'],
  raw: true
});
```

---

## Eager Loading vs Lazy Loading

### Eager Loading (Include)
```javascript
// Fetch user and assets in one query
const user = await User.findByPk(userId, {
  include: [{ association: 'assignedAssets' }]
});

console.log(user.assignedAssets); // Already loaded
```

### Lazy Loading
```javascript
// Fetch user first
const user = await User.findByPk(userId);

// Load assets later (separate query)
const assets = await user.getAssignedAssets();
```

---

## Sequelize Helper Methods

When associations are defined, Sequelize provides helper methods:

```javascript
// For hasMany association
const assets = await user.getAssignedAssets();
await user.addAssignedAssets(asset);
await user.removeAssignedAssets(asset);
await user.setAssignedAssets([asset1, asset2]);

// For belongsTo association
const user = await asset.getAssignedUser();
await asset.setAssignedUser(userId);

// For hasOne association
const detail = await asset.getDetail();
await asset.setDetail(detailId);

// For counting
const count = await user.countAssignedAssets();
```

---

## Relationship Cardinality

| Relationship | From | To | Cardinality |
|-------------|------|----|----|
| User → Asset | 1 | Many | 1:N |
| User → AuditLog | 1 | Many | 1:N |
| Purchase → Asset | 1 | Many | 1:N |
| Asset → AssetDetail | 1 | 1 | 1:1 |
| Asset → AuditLog | 1 | Many | 1:N |
| Contract | - | - | Standalone |

---

## Foreign Key Constraints

```sql
-- Asset.purchase_id → Purchase.id
ALTER TABLE assets
ADD CONSTRAINT fk_assets_purchase_id
FOREIGN KEY (purchase_id) REFERENCES purchases(id);

-- Asset.assigned_to → User.id
ALTER TABLE assets
ADD CONSTRAINT fk_assets_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id);

-- AssetDetail.asset_id → Asset.id
ALTER TABLE asset_details
ADD CONSTRAINT fk_asset_details_asset_id
FOREIGN KEY (asset_id) REFERENCES assets(id);

-- AuditLog.asset_id → Asset.id
ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_logs_asset_id
FOREIGN KEY (asset_id) REFERENCES assets(id);

-- AuditLog.user_id → User.id
ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_logs_user_id
FOREIGN KEY (user_id) REFERENCES users(id);
```

---

## Cascade Options

Current configuration (implicit):
- **ON DELETE:** SET NULL (for nullable FKs)
- **ON UPDATE:** CASCADE

For strict referential integrity:
```javascript
Asset.belongsTo(models.Purchase, {
  foreignKey: 'purchase_id',
  onDelete: 'RESTRICT',  // Prevent deletion if assets exist
  onUpdate: 'CASCADE'
});
```

---

## Testing Associations

```javascript
// Create test data
const user = await User.create({
  name: 'Test User',
  email: 'test@example.com',
  password_hash: 'hash',
  role: 'staff'
});

const asset = await Asset.create({
  asset_tag: 'TEST-001',
  category: 'IT',
  sub_type: 'Laptop',
  assigned_to: user.id
});

// Test association
const userWithAssets = await User.findByPk(user.id, {
  include: ['assignedAssets']
});

console.log(userWithAssets.assignedAssets); // [asset]
```

---

**All associations are properly configured and ready to use! 🎯**
