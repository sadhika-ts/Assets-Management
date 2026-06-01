# API Quick Reference Card

Fast lookup for common operations.

---

## Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"pass123"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | jq -r '.data.token')

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Assets

```bash
# List all
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN"

# Filter by category & status
curl -X GET "http://localhost:5000/api/assets?category=IT&status=active" \
  -H "Authorization: Bearer $TOKEN"

# Search
curl -X GET "http://localhost:5000/api/assets?search=LAP-001" \
  -H "Authorization: Bearer $TOKEN"

# Get by ID
curl -X GET http://localhost:5000/api/assets/[ID] \
  -H "Authorization: Bearer $TOKEN"

# Create
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag":"AST-001",
    "category":"IT",
    "sub_type":"Laptop",
    "ram_gb":16
  }'

# Update
curl -X PUT http://localhost:5000/api/assets/[ID] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"Building B"}'

# Assign to user
curl -X PATCH http://localhost:5000/api/assets/[ID]/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigned_to":"[USER_ID]"}'

# Delete (soft)
curl -X DELETE http://localhost:5000/api/assets/[ID] \
  -H "Authorization: Bearer $TOKEN"
```

---

## Purchases

```bash
# List all
curl -X GET http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $TOKEN"

# Filter by vendor
curl -X GET "http://localhost:5000/api/purchases?vendor=Dell" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/purchases?status=completed" \
  -H "Authorization: Bearer $TOKEN"

# Date range
curl -X GET "http://localhost:5000/api/purchases?from=2026-01-01&to=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Get by ID
curl -X GET http://localhost:5000/api/purchases/[ID] \
  -H "Authorization: Bearer $TOKEN"

# Create (admin)
curl -X POST http://localhost:5000/api/purchases \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id":"PUR-001",
    "vendor_name":"Dell",
    "purchase_date":"2026-05-29",
    "total_amount":5000
  }'

# Update
curl -X PUT http://localhost:5000/api/purchases/[ID] \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete
curl -X DELETE http://localhost:5000/api/purchases/[ID] \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Contracts

```bash
# List all
curl -X GET http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/contracts?status=active" \
  -H "Authorization: Bearer $TOKEN"

# Expiring soon
curl -X GET http://localhost:5000/api/contracts/expiring/soon \
  -H "Authorization: Bearer $TOKEN"

# Get by ID
curl -X GET http://localhost:5000/api/contracts/[ID] \
  -H "Authorization: Bearer $TOKEN"

# Create (admin)
curl -X POST http://localhost:5000/api/contracts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id":"CNT-001",
    "name":"Service Agreement",
    "vendor_name":"Vendor",
    "active_from":"2026-01-01",
    "active_till":"2027-01-01"
  }'

# Update
curl -X PUT http://localhost:5000/api/contracts/[ID] \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"active_till":"2027-12-31"}'

# Delete
curl -X DELETE http://localhost:5000/api/contracts/[ID] \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Reports

```bash
# Inventory
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN"

# Assignment by user
curl -X GET http://localhost:5000/api/reports/assigned \
  -H "Authorization: Bearer $TOKEN"

# Contract status
curl -X GET "http://localhost:5000/api/reports/contract-status?days=30" \
  -H "Authorization: Bearer $TOKEN"

# Purchases
curl -X GET "http://localhost:5000/api/reports/purchases?from=2026-01-01&to=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Depreciation
curl -X GET "http://localhost:5000/api/reports/depreciation?category=IT" \
  -H "Authorization: Bearer $TOKEN"

# Audit logs (admin)
curl -X GET "http://localhost:5000/api/reports/audit-logs?limit=20&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Common Query Parameters

| Endpoint | Filters | Example |
|----------|---------|---------|
| Assets | `category`, `status`, `search`, `page`, `limit` | `?category=IT&status=active&page=1&limit=20` |
| Purchases | `vendor`, `status`, `from`, `to`, `page`, `limit` | `?vendor=Dell&status=completed&from=2026-01-01` |
| Contracts | `status`, `page`, `limit` | `?status=active&limit=10` |
| Reports | Varies by endpoint | See each report docs |

---

## Status Values

**Assets:** `active`, `inactive`, `disposed`  
**Purchases:** `pending`, `completed`, `cancelled`  
**Contracts:** `active`, `expired`, `upcoming`  

---

## User Roles

| Role | Can | Cannot |
|------|-----|--------|
| **Admin** | Everything | Nothing |
| **Staff** | Create/update assets, read all | Delete assets, delete purchases |
| **Viewer** | Read all resources | Create/update/delete anything |

---

## Common Errors

| Error | Solution |
|-------|----------|
| "No token provided" | Add `Authorization: Bearer $TOKEN` header |
| "Invalid token" | Token expired - login again |
| "Access denied" | User role doesn't have permission |
| "Validation failed" | Check required fields and data types |
| "Asset already exists" | asset_tag must be unique |
| "active_from must be before active_till" | Fix date order |

---

## Pagination

All list endpoints support:

```bash
?page=1&limit=10
```

Response includes:
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Response Formats

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Details",
  "details": [ /* validation */ ]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing/invalid token |
| 403 | Access denied |
| 404 | Not found |
| 409 | Duplicate |
| 500 | Server error |

---

## Tips

- Save token to variable: `TOKEN=$(... | jq -r '.data.token')`
- Pretty-print JSON: Pipe to `| jq`
- Test with Postman: Import provided collections
- Use sample data: Included in seed file
- Check logs: Run with `npm run dev`

---

## Full Documentation

- [API_OVERVIEW.md](API_OVERVIEW.md) - Complete system guide
- [ASSETS_API.md](ASSETS_API.md) - Asset endpoints
- [PURCHASES_API.md](PURCHASES_API.md) - Purchase endpoints
- [CONTRACTS_API.md](CONTRACTS_API.md) - Contract endpoints
- [REPORTS_API.md](REPORTS_API.md) - Report endpoints

---

**Last Updated:** 2026-05-29
