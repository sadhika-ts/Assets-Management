# Assets API Documentation

Complete reference for the Asset Management API endpoints.

---

## Overview

The Assets API provides comprehensive asset inventory management with:
- Full CRUD operations (Create, Read, Update, Delete)
- Advanced filtering and search
- Transaction support (atomic operations)
- Automatic audit logging
- Role-based access control
- Asset assignment management

---

## Authentication

All endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

Get token from `/api/auth/login` or `/api/auth/register`.

---

## Endpoints

### GET /api/assets

List all assets with filtering, search, and pagination.

**Permission:** All authenticated users (view-only)

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| category | String | Filter by IT or Non-IT | `?category=IT` |
| sub_type | String | Partial match on sub_type | `?sub_type=laptop` |
| status | String | active, inactive, or disposed | `?status=active` |
| search | String | Search asset_tag, serial_no, or software | `?search=DEL-12345` |
| page | Integer | Page number (default: 1) | `?page=2` |
| limit | Integer | Records per page (default: 10, max: 100) | `?limit=25` |

**Request:**

```bash
curl -X GET "http://localhost:5000/api/assets?category=IT&status=active&page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "assets": [
      {
        "id": "uuid...",
        "asset_tag": "AST-2024-001",
        "category": "IT",
        "sub_type": "Laptop",
        "serial_no": "DL-12345-6789",
        "mac_address": "00:1A:2B:3C:4D:5E",
        "status": "active",
        "location": "Building A",
        "created_at": "2024-03-15T10:30:00Z",
        "detail": {
          "os_type": "Windows",
          "os_version": "11 Pro",
          "processor_name": "Intel Core i7",
          "cores": 8,
          "ram_gb": 16,
          "disk_gb": 512,
          "ms_office": true,
          "software_list": "VS Code, Git, Docker"
        },
        "assignedUser": {
          "id": "uuid...",
          "name": "John Doe",
          "email": "john@company.com",
          "role": "staff"
        },
        "purchase": {
          "purchase_id": "PO-2024-001",
          "vendor_name": "Dell",
          "purchase_date": "2024-01-15"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Error Responses:**

Invalid query parameter (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Invalid category",
      "param": "category",
      "location": "query"
    }
  ]
}
```

---

### GET /api/assets/:id

Get single asset with full details, assigned user, and recent audit logs.

**Permission:** All authenticated users

**Request:**

```bash
curl -X GET http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Asset retrieved successfully",
  "data": {
    "asset": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "asset_tag": "AST-2024-001",
      "category": "IT",
      "sub_type": "Laptop",
      "serial_no": "DL-12345-6789",
      "mac_address": "00:1A:2B:3C:4D:5E",
      "status": "active",
      "location": "Building A",
      "created_at": "2024-03-15T10:30:00Z",
      "updated_at": "2024-03-20T14:22:00Z",
      "detail": {
        "id": "uuid...",
        "asset_id": "uuid...",
        "os_type": "Windows",
        "os_version": "11 Pro",
        "product_id": "WIN-PRO-2024",
        "os_activated": true,
        "processor_name": "Intel Core i7-13700K",
        "manufacturer": "Dell",
        "cores": 16,
        "ram_gb": 32,
        "disk_gb": 512,
        "disk_model": "Samsung 980 Pro",
        "ms_office": true,
        "office_key": "XXXXX-XXXXX-XXXXX",
        "software_list": "VS Code, Git, Docker, Postman",
        "configuration": "Development machine",
        "others": "Thunderbolt 4, USB-C"
      },
      "assignedUser": {
        "id": "uuid...",
        "name": "John Doe",
        "email": "john@company.com",
        "role": "staff",
        "created_at": "2024-03-01T08:00:00Z"
      },
      "purchase": {
        "id": "uuid...",
        "purchase_id": "PO-2024-001",
        "vendor_name": "Dell Technologies",
        "vendor_contact": "+1-800-123-4567",
        "purchase_date": "2024-01-15",
        "total_amount": "1500.00"
      },
      "auditLogs": [
        {
          "id": "uuid...",
          "action": "Asset Assigned",
          "old_value": "{\"assigned_to\":null}",
          "new_value": "{\"assigned_to\":\"uuid...\",\"assigned_user\":\"John Doe\"}",
          "changed_at": "2024-03-20T14:22:00Z",
          "user": {
            "name": "Admin User",
            "email": "admin@company.com"
          }
        }
      ]
    }
  }
}
```

**Error Response - Not Found (404):**

```json
{
  "success": false,
  "error": "Asset not found",
  "message": "The requested asset does not exist."
}
```

---

### POST /api/assets

Create new asset with details in atomic transaction.

**Permission:** admin, staff

**Request Body:**

```json
{
  "asset_tag": "AST-2024-042",
  "category": "IT",
  "sub_type": "Laptop",
  "serial_no": "DL-98765-4321",
  "mac_address": "00:2B:3C:4D:5E:6F",
  "purchase_id": "550e8400-e29b-41d4-a716-446655440001",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440002",
  "location": "Building B",
  "os_type": "Windows",
  "os_version": "11 Pro",
  "product_id": "WIN-PRO-2024",
  "processor_name": "Intel Core i7",
  "manufacturer": "Dell",
  "cores": 8,
  "ram_gb": 16,
  "disk_gb": 256,
  "disk_model": "Samsung SSD",
  "ms_office": true,
  "software_list": "Office, Teams, OneDrive"
}
```

**Validation Rules:**

| Field | Required | Rules |
|-------|----------|-------|
| asset_tag | Yes | Non-empty, must be unique |
| category | Yes | Must be "IT" or "Non-IT" |
| sub_type | Yes | Non-empty string |
| serial_no | No | String |
| mac_address | No | String |
| purchase_id | No | Valid UUID |
| assigned_to | No | Valid UUID (must be existing user) |
| location | No | String |
| os_type | No | String |
| cores | No | Positive integer |
| ram_gb | No | Non-negative float |
| disk_gb | No | Non-negative float |

**Request:**

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "AST-2024-042",
    "category": "IT",
    "sub_type": "Laptop",
    "os_type": "Windows",
    "ram_gb": 16,
    "disk_gb": 256
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "asset": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "asset_tag": "AST-2024-042",
      "category": "IT",
      "sub_type": "Laptop",
      "status": "active",
      "detail": {
        "os_type": "Windows",
        "ram_gb": 16,
        "disk_gb": 256
      },
      "assignedUser": null
    }
  }
}
```

**Error Responses:**

Duplicate asset_tag (409):
```json
{
  "success": false,
  "error": "Asset already exists",
  "message": "An asset with this tag already exists."
}
```

Validation failed (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Category must be IT or Non-IT",
      "param": "category"
    }
  ]
}
```

Insufficient permissions (403):
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required role(s): admin, staff. Your role: viewer"
}
```

---

### PUT /api/assets/:id

Update asset and/or details. Only provided fields are updated.

**Permission:** admin, staff

**Request Body:** (all fields optional)

```json
{
  "sub_type": "Desktop",
  "location": "Building C",
  "os_version": "11 Pro (Updated)",
  "ram_gb": 32,
  "software_list": "New software list"
}
```

**Request:**

```bash
curl -X PUT http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440100 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ram_gb": 32,
    "disk_gb": 512,
    "software_list": "Updated software list"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "asset": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "asset_tag": "AST-2024-042",
      "category": "IT",
      "sub_type": "Laptop",
      "status": "active",
      "detail": {
        "ram_gb": 32,
        "disk_gb": 512,
        "software_list": "Updated software list"
      }
    }
  }
}
```

**Audit Log Entry:**

When asset is updated, an audit log entry is created:

```json
{
  "asset_id": "uuid...",
  "user_id": "uuid...",
  "action": "Asset Updated",
  "old_value": "{\"ram_gb\": 16, \"disk_gb\": 256}",
  "new_value": "{\"ram_gb\": 32, \"disk_gb\": 512}",
  "changed_at": "2024-03-20T14:30:00Z"
}
```

**Error Responses:**

Asset not found (404):
```json
{
  "success": false,
  "error": "Asset not found",
  "message": "The requested asset does not exist."
}
```

---

### DELETE /api/assets/:id

Soft delete asset (set status to "disposed"). Hard deletion is not supported for audit trail integrity.

**Permission:** admin only

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440100 \
  -H "Authorization: Bearer TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Asset disposed successfully",
  "data": {
    "asset": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "asset_tag": "AST-2024-042",
      "status": "disposed",
      "updated_at": "2024-03-20T14:35:00Z"
    }
  }
}
```

**Audit Log Entry:**

```json
{
  "asset_id": "uuid...",
  "user_id": "uuid...",
  "action": "Asset Disposed",
  "old_value": "{\"status\": \"active\"}",
  "new_value": "{\"status\": \"disposed\"}",
  "changed_at": "2024-03-20T14:35:00Z"
}
```

**Error Responses:**

Asset not found (404):
```json
{
  "success": false,
  "error": "Asset not found",
  "message": "The requested asset does not exist."
}
```

Insufficient permissions (403):
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required role(s): admin. Your role: staff"
}
```

---

### PATCH /api/assets/:id/assign

Assign asset to a user.

**Permission:** admin, staff

**Request Body:**

```json
{
  "assigned_to": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Validation Rules:**

| Field | Required | Rules |
|-------|----------|-------|
| assigned_to | Yes | Valid UUID, must be existing user |

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440100/assign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": "550e8400-e29b-41d4-a716-446655440002"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Asset assigned successfully",
  "data": {
    "asset": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "asset_tag": "AST-2024-042",
      "assigned_to": "550e8400-e29b-41d4-a716-446655440002",
      "assignedUser": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "role": "staff"
      }
    }
  }
}
```

**Audit Log Entry:**

```json
{
  "asset_id": "uuid...",
  "user_id": "uuid...",
  "action": "Asset Assigned",
  "old_value": "{\"assigned_to\": null}",
  "new_value": "{\"assigned_to\": \"uuid...\", \"assigned_user\": \"Jane Smith\"}",
  "changed_at": "2024-03-20T14:40:00Z"
}
```

**Error Responses:**

Asset not found (404):
```json
{
  "success": false,
  "error": "Asset not found",
  "message": "The requested asset does not exist."
}
```

User not found (404):
```json
{
  "success": false,
  "error": "User not found",
  "message": "The specified user does not exist."
}
```

Invalid user ID (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Valid user ID is required",
      "param": "assigned_to"
    }
  ]
}
```

---

## Data Models

### Asset Response Object

```typescript
interface Asset {
  id: string;                    // UUID
  asset_tag: string;            // Unique identifier
  category: "IT" | "Non-IT";   // Asset category
  sub_type: string;             // Device type (Laptop, Desktop, Monitor, etc.)
  serial_no?: string;           // Manufacturer serial number
  mac_address?: string;         // Network MAC address
  status: "active" | "inactive" | "disposed";
  purchase_id?: string;         // FK to Purchase
  assigned_to?: string;         // FK to User
  location?: string;            // Physical location
  created_at: string;          // ISO 8601 datetime
  updated_at: string;          // ISO 8601 datetime
  
  // Joined data
  detail?: AssetDetail;
  assignedUser?: User;
  purchase?: Purchase;
  auditLogs?: AuditLog[];
}
```

### AssetDetail Response Object

```typescript
interface AssetDetail {
  id: string;                        // UUID
  asset_id: string;                 // FK to Asset
  os_type?: string;                 // OS type (Windows, Linux, macOS)
  os_version?: string;              // Version
  product_id?: string;              // Product key ID
  os_activated?: boolean;           // License activation status
  processor_name?: string;          // CPU model
  manufacturer?: string;            // Device manufacturer
  cores?: number;                   // CPU cores
  ram_gb?: number;                  // RAM in GB
  disk_gb?: number;                 // Storage in GB
  disk_model?: string;              // Storage model
  ms_office?: boolean;              // Microsoft Office installed
  office_key?: string;              // Office license key
  software_list?: string;           // Comma-separated software
  configuration?: string;           // Custom config notes
  others?: string;                  // Additional info
}
```

---

## Filtering Examples

### Get all active IT assets

```bash
curl -X GET "http://localhost:5000/api/assets?category=IT&status=active" \
  -H "Authorization: Bearer TOKEN"
```

### Search by serial number

```bash
curl -X GET "http://localhost:5000/api/assets?search=DL-12345" \
  -H "Authorization: Bearer TOKEN"
```

### Filter by sub_type and paginate

```bash
curl -X GET "http://localhost:5000/api/assets?sub_type=laptop&page=2&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

### Combined filters

```bash
curl -X GET "http://localhost:5000/api/assets?category=IT&status=active&sub_type=laptop&page=1" \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Handling

### HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | Success (GET, PUT, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Validation failed, invalid input |
| 404 | Resource not found |
| 409 | Conflict (duplicate asset_tag) |
| 403 | Forbidden (insufficient permissions) |
| 500 | Server error |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed explanation",
  "details": [ /* validation errors */ ]
}
```

---

## Transactions & Atomicity

All write operations use database transactions:

- **POST /api/assets** - Creates asset AND asset_detail in single transaction
- **PUT /api/assets/:id** - Updates asset AND details atomically
- **DELETE /api/assets/:id** - Disposes asset and logs change atomically
- **PATCH /api/assets/:id/assign** - Updates assignment and logs change atomically

If any step fails, entire operation is rolled back (no partial updates).

---

## Audit Logging

Every create, update, delete, and assign operation is logged automatically:

```json
{
  "asset_id": "uuid...",
  "user_id": "uuid...",
  "action": "Asset Created|Updated|Disposed|Assigned",
  "old_value": "JSON string of previous values",
  "new_value": "JSON string of new values",
  "changed_at": "2024-03-20T14:30:00Z"
}
```

Retrieved via GET /api/assets/:id in `auditLogs` array (last 10 entries).

---

## Role-Based Access

| Endpoint | GET | POST | PUT | DELETE | PATCH/Assign |
|----------|-----|------|-----|--------|------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staff | ✅ | ✅ | ✅ | ❌ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Performance Considerations

- **Pagination:** Default 10 per page, max 100
- **Search:** Case-insensitive partial matching
- **Filtering:** Indexed queries on category, status
- **Joins:** Eagerly loaded with includes
- **Audit Logs:** Limited to 10 most recent entries per asset

---

## Related Files

- [routes/assets.js](routes/assets.js) - Complete implementation
- [middleware/auth.js](middleware/auth.js) - Authentication
- [MODELS.md](MODELS.md) - Database models
- [AUTH_GUIDE.md](AUTH_GUIDE.md) - JWT authentication
- [ASSETS_TESTING.md](ASSETS_TESTING.md) - Testing guide
