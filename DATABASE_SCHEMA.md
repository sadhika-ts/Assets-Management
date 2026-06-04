# Database Schema - IT Asset Inventory Management System

## Overview
- **Database Type**: PostgreSQL
- **ORM**: Sequelize
- **Total Tables**: 7
- **Primary Key Type**: UUID (Auto-generated)

---

## Table Structure

### 1. **ASSETS** Table
Stores core asset information

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(255) UNIQUE NOT NULL,
  category ENUM('IT', 'Non-IT') NOT NULL,
  sub_type VARCHAR(255) NOT NULL,
  other_subtype_description TEXT,
  serial_no VARCHAR(255),
  mac_address VARCHAR(255),
  status ENUM('active', 'inactive', 'disposed') DEFAULT 'active' NOT NULL,
  purchase_id UUID FOREIGN KEY REFERENCES purchases(id),
  assigned_to UUID FOREIGN KEY REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique asset identifier |
| asset_tag | VARCHAR(255) | NO | UNIQUE | Asset code (e.g., COMP-001) |
| category | ENUM | NO | | IT or Non-IT |
| sub_type | VARCHAR(255) | NO | | Type (Laptop, Chair, etc.) |
| other_subtype_description | TEXT | YES | | Custom subtype if "Other" selected |
| serial_no | VARCHAR(255) | YES | | Serial number |
| mac_address | VARCHAR(255) | YES | | MAC address |
| status | ENUM | NO | | active, inactive, disposed |
| purchase_id | UUID | YES | FK | Link to Purchase |
| assigned_to | UUID | YES | FK | Link to User |
| created_at | TIMESTAMP | NO | | Creation timestamp |

---

### 2. **ASSET_DETAILS** Table
Stores technical specifications for IT assets

```sql
CREATE TABLE asset_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID UNIQUE NOT NULL FOREIGN KEY REFERENCES assets(id),
  os_type VARCHAR(255),
  os_version VARCHAR(255),
  product_id VARCHAR(255),
  os_activated BOOLEAN DEFAULT FALSE,
  processor_name VARCHAR(255),
  manufacturer VARCHAR(255),
  cores INTEGER,
  ram_gb FLOAT,
  disk_gb FLOAT,
  disk_model VARCHAR(255),
  ms_office BOOLEAN DEFAULT FALSE,
  office_key VARCHAR(255),
  other_applications_installed BOOLEAN DEFAULT FALSE,
  other_applications_description TEXT,
  software_list TEXT,
  configuration TEXT,
  others TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique detail identifier |
| asset_id | UUID | NO | FK,UNIQUE | Link to Asset (1:1) |
| os_type | VARCHAR(255) | YES | | Windows, Linux, macOS |
| os_version | VARCHAR(255) | YES | | Version number |
| product_id | VARCHAR(255) | YES | | Windows product ID |
| os_activated | BOOLEAN | NO | | Activation status |
| processor_name | VARCHAR(255) | YES | | CPU name |
| manufacturer | VARCHAR(255) | YES | | Device manufacturer |
| cores | INTEGER | YES | | Number of CPU cores |
| ram_gb | FLOAT | YES | | RAM in GB |
| disk_gb | FLOAT | YES | | Disk capacity in GB |
| disk_model | VARCHAR(255) | YES | | Storage model |
| ms_office | BOOLEAN | NO | | Microsoft Office installed |
| office_key | VARCHAR(255) | YES | | License key |
| other_applications_installed | BOOLEAN | NO | | Other apps flag |
| other_applications_description | TEXT | YES | | List of other apps |
| software_list | TEXT | YES | | All installed software |
| configuration | TEXT | YES | | System configuration |
| others | TEXT | YES | | Additional notes |
| created_at | TIMESTAMP | NO | | Creation timestamp |

---

### 3. **PURCHASES** Table
Stores purchase order information

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id VARCHAR(255) UNIQUE NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_contact VARCHAR(255),
  vendor_email VARCHAR(255),
  billing_address TEXT,
  shipping_address TEXT,
  purchase_date DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(255) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique purchase identifier |
| purchase_id | VARCHAR(255) | NO | UNIQUE | PO number (e.g., PO-2024-001) |
| vendor_name | VARCHAR(255) | NO | | Vendor/Supplier name |
| vendor_contact | VARCHAR(255) | YES | | Phone number |
| vendor_email | VARCHAR(255) | YES | | Email address |
| billing_address | TEXT | YES | | Billing address |
| shipping_address | TEXT | YES | | Shipping address |
| purchase_date | DATE | NO | | Purchase date |
| total_amount | DECIMAL(12,2) | NO | | Amount in ₹ |
| status | VARCHAR(255) | NO | | pending, ordered, delivered, cancelled |
| created_at | TIMESTAMP | NO | | Creation timestamp |

---

### 4. **CONTRACTS** Table
Stores contract information

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  active_from DATE NOT NULL,
  active_till DATE NOT NULL,
  status ENUM('active', 'expired', 'upcoming') DEFAULT 'upcoming' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique contract identifier |
| contract_id | VARCHAR(255) | NO | UNIQUE | Contract number |
| name | VARCHAR(255) | NO | | Contract name |
| vendor_name | VARCHAR(255) | NO | | Vendor name |
| active_from | DATE | NO | | Start date |
| active_till | DATE | NO | | End date |
| status | ENUM | NO | | active, expired, upcoming |
| notes | TEXT | YES | | Additional notes |
| created_at | TIMESTAMP | NO | | Creation timestamp |

---

### 5. **USERS** Table
Stores user account information

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'viewer') DEFAULT 'staff' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique user identifier |
| name | VARCHAR(255) | NO | | Full name |
| email | VARCHAR(255) | NO | UNIQUE | Email address |
| password_hash | VARCHAR(255) | NO | | Hashed password |
| role | ENUM | NO | | admin, staff, viewer |
| created_at | TIMESTAMP | NO | | Creation timestamp |

---

### 6. **AUDIT_LOGS** Table
Tracks all changes to assets

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID FOREIGN KEY REFERENCES assets(id),
  user_id UUID NOT NULL FOREIGN KEY REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique log identifier |
| asset_id | UUID | YES | FK | Link to Asset |
| user_id | UUID | NO | FK | Link to User |
| action | VARCHAR(255) | NO | | Action performed |
| old_value | TEXT | YES | | Previous value |
| new_value | TEXT | YES | | New value |
| changed_at | TIMESTAMP | NO | | Timestamp |

---

### 7. **ASSET_HISTORY** Table
Maintains historical records of asset movements

```sql
CREATE TABLE asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL FOREIGN KEY REFERENCES assets(id),
  user_id UUID FOREIGN KEY REFERENCES users(id),
  action ENUM('created', 'updated', 'assigned', 'unassigned', 'repaired', 'deactivated') NOT NULL,
  previous_value JSON,
  new_value JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| id | UUID | NO | PK | Unique history identifier |
| asset_id | UUID | NO | FK | Link to Asset |
| user_id | UUID | YES | FK | Link to User |
| action | ENUM | NO | | Type of action |
| previous_value | JSON | YES | | Previous state |
| new_value | JSON | YES | | New state |
| description | TEXT | YES | | Action description |
| created_at | TIMESTAMP | NO | | Timestamp |

---

## Relationships (ER Diagram)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email           │
│ password_hash   │
│ role            │
└────────┬────────┘
         │
         │ (1:N) assigned_to
         │
         ├──────────────────┐
         │                  │
    ┌────▼──────────┐  ┌────▼──────────────┐
    │    ASSETS      │  │  AUDIT_LOGS       │
    ├────────────────┤  ├───────────────────┤
    │ id (PK)        │  │ id (PK)           │
    │ asset_tag      │  │ asset_id (FK)     │
    │ category       │  │ user_id (FK)      │
    │ sub_type       │  │ action            │
    │ status         │  │ old_value         │
    │ purchase_id(FK)├──┤ new_value         │
    │ assigned_to(FK)│  │ changed_at        │
    └────┬───────────┘  └───────────────────┘
         │
         │ (1:1)
         │
    ┌────▼──────────────────┐
    │  ASSET_DETAILS         │
    ├────────────────────────┤
    │ id (PK)                │
    │ asset_id (FK, UNIQUE)  │
    │ os_type                │
    │ processor_name         │
    │ ms_office              │
    │ other_applications...  │
    │ software_list          │
    └────────────────────────┘

┌──────────────────┐      ┌───────────────┐
│  PURCHASES       │      │  CONTRACTS    │
├──────────────────┤      ├───────────────┤
│ id (PK)          │      │ id (PK)       │
│ purchase_id      │      │ contract_id   │
│ vendor_name      │      │ name          │
│ vendor_contact   │      │ vendor_name   │
│ purchase_date    │      │ active_from   │
│ total_amount     │      │ active_till   │
│ status           │      │ status        │
└──────────────────┘      └───────────────┘

┌──────────────────────┐
│  ASSET_HISTORY       │
├──────────────────────┤
│ id (PK)              │
│ asset_id (FK)        │
│ user_id (FK)         │
│ action               │
│ previous_value (JSON)│
│ new_value (JSON)     │
└──────────────────────┘
```

---

## Key Relationships

### Foreign Keys:

1. **Assets → Purchases**
   - `assets.purchase_id` → `purchases.id`
   - One Purchase can have Many Assets
   - Optional (asset_id is nullable)

2. **Assets → Users**
   - `assets.assigned_to` → `users.id`
   - One User can be assigned Many Assets
   - Optional (assigned_to is nullable)

3. **Asset Details → Assets**
   - `asset_details.asset_id` → `assets.id`
   - One Asset has One AssetDetail
   - 1:1 relationship

4. **Audit Logs → Assets**
   - `audit_logs.asset_id` → `assets.id`
   - One Asset can have Many Audit Logs

5. **Audit Logs → Users**
   - `audit_logs.user_id` → `users.id`
   - One User can create Many Audit Logs

6. **Asset History → Assets**
   - `asset_history.asset_id` → `assets.id`
   - One Asset can have Many History Records

7. **Asset History → Users**
   - `asset_history.user_id` → `users.id`
   - One User can make Many History Entries

---

## Data Types Reference

| Type | Description | Examples |
|------|-------------|----------|
| UUID | Universal Unique Identifier | 550e8400-e29b-41d4-a716-446655440000 |
| VARCHAR(n) | Variable character string | Laptop, Dell, John Doe |
| TEXT | Large text | Software lists, notes |
| DATE | Date only | 2024-06-02 |
| TIMESTAMP | Date and time | 2024-06-02 14:30:00 |
| ENUM | Fixed set of values | active, inactive, disposed |
| BOOLEAN | True/False | true, false |
| DECIMAL(12,2) | Decimal with 2 decimals | 1234567890.12 |
| INTEGER | Whole number | 8, 16, 32 |
| FLOAT | Decimal number | 16.5, 512.0 |
| JSON | JSON format | {"key": "value"} |

---

## Indexes

Recommended indexes for performance:

```sql
-- Primary Keys (auto-indexed)
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_purchase_id ON assets(purchase_id);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_assets_status ON assets(status);

CREATE INDEX idx_purchases_purchase_id ON purchases(purchase_id);
CREATE INDEX idx_contracts_contract_id ON contracts(contract_id);

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_audit_logs_asset_id ON audit_logs(asset_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

CREATE INDEX idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX idx_asset_history_user_id ON asset_history(user_id);
```

---

## Sample Data Insertion

```sql
-- Insert Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john@example.com', 'hashed_password', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane@example.com', 'hashed_password', 'staff');

-- Insert Purchases
INSERT INTO purchases (id, purchase_id, vendor_name, purchase_date, total_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'PO-2024-001', 'Tech Solutions', '2024-01-15', 450000, 'delivered');

-- Insert Assets
INSERT INTO assets (id, asset_tag, category, sub_type, status, purchase_id, assigned_to) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'COMP-001', 'IT', 'Laptop', 'active', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000');

-- Insert Asset Details
INSERT INTO asset_details (id, asset_id, os_type, processor_name, ram_gb, disk_gb) VALUES
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Windows 11', 'Intel i7', 16, 512);

-- Insert Contracts
INSERT INTO contracts (id, contract_id, name, vendor_name, active_from, active_till, status) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'CON-2024-001', 'Microsoft License', 'Microsoft', '2024-01-01', '2025-12-31', 'active');
```

---

## Data Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| asset_tag | UNIQUE, NOT NULL | COMP-001 |
| category | Must be IT or Non-IT | IT |
| vendor_email | Must be valid email | vendor@example.com |
| status | Must be valid enum | active |
| purchase_date | Must be DATE | 2024-06-02 |
| total_amount | Must be positive decimal | 1000.00 |
| email | UNIQUE, valid email | user@example.com |
| password_hash | NOT NULL | (bcrypt hash) |

---

## Notes

1. **UUID Primary Keys**: All tables use UUID for scalability
2. **Timestamps**: All tables include `created_at` for audit trail
3. **Foreign Keys**: Maintain referential integrity
4. **Enums**: Enforce data consistency
5. **Nullable Fields**: Optional fields are marked as nullable
6. **Unique Constraints**: Prevent duplicate entries

---

## SQL Setup Commands

```sql
-- Create Database
CREATE DATABASE asset_inventory_db;

-- Connect to database
\c asset_inventory_db

-- Run migrations (via Sequelize)
npx sequelize-cli db:migrate

-- Seed initial data (if seeder exists)
npx sequelize-cli db:seed:all

-- Verify tables
\dt

-- View specific table structure
\d assets
```

---

This schema is designed for:
- ✅ Scalability with UUID primary keys
- ✅ Data integrity with foreign keys
- ✅ Audit trail with audit_logs and asset_history
- ✅ Flexibility with optional fields
- ✅ Performance with appropriate indexes
