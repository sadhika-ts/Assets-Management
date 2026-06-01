# Reports API Documentation

Complete documentation for the Asset Management System Reports API endpoints.

---

## Overview

The Reports API provides analytics and insights across the asset management system:
- Inventory summaries and breakdowns
- Asset assignment tracking
- Contract lifecycle monitoring
- Purchase analysis
- Asset depreciation calculations
- Audit trail history

All endpoints require authentication via JWT token. Some endpoints require admin role.

---

## Authentication

All endpoints require the `Authorization` header:

```bash
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN"
```

---

## Endpoints

### 1. GET /api/reports/inventory

**Description:** Get inventory summary report with breakdowns by category and sub-type.

**Authentication:** Required (any role)

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "message": "Inventory report retrieved successfully",
  "data": {
    "summary": {
      "total": 25,
      "active": 20,
      "inactive": 3,
      "disposed": 2
    },
    "byCategory": [
      {
        "category": "IT",
        "status": "active",
        "count": 18
      },
      {
        "category": "IT",
        "status": "inactive",
        "count": 2
      },
      {
        "category": "Non-IT",
        "status": "active",
        "count": 2
      }
    ],
    "bySubType": [
      {
        "sub_type": "Laptop",
        "status": "active",
        "count": 10
      },
      {
        "sub_type": "Desktop",
        "status": "active",
        "count": 5
      }
    ]
  }
}
```

**Example:**

```bash
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. GET /api/reports/assigned

**Description:** Get assets grouped by assigned user.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | UUID | Optional: Filter by specific user |

**Response:**

```json
{
  "success": true,
  "message": "Assignment report retrieved successfully",
  "data": {
    "total": 20,
    "byUser": {
      "John Doe": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "asset_tag": "LAP-001",
          "category": "IT",
          "sub_type": "Laptop",
          "status": "active",
          "assigned_to": "550e8400-e29b-41d4-a716-446655440010",
          "assignedUser": {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "name": "John Doe",
            "email": "john.doe@company.com",
            "role": "staff"
          },
          "detail": {
            "os_type": "Windows",
            "processor_name": "Intel Core i7",
            "ram_gb": 16,
            "disk_gb": 512
          }
        }
      ]
    }
  }
}
```

**Examples:**

```bash
# All assigned assets
curl -X GET http://localhost:5000/api/reports/assigned \
  -H "Authorization: Bearer $TOKEN"

# Assets for specific user
curl -X GET "http://localhost:5000/api/reports/assigned?user_id=550e8400-e29b-41d4-a716-446655440010" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. GET /api/reports/contract-status

**Description:** Get contract lifecycle report with expiring, expired, active, and upcoming contracts.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `days` | Integer | Optional: Days ahead to check (1-365, default: 30) |

**Response:**

```json
{
  "success": true,
  "message": "Contract status report retrieved successfully",
  "data": {
    "summary": {
      "expired": 1,
      "expiring": 2,
      "active": 5,
      "upcoming": 1
    },
    "expired": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "contract_id": "CNT-001",
        "name": "Software License 2023",
        "vendor_name": "Microsoft",
        "vendor_contact": "sales@microsoft.com",
        "active_from": "2023-01-01",
        "active_till": "2023-12-31",
        "status": "expired",
        "notes": "Renewal pending"
      }
    ],
    "expiring": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440101",
        "contract_id": "CNT-002",
        "name": "Maintenance Support",
        "vendor_name": "Dell",
        "active_till": "2026-06-15",
        "status": "active"
      }
    ],
    "active": [],
    "upcoming": []
  }
}
```

**Examples:**

```bash
# Contracts expiring in next 30 days (default)
curl -X GET http://localhost:5000/api/reports/contract-status \
  -H "Authorization: Bearer $TOKEN"

# Contracts expiring in next 60 days
curl -X GET "http://localhost:5000/api/reports/contract-status?days=60" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. GET /api/reports/purchases

**Description:** Get purchase summary report with breakdowns by status and date range.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | ISO8601 Date | Optional: Start date (YYYY-MM-DD) |
| `to` | ISO8601 Date | Optional: End date (YYYY-MM-DD) |

**Response:**

```json
{
  "success": true,
  "message": "Purchase report retrieved successfully",
  "data": {
    "summary": {
      "totalPurchases": 12,
      "totalAmount": 45000.50,
      "byStatus": {
        "completed": {
          "count": 10,
          "amount": 42000.00,
          "purchases": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440200",
              "purchase_id": "PUR-001",
              "vendor_name": "Dell Inc",
              "purchase_date": "2026-01-15",
              "total_amount": 5500.00,
              "status": "completed"
            }
          ]
        },
        "pending": {
          "count": 2,
          "amount": 3000.50,
          "purchases": []
        }
      }
    }
  }
}
```

**Examples:**

```bash
# All purchases
curl -X GET http://localhost:5000/api/reports/purchases \
  -H "Authorization: Bearer $TOKEN"

# Purchases in date range
curl -X GET "http://localhost:5000/api/reports/purchases?from=2026-01-01&to=2026-06-30" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. GET /api/reports/depreciation

**Description:** Get asset depreciation report using straight-line depreciation over 5-year life.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | String | Optional: Filter by category (IT or Non-IT) |

**Depreciation Formula:**

- Useful life: 5 years
- Method: Straight-line depreciation
- Current value = Purchase amount - (Purchase amount / 5) * years_old
- Minimum value: 0 (not negative)

**Response:**

```json
{
  "success": true,
  "message": "Depreciation report retrieved successfully",
  "data": {
    "summary": {
      "totalAssets": 25,
      "totalPurchaseValue": 125000.00,
      "totalDepreciation": 35000.00,
      "totalCurrentValue": 90000.00,
      "averageDepreciationPercent": 28.0
    },
    "assets": [
      {
        "asset_tag": "LAP-001",
        "category": "IT",
        "sub_type": "Laptop",
        "purchase_amount": 1500.00,
        "purchase_date": "2023-06-15",
        "years_old": 2.9,
        "depreciation": 870.00,
        "current_value": 630.00,
        "status": "active"
      },
      {
        "asset_tag": "DSK-001",
        "category": "IT",
        "sub_type": "Desktop",
        "purchase_amount": 800.00,
        "purchase_date": "2024-01-01",
        "years_old": 2.4,
        "depreciation": 384.00,
        "current_value": 416.00,
        "status": "active"
      }
    ]
  }
}
```

**Examples:**

```bash
# All assets
curl -X GET http://localhost:5000/api/reports/depreciation \
  -H "Authorization: Bearer $TOKEN"

# IT category only
curl -X GET "http://localhost:5000/api/reports/depreciation?category=IT" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. GET /api/reports/audit-logs

**Description:** Get detailed audit log report with filtering and pagination. **Admin only**.

**Authentication:** Required (admin role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset_id` | UUID | Optional: Filter by asset |
| `action` | String | Optional: Filter by action (partial match) |
| `from` | ISO8601 Date | Optional: Start date |
| `to` | ISO8601 Date | Optional: End date |
| `page` | Integer | Optional: Page number (default: 1) |
| `limit` | Integer | Optional: Records per page (1-100, default: 20) |

**Response:**

```json
{
  "success": true,
  "message": "Audit log report retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "asset_id": "550e8400-e29b-41d4-a716-446655440001",
        "user_id": "550e8400-e29b-41d4-a716-446655440010",
        "action": "Asset Updated",
        "old_value": "{\"status\":\"active\"}",
        "new_value": "{\"status\":\"inactive\"}",
        "changed_at": "2026-05-28T10:30:00Z",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Admin User",
          "email": "admin@company.com",
          "role": "admin"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

**Examples:**

```bash
# All audit logs (admin only)
curl -X GET http://localhost:5000/api/reports/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Logs for specific asset
curl -X GET "http://localhost:5000/api/reports/audit-logs?asset_id=550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Logs with pagination
curl -X GET "http://localhost:5000/api/reports/audit-logs?page=2&limit=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Logs for date range
curl -X GET "http://localhost:5000/api/reports/audit-logs?from=2026-05-01&to=2026-05-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Error Responses

All endpoints follow consistent error format:

**Validation Error (400):**

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

**Unauthorized (401):**

```json
{
  "success": false,
  "error": "No token provided",
  "message": "Authorization token is missing. Please include Bearer token in headers."
}
```

**Forbidden (403):**

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required role(s): admin. Your role: staff"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "error": "Failed to generate [report] report",
  "message": "Detailed error message"
}
```

---

## Testing

### Get Inventory Report

```bash
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Assets by User

```bash
curl -X GET http://localhost:5000/api/reports/assigned \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Contract Status with 45-day window

```bash
curl -X GET "http://localhost:5000/api/reports/contract-status?days=45" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Purchases from Jan 2026

```bash
curl -X GET "http://localhost:5000/api/reports/purchases?from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get IT Asset Depreciation

```bash
curl -X GET "http://localhost:5000/api/reports/depreciation?category=IT" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Get Audit Logs (Admin)

```bash
curl -X GET "http://localhost:5000/api/reports/audit-logs?limit=50&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

---

## Postman Collection

Import into Postman:

```json
{
  "info": {
    "name": "Reports API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Inventory Report",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/inventory",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Assignment Report",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/assigned",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Contract Status",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/contract-status?days=30",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Purchase Report",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/purchases",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Depreciation Report",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/depreciation",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Audit Logs (Admin)",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/audit-logs?page=1&limit=20",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    }
  ]
}
```

---

## Performance Notes

- **Inventory** endpoint aggregates counts (fast, minimal joins)
- **Assignment** endpoint includes detailed user and asset specs (medium load)
- **Depreciation** endpoint maps through all assets with calculations (moderate load for large inventories)
- **Audit logs** endpoint supports pagination (handles large datasets efficiently)

For large datasets (1000+ assets), use pagination on audit logs endpoint.

---

## Related Files

- [routes/reports.js](routes/reports.js) - Implementation
- [ASSETS_API.md](ASSETS_API.md) - Asset management endpoints
- [PURCHASES_API.md](PURCHASES_API.md) - Purchase management endpoints
- [CONTRACTS_API.md](CONTRACTS_API.md) - Contract management endpoints
