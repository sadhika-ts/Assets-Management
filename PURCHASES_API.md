# Purchases API Documentation

Complete documentation for the Asset Management System Purchases API endpoints.

---

## Overview

The Purchases API manages vendor purchases and their associated assets:
- Track all purchases with vendor information
- Link assets to purchases
- Filter by vendor, status, and date range
- Manage purchase lifecycle (pending → completed)

All endpoints require authentication via JWT token. Create, update, and delete operations require admin role.

---

## Authentication

All endpoints require the `Authorization` header:

```bash
curl -X GET http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $TOKEN"
```

---

## Endpoints

### 1. GET /api/purchases

**Description:** List all purchases with filtering and pagination.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `vendor` | String | Optional: Search vendor name (partial match, case-insensitive) |
| `status` | String | Optional: Filter by status - `pending`, `completed`, `cancelled` |
| `from` | ISO8601 Date | Optional: Start date (YYYY-MM-DD) |
| `to` | ISO8601 Date | Optional: End date (YYYY-MM-DD) |
| `page` | Integer | Optional: Page number (default: 1) |
| `limit` | Integer | Optional: Records per page (1-100, default: 10) |

**Response:**

```json
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "purchases": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "purchase_id": "PUR-001",
        "vendor_name": "Dell Inc",
        "vendor_contact": "+1-800-123-4567",
        "vendor_email": "sales@dell.com",
        "billing_address": "123 Tech Street, Silicon Valley, CA 94025",
        "shipping_address": "456 Office Park, San Jose, CA 95110",
        "purchase_date": "2026-01-15",
        "total_amount": 5500.00,
        "status": "completed",
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-20T14:22:00Z",
        "assets": [
          {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "asset_tag": "LAP-001",
            "category": "IT",
            "sub_type": "Laptop",
            "status": "active"
          }
        ]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

**Examples:**

```bash
# All purchases (default pagination)
curl -X GET http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $TOKEN"

# Filter by vendor
curl -X GET "http://localhost:5000/api/purchases?vendor=Dell" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/purchases?status=completed" \
  -H "Authorization: Bearer $TOKEN"

# Date range (Q1 2026)
curl -X GET "http://localhost:5000/api/purchases?from=2026-01-01&to=2026-03-31" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters with pagination
curl -X GET "http://localhost:5000/api/purchases?vendor=Dell&status=completed&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. GET /api/purchases/:id

**Description:** Get single purchase with all linked assets and assigned users.

**Authentication:** Required (any role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Purchase ID |

**Response:**

```json
{
  "success": true,
  "message": "Purchase retrieved successfully",
  "data": {
    "purchase": {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "purchase_id": "PUR-001",
      "vendor_name": "Dell Inc",
      "vendor_contact": "+1-800-123-4567",
      "vendor_email": "sales@dell.com",
      "billing_address": "123 Tech Street, Silicon Valley, CA 94025",
      "shipping_address": "456 Office Park, San Jose, CA 95110",
      "purchase_date": "2026-01-15",
      "total_amount": 5500.00,
      "status": "completed",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-20T14:22:00Z",
      "assets": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "asset_tag": "LAP-001",
          "category": "IT",
          "sub_type": "Laptop",
          "serial_no": "DELL-12345",
          "mac_address": "00:11:22:33:44:55",
          "status": "active",
          "assigned_to": "550e8400-e29b-41d4-a716-446655440010",
          "created_at": "2026-01-15T10:30:00Z",
          "assignedUser": {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "name": "John Doe",
            "email": "john.doe@company.com"
          }
        }
      ]
    }
  }
}
```

**Examples:**

```bash
# Get specific purchase
curl -X GET "http://localhost:5000/api/purchases/550e8400-e29b-41d4-a716-446655440200" \
  -H "Authorization: Bearer $TOKEN"

# Not found
curl -X GET "http://localhost:5000/api/purchases/invalid-id" \
  -H "Authorization: Bearer $TOKEN"
```

**Status Codes:**
- 200: Success
- 404: Purchase not found
- 401: Unauthorized

---

### 3. POST /api/purchases

**Description:** Create new purchase. **Admin only**.

**Authentication:** Required (admin role)

**Request Body:**

```json
{
  "purchase_id": "PUR-002",
  "vendor_name": "HP Inc",
  "vendor_contact": "+1-800-HP-INVENT",
  "vendor_email": "sales@hp.com",
  "billing_address": "11 Inkjet Lane, Boise, ID 83716",
  "shipping_address": "22 Printer Drive, Palo Alto, CA 94301",
  "purchase_date": "2026-02-10",
  "total_amount": 3200.50,
  "status": "pending"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `purchase_id` | Required, unique, max 100 chars |
| `vendor_name` | Required, max 255 chars |
| `vendor_contact` | Optional, max 100 chars |
| `vendor_email` | Optional, must be valid email format |
| `billing_address` | Optional, max 500 chars |
| `shipping_address` | Optional, max 500 chars |
| `purchase_date` | Required, ISO8601 date format |
| `total_amount` | Required, positive number |
| `status` | Optional, one of: `pending`, `completed`, `cancelled` (default: `pending`) |

**Response:**

```json
{
  "success": true,
  "message": "Purchase created successfully",
  "data": {
    "purchase": {
      "id": "550e8400-e29b-41d4-a716-446655440201",
      "purchase_id": "PUR-002",
      "vendor_name": "HP Inc",
      "vendor_contact": "+1-800-HP-INVENT",
      "vendor_email": "sales@hp.com",
      "billing_address": "11 Inkjet Lane, Boise, ID 83716",
      "shipping_address": "22 Printer Drive, Palo Alto, CA 94301",
      "purchase_date": "2026-02-10",
      "total_amount": 3200.50,
      "status": "pending",
      "created_at": "2026-02-10T09:15:00Z",
      "updated_at": "2026-02-10T09:15:00Z"
    }
  }
}
```

**Examples:**

```bash
# Create purchase with all details
curl -X POST http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "PUR-002",
    "vendor_name": "HP Inc",
    "vendor_contact": "+1-800-HP-INVENT",
    "vendor_email": "sales@hp.com",
    "billing_address": "11 Inkjet Lane, Boise, ID 83716",
    "shipping_address": "22 Printer Drive, Palo Alto, CA 94301",
    "purchase_date": "2026-02-10",
    "total_amount": 3200.50,
    "status": "pending"
  }'

# Create minimal purchase
curl -X POST http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "PUR-003",
    "vendor_name": "Lenovo",
    "purchase_date": "2026-03-01",
    "total_amount": 2500.00
  }'
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 409: Duplicate purchase_id
- 403: Forbidden (non-admin)
- 401: Unauthorized

---

### 4. PUT /api/purchases/:id

**Description:** Update purchase details. **Admin only**.

**Authentication:** Required (admin role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Purchase ID |

**Request Body:** (all fields optional)

```json
{
  "vendor_name": "HP Enterprise",
  "status": "completed",
  "total_amount": 3200.75
}
```

**Response:**

```json
{
  "success": true,
  "message": "Purchase updated successfully",
  "data": {
    "purchase": {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "purchase_id": "PUR-001",
      "vendor_name": "HP Enterprise",
      "total_amount": 3200.75,
      "status": "completed",
      "purchase_date": "2026-01-15",
      "updated_at": "2026-05-29T15:45:00Z"
    }
  }
}
```

**Examples:**

```bash
# Update status to completed
curl -X PUT "http://localhost:5000/api/purchases/550e8400-e29b-41d4-a716-446655440200" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Update multiple fields
curl -X PUT "http://localhost:5000/api/purchases/550e8400-e29b-41d4-a716-446655440200" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_email": "newemail@hp.com",
    "total_amount": 3500.00,
    "status": "completed"
  }'
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 404: Purchase not found
- 403: Forbidden (non-admin)
- 401: Unauthorized

---

### 5. DELETE /api/purchases/:id

**Description:** Delete purchase. **Admin only**.

**Authentication:** Required (admin role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Purchase ID |

**Response:**

```json
{
  "success": true,
  "message": "Purchase deleted successfully",
  "data": {
    "purchase": {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "purchase_id": "PUR-001",
      "vendor_name": "Dell Inc",
      "status": "completed"
    }
  }
}
```

**Examples:**

```bash
# Delete purchase
curl -X DELETE "http://localhost:5000/api/purchases/550e8400-e29b-41d4-a716-446655440200" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Status Codes:**
- 200: Success
- 404: Purchase not found
- 403: Forbidden (non-admin)
- 401: Unauthorized

**Note:** Deleting a purchase does not delete associated assets; assets remain in the system.

---

## Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Invalid vendor email",
      "param": "vendor_email",
      "location": "body"
    }
  ]
}
```

**Duplicate Purchase ID (409):**

```json
{
  "success": false,
  "error": "Purchase already exists",
  "message": "A purchase with this ID already exists."
}
```

**Not Found (404):**

```json
{
  "success": false,
  "error": "Purchase not found",
  "message": "The requested purchase does not exist."
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

---

## Purchase Status Values

| Status | Description |
|--------|-------------|
| `pending` | Purchase ordered, awaiting delivery |
| `completed` | Purchase received and items logged |
| `cancelled` | Purchase was cancelled |

---

## Testing

See [PURCHASES_TESTING.md](PURCHASES_TESTING.md) for complete testing guide with examples.

Quick test:

```bash
# Get all purchases
curl -X GET http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $TOKEN" | jq

# Create purchase (admin)
curl -X POST http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "PUR-TEST-'$(date +%s)'",
    "vendor_name": "Test Vendor",
    "purchase_date": "2026-05-29",
    "total_amount": 1000.00
  }' | jq
```

---

## Related Files

- [routes/purchases.js](routes/purchases.js) - Implementation
- [PURCHASES_TESTING.md](PURCHASES_TESTING.md) - Testing guide
- [ASSETS_API.md](ASSETS_API.md) - Asset management
- [REPORTS_API.md](REPORTS_API.md) - Analytics and reports
