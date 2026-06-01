# Reports & Dashboard API Testing Guide

Complete testing guide for the new reports and dashboard endpoints.

---

## Setup

### 1. Start server
```bash
npm run dev
```

### 2. Get authentication token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

---

## Test Scenarios

### Test 1: Dashboard - System Overview

**Endpoint:** `GET /api/reports/dashboard`

**Description:** Returns quick overview with asset counts, status breakdown, expiring contracts, and recent assets.

```bash
curl -X GET http://localhost:5000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "total_assets": 5,
    "it_assets": 3,
    "non_it_assets": 2,
    "active": 4,
    "inactive": 1,
    "disposed": 0,
    "expiring_contracts": [
      {
        "id": "...",
        "contract_id": "CNT-001",
        "name": "Service Agreement",
        "vendor_name": "Vendor",
        "active_till": "2026-06-15",
        "status": "active"
      }
    ],
    "recent_assets": [
      {
        "id": "...",
        "asset_tag": "LAP-001",
        "category": "IT",
        "sub_type": "Laptop",
        "status": "active",
        "created_at": "2026-05-29T...",
        "detail": {
          "os_type": "Windows",
          "processor_name": "Intel Core i7"
        }
      }
    ]
  }
}
```

**Verify:**
- ✅ total_assets matches actual count
- ✅ it_assets + non_it_assets = total_assets
- ✅ active + inactive + disposed = total_assets
- ✅ expiring_contracts shows contracts expiring in 30 days
- ✅ recent_assets shows last 5 created assets
- ✅ asset details included in response

---

### Test 2: Assets by Sub-Type

**Endpoint:** `GET /api/reports/by-category`

**Description:** Get asset count grouped by sub_type.

```bash
curl -X GET http://localhost:5000/api/reports/by-category \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Assets by category retrieved successfully",
  "data": {
    "total": 5,
    "breakdown": [
      {
        "sub_type": "Laptop",
        "count": "3"
      },
      {
        "sub_type": "Desktop",
        "count": "2"
      }
    ]
  }
}
```

**Verify:**
- ✅ breakdown shows all sub_types
- ✅ count is accurate for each sub_type
- ✅ total matches sum of counts
- ✅ breakdown ordered by count descending

---

### Test 3: Assets by Status

**Endpoint:** `GET /api/reports/by-status`

**Description:** Get asset count grouped by status.

```bash
curl -X GET http://localhost:5000/api/reports/by-status \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Assets by status retrieved successfully",
  "data": {
    "total": 5,
    "breakdown": [
      {
        "status": "active",
        "count": "4"
      },
      {
        "status": "inactive",
        "count": "1"
      }
    ]
  }
}
```

**Verify:**
- ✅ breakdown includes all status values present
- ✅ count accurate for each status
- ✅ total matches sum of counts
- ✅ breakdown ordered by count descending

---

### Test 4: OS Activation Status

**Endpoint:** `GET /api/reports/os-activation`

**Description:** Count of assets with os_activated true vs false.

```bash
curl -X GET http://localhost:5000/api/reports/os-activation \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OS activation status retrieved successfully",
  "data": {
    "total": 5,
    "activated": 3,
    "not_activated": 2
  }
}
```

**Verify:**
- ✅ activated + not_activated = total
- ✅ counts match actual asset detail records
- ✅ works even if some assets have null os_activated

---

### Test 5: MS Office Installation Status

**Endpoint:** `GET /api/reports/ms-office`

**Description:** Count of assets with ms_office true vs false.

```bash
curl -X GET http://localhost:5000/api/reports/ms-office \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "MS Office status retrieved successfully",
  "data": {
    "total": 5,
    "installed": 4,
    "not_installed": 1
  }
}
```

**Verify:**
- ✅ installed + not_installed = total
- ✅ counts match actual asset detail records
- ✅ handles null ms_office values

---

### Test 6: Audit Log - Recent 50 Entries

**Endpoint:** `GET /api/reports/audit-log`

**Description:** Recent 50 audit log entries with user name and asset tag.

```bash
curl -X GET http://localhost:5000/api/reports/audit-log \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "total": 2,
    "logs": [
      {
        "id": "...",
        "asset_id": "550e8400-...",
        "action": "Asset Created",
        "old_value": null,
        "new_value": "{\"asset_tag\":\"LAP-001\",\"category\":\"IT\"}",
        "changed_at": "2026-05-29T10:30:00Z",
        "user": {
          "id": "...",
          "name": "Admin User",
          "email": "admin@company.com"
        },
        "asset": {
          "id": "...",
          "asset_tag": "LAP-001",
          "category": "IT",
          "sub_type": "Laptop"
        }
      }
    ]
  }
}
```

**Verify:**
- ✅ returns up to 50 most recent entries
- ✅ sorted by changed_at descending
- ✅ includes user information (name, email)
- ✅ includes asset information (asset_tag, category)
- ✅ old_value and new_value present
- ✅ total count accurate

---

### Test 7: Export Assets as JSON (for CSV)

**Endpoint:** `GET /api/reports/export`

**Description:** Export all assets as JSON for frontend CSV conversion.

```bash
curl -X GET http://localhost:5000/api/reports/export \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Assets exported successfully",
  "data": [
    {
      "asset_tag": "LAP-001",
      "category": "IT",
      "sub_type": "Laptop",
      "status": "active",
      "serial_no": "DELL-12345",
      "mac_address": "00:11:22:33:44:55",
      "location": "Building A",
      "assigned_to": "John Doe",
      "os_type": "Windows",
      "os_version": "11 Pro",
      "processor_name": "Intel Core i7",
      "manufacturer": "Dell",
      "cores": "8",
      "ram_gb": "16",
      "disk_gb": "512",
      "ms_office": "Yes",
      "software_list": "VS Code, Git, Docker",
      "vendor_name": "Dell Inc",
      "purchase_date": "2026-01-15",
      "total_amount": "1500.00",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**Verify:**
- ✅ includes all assets
- ✅ sorted by created_at descending
- ✅ includes asset detail information
- ✅ includes assigned user name
- ✅ includes purchase information
- ✅ ms_office formatted as "Yes"/"No"
- ✅ all fields present (even if empty)

**CSV Conversion Example (Frontend):**
```javascript
function exportToCSV(data) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => JSON.stringify(row[h])).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'assets.csv';
  a.click();
}
```

---

## Error Testing

### Missing Authorization Token

```bash
curl -X GET http://localhost:5000/api/reports/dashboard
```

**Expected:** 401 Unauthorized - "No token provided"

---

### Invalid Token

```bash
curl -X GET http://localhost:5000/api/reports/dashboard \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** 401 Unauthorized - "Invalid token"

---

## Response Codes Summary

| Endpoint | Success | Error |
|----------|---------|-------|
| /dashboard | 200 | 500 |
| /by-category | 200 | 500 |
| /by-status | 200 | 500 |
| /os-activation | 200 | 500 |
| /ms-office | 200 | 500 |
| /audit-log | 200 | 500 |
| /export | 200 | 500 |

All endpoints require valid JWT token (401 if missing/invalid).

---

## Test Checklist

### Dashboard
- [ ] Returns all required fields
- [ ] Asset counts are accurate
- [ ] Status breakdown sums to total
- [ ] Expiring contracts within 30 days
- [ ] Recent assets shows last 5
- [ ] Asset detail included

### By Category
- [ ] Shows all sub_types present
- [ ] Count matches asset count
- [ ] Total equals sum of counts
- [ ] Ordered by count descending

### By Status
- [ ] Shows all status values
- [ ] Count matches asset count
- [ ] Total equals sum of counts
- [ ] Ordered by count descending

### OS Activation
- [ ] activated + not_activated = total
- [ ] Counts accurate
- [ ] Handles null values

### MS Office
- [ ] installed + not_installed = total
- [ ] Counts accurate
- [ ] Handles null values

### Audit Log
- [ ] Shows recent 50 entries
- [ ] Sorted by changed_at DESC
- [ ] User info included
- [ ] Asset info included
- [ ] old_value and new_value present

### Export
- [ ] All assets included
- [ ] Sorted by created_at DESC
- [ ] All fields present
- [ ] Detail info included
- [ ] User name included
- [ ] Purchase info included
- [ ] ms_office formatted correctly

### Authentication
- [ ] All endpoints require token
- [ ] 401 without token
- [ ] 401 with invalid token
- [ ] 500 on server error

---

## Bash Test Script

Create `test_reports_dashboard.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Reports & Dashboard API"
echo "===================================="

# Get token
echo -e "\n1️⃣ Getting authentication token..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Token obtained${NC}"

# Test Dashboard
echo -e "\n2️⃣ Testing GET /api/reports/dashboard..."
DASHBOARD=$(curl -s -X GET "$BASE_URL/reports/dashboard" \
  -H "Authorization: Bearer $TOKEN")
echo $DASHBOARD | jq .
if echo $DASHBOARD | jq -e '.success' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Dashboard works${NC}"
else
  echo -e "${RED}❌ Dashboard failed${NC}"
fi

# Test By Category
echo -e "\n3️⃣ Testing GET /api/reports/by-category..."
curl -s -X GET "$BASE_URL/reports/by-category" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ By category works${NC}"

# Test By Status
echo -e "\n4️⃣ Testing GET /api/reports/by-status..."
curl -s -X GET "$BASE_URL/reports/by-status" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ By status works${NC}"

# Test OS Activation
echo -e "\n5️⃣ Testing GET /api/reports/os-activation..."
curl -s -X GET "$BASE_URL/reports/os-activation" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ OS activation works${NC}"

# Test MS Office
echo -e "\n6️⃣ Testing GET /api/reports/ms-office..."
curl -s -X GET "$BASE_URL/reports/ms-office" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ MS Office works${NC}"

# Test Audit Log
echo -e "\n7️⃣ Testing GET /api/reports/audit-log..."
curl -s -X GET "$BASE_URL/reports/audit-log" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Audit log works${NC}"

# Test Export
echo -e "\n8️⃣ Testing GET /api/reports/export..."
EXPORT=$(curl -s -X GET "$BASE_URL/reports/export" \
  -H "Authorization: Bearer $TOKEN")
echo $EXPORT | jq '.data | length' && \
  echo -e "${GREEN}✅ Export works${NC}"

# Test without token
echo -e "\n9️⃣ Testing authentication (should fail)..."
UNAUTH=$(curl -s -X GET "$BASE_URL/reports/dashboard")
if echo $UNAUTH | jq -e '.success == false' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Auth check works${NC}"
fi

echo -e "\n===================================="
echo -e "${GREEN}✅ All tests completed!${NC}"
```

Run it:
```bash
chmod +x test_reports_dashboard.sh
./test_reports_dashboard.sh
```

---

## Postman Collection

Import into Postman:

```json
{
  "info": {
    "name": "Reports & Dashboard API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Dashboard",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/dashboard",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "By Category",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/by-category",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "By Status",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/by-status",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "OS Activation",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/os-activation",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "MS Office",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/ms-office",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Audit Log",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/audit-log",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Export",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/reports/export",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    }
  ]
}
```

Set in Postman environment:
- `token` - JWT token from login

---

## Related Files

- [routes/reports.js](routes/reports.js) - Implementation
- [ASSETS_API.md](ASSETS_API.md) - Asset endpoints
- [API_OVERVIEW.md](API_OVERVIEW.md) - System overview
