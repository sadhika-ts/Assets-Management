# IT Asset Inventory Management System - API Overview

Complete API documentation for the Asset Management System.

---

## System Architecture

**Tech Stack:**
- Backend: Node.js + Express.js
- Database: PostgreSQL with Sequelize ORM
- Authentication: JWT (HS256, 7-day expiry)
- Password Security: bcryptjs (10 salt rounds)

**Key Features:**
- Role-based access control (admin, staff, viewer)
- Comprehensive audit logging
- Transaction-based operations
- Advanced filtering and search
- Pagination support
- Auto-status updates
- Depreciation calculations

---

## API Endpoints Overview

### Authentication (`/api/auth`)

Manage user authentication and sessions.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/auth/register` | POST | No | - | Create new user account |
| `/auth/login` | POST | No | - | Get JWT token |
| `/auth/me` | GET | Yes | Any | Get current user info |

**Documentation:** [AUTH_API.md](AUTH_API.md)

---

### Assets (`/api/assets`)

Core asset inventory management with detailed specifications.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/assets` | GET | Yes | Any | List all assets (filter, search, paginate) |
| `/assets/:id` | GET | Yes | Any | Get single asset with full details |
| `/assets` | POST | Yes | Admin/Staff | Create new asset |
| `/assets/:id` | PUT | Yes | Admin/Staff | Update asset details |
| `/assets/:id` | DELETE | Yes | Admin | Soft-delete asset (disposed) |
| `/assets/:id/assign` | PATCH | Yes | Admin/Staff | Assign asset to user |

**Features:**
- Filter by category (IT/Non-IT), status (active/inactive/disposed)
- Search by asset tag, serial number, software
- Pagination (default 10, max 100 per page)
- Automatic audit logging on all changes
- Asset detail specifications (OS, processor, RAM, disk, software, etc.)
- User assignment tracking
- Purchase linkage

**Documentation:** [ASSETS_API.md](ASSETS_API.md) | [ASSETS_TESTING.md](ASSETS_TESTING.md)

---

### Purchases (`/api/purchases`)

Track vendor purchases and procurement lifecycle.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/purchases` | GET | Yes | Any | List purchases (filter by vendor, status, date) |
| `/purchases/:id` | GET | Yes | Any | Get single purchase with assets |
| `/purchases` | POST | Yes | Admin | Create new purchase |
| `/purchases/:id` | PUT | Yes | Admin | Update purchase |
| `/purchases/:id` | DELETE | Yes | Admin | Delete purchase |

**Features:**
- Filter by vendor name (partial match), status (pending/completed/cancelled)
- Date range filtering (from/to)
- Pagination
- Vendor contact and billing information
- Link to all assets in purchase

**Documentation:** [PURCHASES_API.md](PURCHASES_API.md)

---

### Contracts (`/api/contracts`)

Manage service contracts and agreements with automatic expiry tracking.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/contracts` | GET | Yes | Any | List contracts (filter by status) |
| `/contracts/:id` | GET | Yes | Any | Get single contract |
| `/contracts` | POST | Yes | Admin | Create new contract |
| `/contracts/:id` | PUT | Yes | Admin | Update contract |
| `/contracts/:id` | DELETE | Yes | Admin | Delete contract |
| `/contracts/expiring/soon` | GET | Yes | Any | Contracts expiring in 30 days |

**Features:**
- Auto-status updates (active → expired when past due date)
- Filter by status (active/expired/upcoming)
- Date-based status determination
- Vendor contact tracking
- Auto-renewal reminders

**Documentation:** [CONTRACTS_API.md](CONTRACTS_API.md)

---

### Reports (`/api/reports`)

Analytics and business intelligence across all systems.

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/reports/inventory` | GET | Yes | Any | Asset count by category/status |
| `/reports/assigned` | GET | Yes | Any | Assets grouped by user |
| `/reports/contract-status` | GET | Yes | Any | Contract lifecycle analysis |
| `/reports/purchases` | GET | Yes | Any | Purchase summary by status/date |
| `/reports/depreciation` | GET | Yes | Any | Asset depreciation calculations |
| `/reports/audit-logs` | GET | Yes | Admin | Detailed change history |

**Features:**
- Real-time aggregation
- Filtering and date ranges
- Straight-line depreciation (5-year life)
- Pagination for audit logs
- Admin-only audit trail access

**Documentation:** [REPORTS_API.md](REPORTS_API.md) | [REPORTS_TESTING.md](REPORTS_TESTING.md)

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "role": "admin",
  "iat": 1717030800,
  "exp": 1717635600
}
```

- **Expiry:** 7 days
- **Algorithm:** HS256
- **Location:** `Authorization: Bearer <token>` header

### Roles & Permissions

| Role | Assets | Purchases | Contracts | Reports | Audit Logs |
|------|--------|-----------|-----------|---------|------------|
| **Admin** | CRUD | CRUD | CRUD | All | View |
| **Staff** | CRU | R | R | All (except Audit) | - |
| **Viewer** | R | R | R | All (except Audit) | - |

*Legend: C=Create, R=Read, U=Update, D=Delete*

---

## Common Query Parameters

### Pagination

All list endpoints support:

```bash
?page=1&limit=10
```

- **page:** Page number (default: 1)
- **limit:** Records per page (default: 10, max: 100)
- Response includes: `total`, `page`, `limit`, `totalPages`

### Filtering

**Status Filter (Assets):**
```bash
?status=active|inactive|disposed
```

**Category Filter (Assets):**
```bash
?category=IT|Non-IT
```

**Vendor Filter (Purchases):**
```bash
?vendor=dell  # Case-insensitive partial match
```

**Date Range (Purchases, Contracts):**
```bash
?from=2026-01-01&to=2026-12-31
```

### Search (Assets Only)

```bash
?search=LAP-001  # Searches asset_tag, serial_no, software_list
```

---

## Standard Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "asset": {...},
    "pagination": {...}
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "details": [...]
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| **200** | Request successful |
| **201** | Resource created |
| **400** | Validation failed |
| **401** | Missing/invalid token |
| **403** | Insufficient permissions |
| **404** | Resource not found |
| **409** | Conflict (duplicate ID) |
| **500** | Server error |

---

## Audit Logging

All asset changes are logged automatically:

- **Actions tracked:** Created, Updated, Disposed, Assigned
- **Information captured:** Old values, new values, user, timestamp
- **Storage:** JSON format in `AuditLog` table
- **Access:** Admins only via `/api/reports/audit-logs`

Example log entry:
```json
{
  "action": "Asset Updated",
  "old_value": {"ram_gb": 16},
  "new_value": {"ram_gb": 32},
  "user": {"name": "John Doe", "email": "john.doe@company.com"},
  "changed_at": "2026-05-29T10:30:00Z"
}
```

---

## Data Models

### User
- `id` (UUID)
- `name`, `email`, `password` (hashed)
- `role` (admin/staff/viewer)
- Associations: hasMany Asset, hasMany AuditLog

### Asset
- `id` (UUID), `asset_tag` (unique)
- `category` (IT/Non-IT), `sub_type`
- `status` (active/inactive/disposed)
- `serial_no`, `mac_address`
- `location`, `assigned_to` (user FK)
- Associations: hasOne AssetDetail, belongsTo Purchase, hasMany AuditLog

### AssetDetail
- Detailed specs: OS type, processor, cores, RAM, disk
- MS Office status and license key
- Software list, configuration notes
- Association: belongsTo Asset

### Purchase
- `id`, `purchase_id` (unique)
- Vendor info: name, contact, email
- Billing & shipping addresses
- `purchase_date`, `total_amount`
- `status` (pending/completed/cancelled)
- Associations: hasMany Asset

### Contract
- `id`, `contract_id` (unique)
- `name`, vendor info
- `active_from`, `active_till` dates
- `status` (active/expired/upcoming) - auto-updated
- `notes`

### AuditLog
- `id`, `asset_id` (FK), `user_id` (FK)
- `action` (string), `old_value` (JSON), `new_value` (JSON)
- `changed_at` (timestamp)

---

## Quick Start

### 1. Install & Setup

```bash
npm install
npm run sync-db        # Create/sync tables
npm run seed-db        # Populate sample data
npm run dev            # Start server
```

### 2. Authenticate

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | jq -r '.data.token')
```

### 3. Test Endpoints

```bash
# List assets
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" | jq

# Get reports
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Testing Files

- [ASSETS_TESTING.md](ASSETS_TESTING.md) - Asset API tests
- [REPORTS_TESTING.md](REPORTS_TESTING.md) - Reports API tests
- [AUTH_TESTING.md](AUTH_TESTING.md) - Authentication tests

Each file includes:
- curl examples
- Postman collection
- Bash test scripts
- Test checklists

---

## Environment Variables

```bash
# .env file
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/asset_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

---

## Performance Notes

- Database queries use indexes on frequently filtered columns
- Pagination reduces memory usage for large datasets
- Aggregate queries optimized with GROUP BY
- Transactions ensure data consistency
- Audit logging adds minimal overhead

---

## Security Features

- **Passwords:** Hashed with bcryptjs (10 rounds)
- **Tokens:** Signed JWT with 7-day expiry
- **Input:** Express-validator for all endpoints
- **Access:** Role-based middleware protection
- **Audit:** Complete change history
- **SQL:** Sequelize prevents injection

---

## Common Errors & Solutions

### "No token provided"
- Ensure `Authorization: Bearer <token>` header is included
- Token expires after 7 days, login again

### "Invalid category"
- Assets: use `IT` or `Non-IT` (case-sensitive)
- Purchases: use `pending`, `completed`, or `cancelled`

### "active_from must be before active_till"
- Contract start date must be before end date
- Both must be valid ISO8601 dates

### "Asset not found"
- Verify asset ID exists
- Soft-deleted (disposed) assets still exist in DB

### "Access denied"
- Check user role has permission for operation
- Some endpoints require admin role specifically

---

## Related Documentation

- [AUTH_API.md](AUTH_API.md) - Authentication details
- [ASSETS_API.md](ASSETS_API.md) - Asset endpoints
- [PURCHASES_API.md](PURCHASES_API.md) - Purchase endpoints
- [CONTRACTS_API.md](CONTRACTS_API.md) - Contract endpoints
- [REPORTS_API.md](REPORTS_API.md) - Report endpoints
- [MODELS.md](MODELS.md) - Database schema details

---

## Support

For issues or questions:
1. Check the relevant API documentation
2. Review test files for examples
3. Check server logs: `npm run dev`
4. Verify database connection
5. Ensure JWT token is valid

---

**System Version:** 1.0  
**Last Updated:** 2026-05-29  
**Status:** Production Ready
