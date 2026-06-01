# Contracts API Documentation

Complete documentation for the Asset Management System Contracts API endpoints.

---

## Overview

The Contracts API manages vendor contracts and service agreements:
- Track contracts with active/expiration dates
- Auto-update status based on dates (active → expired)
- Filter by contract status (active, expired, upcoming)
- Get contracts expiring within specified timeframe

All endpoints require authentication via JWT token. Create, update, and delete operations require admin role.

---

## Authentication

All endpoints require the `Authorization` header:

```bash
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $TOKEN"
```

---

## Endpoints

### 1. GET /api/contracts

**Description:** List all contracts with automatic status updates and filtering.

**Authentication:** Required (any role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Optional: Filter by status - `active`, `expired`, `upcoming` |
| `page` | Integer | Optional: Page number (default: 1) |
| `limit` | Integer | Optional: Records per page (1-100, default: 10) |

**Auto-Update Logic:**
- If contract status is 'active' and active_till < today → automatically updated to 'expired'
- Status update occurs on every GET request

**Response:**

```json
{
  "success": true,
  "message": "Contracts retrieved successfully",
  "data": {
    "contracts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "contract_id": "CNT-001",
        "name": "Microsoft Software License 2026",
        "vendor_name": "Microsoft",
        "vendor_contact": "licensing@microsoft.com",
        "active_from": "2026-01-01",
        "active_till": "2026-12-31",
        "status": "active",
        "notes": "Annual renewal",
        "created_at": "2026-01-01T08:00:00Z",
        "updated_at": "2026-01-01T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

**Examples:**

```bash
# All contracts (default pagination)
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $TOKEN"

# Active contracts only
curl -X GET "http://localhost:5000/api/contracts?status=active" \
  -H "Authorization: Bearer $TOKEN"

# Expired contracts
curl -X GET "http://localhost:5000/api/contracts?status=expired" \
  -H "Authorization: Bearer $TOKEN"

# Upcoming contracts (not yet active)
curl -X GET "http://localhost:5000/api/contracts?status=upcoming" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/contracts?page=2&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. GET /api/contracts/:id

**Description:** Get single contract with automatic status update.

**Authentication:** Required (any role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contract ID |

**Response:**

```json
{
  "success": true,
  "message": "Contract retrieved successfully",
  "data": {
    "contract": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "contract_id": "CNT-001",
      "name": "Microsoft Software License 2026",
      "vendor_name": "Microsoft",
      "vendor_contact": "licensing@microsoft.com",
      "active_from": "2026-01-01",
      "active_till": "2026-12-31",
      "status": "active",
      "notes": "Annual renewal",
      "created_at": "2026-01-01T08:00:00Z",
      "updated_at": "2026-01-01T08:00:00Z"
    }
  }
}
```

**Examples:**

```bash
# Get specific contract
curl -X GET "http://localhost:5000/api/contracts/550e8400-e29b-41d4-a716-446655440300" \
  -H "Authorization: Bearer $TOKEN"
```

**Status Codes:**
- 200: Success
- 404: Contract not found
- 401: Unauthorized

---

### 3. POST /api/contracts

**Description:** Create new contract. **Admin only**.

Auto-determines status based on active_from date:
- If active_from > today → status = 'upcoming'
- If active_from ≤ today → status = 'active'

**Authentication:** Required (admin role)

**Request Body:**

```json
{
  "contract_id": "CNT-002",
  "name": "Dell Hardware Support 2026-2027",
  "vendor_name": "Dell Inc",
  "vendor_contact": "support@dell.com",
  "active_from": "2026-06-01",
  "active_till": "2027-05-31",
  "status": "upcoming",
  "notes": "Extended warranty and support"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `contract_id` | Required, unique, max 100 chars |
| `name` | Required, max 255 chars |
| `vendor_name` | Required, max 255 chars |
| `vendor_contact` | Optional, max 100 chars |
| `active_from` | Required, ISO8601 date format, must be before active_till |
| `active_till` | Required, ISO8601 date format, must be after active_from |
| `status` | Optional, one of: `active`, `expired`, `upcoming` (auto-determined if omitted) |
| `notes` | Optional, max 1000 chars |

**Response:**

```json
{
  "success": true,
  "message": "Contract created successfully",
  "data": {
    "contract": {
      "id": "550e8400-e29b-41d4-a716-446655440301",
      "contract_id": "CNT-002",
      "name": "Dell Hardware Support 2026-2027",
      "vendor_name": "Dell Inc",
      "vendor_contact": "support@dell.com",
      "active_from": "2026-06-01",
      "active_till": "2027-05-31",
      "status": "upcoming",
      "notes": "Extended warranty and support",
      "created_at": "2026-05-29T14:22:00Z",
      "updated_at": "2026-05-29T14:22:00Z"
    }
  }
}
```

**Examples:**

```bash
# Create contract with explicit status
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "CNT-003",
    "name": "Vendor Support Service",
    "vendor_name": "Acme Corp",
    "vendor_contact": "support@acme.com",
    "active_from": "2026-01-15",
    "active_till": "2027-01-14",
    "status": "active",
    "notes": "SLA: 4-hour response time"
  }'

# Create contract - let system auto-determine status
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "CNT-004",
    "name": "Future Service Agreement",
    "vendor_name": "Future Tech",
    "active_from": "2026-12-01",
    "active_till": "2027-11-30"
  }'
```

**Status Codes:**
- 201: Created
- 400: Validation error (e.g., active_from >= active_till)
- 409: Duplicate contract_id
- 403: Forbidden (non-admin)
- 401: Unauthorized

---

### 4. PUT /api/contracts/:id

**Description:** Update contract details. **Admin only**.

**Authentication:** Required (admin role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contract ID |

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Contract Name",
  "active_till": "2027-06-30",
  "status": "active",
  "notes": "Updated notes"
}
```

**Validation:**
- If both active_from and active_till provided: active_from < active_till
- If only active_from provided: active_from < existing active_till
- If only active_till provided: existing active_from < active_till

**Response:**

```json
{
  "success": true,
  "message": "Contract updated successfully",
  "data": {
    "contract": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "contract_id": "CNT-001",
      "name": "Updated Contract Name",
      "vendor_name": "Microsoft",
      "active_from": "2026-01-01",
      "active_till": "2027-06-30",
      "status": "active",
      "notes": "Updated notes",
      "updated_at": "2026-05-29T15:30:00Z"
    }
  }
}
```

**Examples:**

```bash
# Update expiration date
curl -X PUT "http://localhost:5000/api/contracts/550e8400-e29b-41d4-a716-446655440300" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"active_till": "2027-12-31"}'

# Update status manually
curl -X PUT "http://localhost:5000/api/contracts/550e8400-e29b-41d4-a716-446655440300" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "expired"}'

# Update multiple fields
curl -X PUT "http://localhost:5000/api/contracts/550e8400-e29b-41d4-a716-446655440300" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "active_from": "2026-02-01",
    "active_till": "2027-01-31",
    "notes": "Contract renewed"
  }'
```

**Status Codes:**
- 200: Success
- 400: Validation error (invalid date range)
- 404: Contract not found
- 403: Forbidden (non-admin)
- 401: Unauthorized

---

### 5. DELETE /api/contracts/:id

**Description:** Delete contract. **Admin only**.

**Authentication:** Required (admin role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contract ID |

**Response:**

```json
{
  "success": true,
  "message": "Contract deleted successfully",
  "data": {
    "contract": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "contract_id": "CNT-001",
      "name": "Microsoft Software License 2026",
      "vendor_name": "Microsoft",
      "status": "active"
    }
  }
}
```

**Examples:**

```bash
# Delete contract
curl -X DELETE "http://localhost:5000/api/contracts/550e8400-e29b-41d4-a716-446655440300" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Status Codes:**
- 200: Success
- 404: Contract not found
- 403: Forbidden (non-admin)
- 401: Unauthorized

---

### 6. GET /api/contracts/expiring/soon

**Description:** Get contracts expiring within the next 30 days.

**Authentication:** Required (any role)

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "message": "Expiring contracts retrieved successfully",
  "data": {
    "expiringContracts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440302",
        "contract_id": "CNT-005",
        "name": "Maintenance Agreement",
        "vendor_name": "Vendor Name",
        "active_till": "2026-06-15",
        "status": "active"
      }
    ],
    "count": 1
  }
}
```

**Examples:**

```bash
# Get contracts expiring in next 30 days
curl -X GET http://localhost:5000/api/contracts/expiring/soon \
  -H "Authorization: Bearer $TOKEN"
```

**Note:** This endpoint must be called BEFORE the general GET / to avoid being captured as a parameter to the list endpoint.

---

## Contract Status Values

| Status | Description |
|--------|-------------|
| `upcoming` | Active from date is in the future |
| `active` | Currently in effect (active_from ≤ today ≤ active_till) |
| `expired` | Past the active_till date |

**Auto-Update:** The system automatically updates contracts with status 'active' to 'expired' when active_till < today on each GET request.

---

## Error Responses

**Validation Error - Date Range (400):**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "active_from must be before active_till"
}
```

**Duplicate Contract ID (409):**

```json
{
  "success": false,
  "error": "Contract already exists",
  "message": "A contract with this ID already exists."
}
```

**Not Found (404):**

```json
{
  "success": false,
  "error": "Contract not found",
  "message": "The requested contract does not exist."
}
```

**Invalid Status Filter (400):**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Invalid status",
      "param": "status",
      "location": "query"
    }
  ]
}
```

---

## Date Behavior

All dates are treated as midnight UTC (00:00:00):
- Date comparison strips time component
- Contract expires at end of active_till date
- Status updates occur on date boundary (not time-dependent)

Example timeline:
```
2026-01-01: status = 'upcoming' (active_from is today)
2026-01-02: status = 'active' (within contract period)
2027-01-14: status = 'active' (last day of contract)
2027-01-15: status = 'expired' (after active_till)
```

---

## Testing

See [CONTRACTS_TESTING.md](CONTRACTS_TESTING.md) for complete testing guide.

Quick test:

```bash
# Get all active contracts
curl -X GET "http://localhost:5000/api/contracts?status=active" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get contracts expiring soon
curl -X GET http://localhost:5000/api/contracts/expiring/soon \
  -H "Authorization: Bearer $TOKEN" | jq

# Create contract
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "CNT-NEW",
    "name": "New Contract",
    "vendor_name": "Vendor",
    "active_from": "2026-06-01",
    "active_till": "2027-05-31"
  }' | jq
```

---

## Related Files

- [routes/contracts.js](routes/contracts.js) - Implementation
- [CONTRACTS_TESTING.md](CONTRACTS_TESTING.md) - Testing guide
- [PURCHASES_API.md](PURCHASES_API.md) - Purchase management
- [REPORTS_API.md](REPORTS_API.md) - Analytics and reports
