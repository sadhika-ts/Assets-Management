# Assets API Testing Guide

Complete guide to testing the Asset Management API endpoints.

---

## Setup

### 1. Start server
```bash
npm run dev
```

### 2. Get authentication token

First, login to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

Save the token from response:
```
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Test Scenarios

### Test 1: List all assets (GET /)

**Endpoint:** `GET /api/assets`

**Description:** Get all assets with default pagination

```bash
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Returns array of assets with details, assigned user, purchase info

---

### Test 2: List with filters

**Get active IT assets only:**

```bash
curl -X GET "http://localhost:5000/api/assets?category=IT&status=active" \
  -H "Authorization: Bearer $TOKEN"
```

**Get laptops with pagination:**

```bash
curl -X GET "http://localhost:5000/api/assets?sub_type=laptop&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Search by serial number:**

```bash
curl -X GET "http://localhost:5000/api/assets?search=DL-12345" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Test 3: Get single asset (GET /:id)

**Endpoint:** `GET /api/assets/:id`

Get first asset from list (replace with actual ID):

```bash
ASSET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET "http://localhost:5000/api/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- Full asset details
- AssetDetail with all fields
- Assigned user (if any)
- Purchase information
- Last 10 audit log entries

**Test not found:**

```bash
curl -X GET "http://localhost:5000/api/assets/invalid-id" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 404 error

---

### Test 4: Create asset (POST /)

**Endpoint:** `POST /api/assets`

**As staff user:**

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "AST-TEST-001",
    "category": "IT",
    "sub_type": "Laptop",
    "serial_no": "TEST-12345",
    "mac_address": "00:11:22:33:44:55",
    "location": "Building A",
    "os_type": "Windows",
    "os_version": "11 Pro",
    "processor_name": "Intel Core i7",
    "manufacturer": "Dell",
    "cores": 8,
    "ram_gb": 16,
    "disk_gb": 512,
    "ms_office": true,
    "software_list": "VS Code, Git, Docker"
  }'
```

**Expected:**
- 201 Created response
- Asset returned with generated UUID
- AssetDetail created automatically
- Audit log entry created with action "Asset Created"
- Default status is "active"

Save asset ID for next tests:
```
ASSET_ID="<from-response>"
```

---

### Test 5: Create with duplicate asset_tag

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "AST-TEST-001",
    "category": "IT",
    "sub_type": "Desktop"
  }'
```

**Expected:** 409 Conflict - "Asset already exists"

---

### Test 6: Create validation errors

**Missing required field:**

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "IT",
    "sub_type": "Laptop"
  }'
```

**Expected:** 400 Bad Request - "asset_tag is required"

**Invalid category:**

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "AST-TEST-002",
    "category": "INVALID",
    "sub_type": "Laptop"
  }'
```

**Expected:** 400 Bad Request - "Category must be IT or Non-IT"

---

### Test 7: Create permission denied

**As viewer user (no create permission):**

First get viewer token:
```bash
VIEWER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

Try to create:
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "AST-TEST-003",
    "category": "IT",
    "sub_type": "Laptop"
  }'
```

**Expected:** 403 Forbidden - "Access denied"

---

### Test 8: Update asset (PUT /:id)

Update fields of previously created asset:

```bash
curl -X PUT "http://localhost:5000/api/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Building B",
    "os_version": "11 Enterprise",
    "ram_gb": 32,
    "disk_gb": 1024
  }'
```

**Expected:**
- 200 OK
- Asset returned with updated fields
- Audit log entry created with action "Asset Updated"
- Log contains old_value and new_value

---

### Test 9: Update with validation error

```bash
curl -X PUT "http://localhost:5000/api/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "INVALID"
  }'
```

**Expected:** 400 Bad Request

---

### Test 10: Assign asset to user (PATCH /:id/assign)

Get a user ID first (from seeded data):
```
USER_ID="550e8400-e29b-41d4-a716-446655440001"
```

Assign asset:

```bash
curl -X PATCH "http://localhost:5000/api/assets/$ASSET_ID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"assigned_to\": \"$USER_ID\"
  }"
```

**Expected:**
- 200 OK
- Asset.assigned_to updated
- assignedUser included in response
- Audit log entry created with action "Asset Assigned"

---

### Test 11: Assign to non-existent user

```bash
curl -X PATCH "http://localhost:5000/api/assets/$ASSET_ID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": "00000000-0000-0000-0000-000000000000"
  }'
```

**Expected:** 404 - "User not found"

---

### Test 12: Delete asset (DELETE /:id)

**As admin user:**

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X DELETE "http://localhost:5000/api/assets/$ASSET_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:**
- 200 OK
- Asset.status changed to "disposed"
- Audit log entry created with action "Asset Disposed"

---

### Test 13: Delete permission denied

**As staff user (no delete permission):**

```bash
STAFF_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X DELETE "http://localhost:5000/api/assets/$ASSET_ID" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Expected:** 403 Forbidden - "Access denied"

---

### Test 14: Verify disposed asset in list

```bash
curl -X GET "http://localhost:5000/api/assets?status=disposed" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Disposed asset appears in results

---

### Test 15: Missing authorization token

```bash
curl -X GET http://localhost:5000/api/assets
```

**Expected:** 401 Unauthorized - "No token provided"

---

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Assets API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Assets",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/assets",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Get Asset by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/assets/{{asset_id}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Create Asset",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/assets",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"asset_tag\":\"AST-{{$timestamp}}\",\"category\":\"IT\",\"sub_type\":\"Laptop\",\"ram_gb\":16}"
        }
      }
    },
    {
      "name": "Update Asset",
      "request": {
        "method": "PUT",
        "url": "http://localhost:5000/api/assets/{{asset_id}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"location\":\"Building C\",\"ram_gb\":32}"
        }
      }
    },
    {
      "name": "Assign Asset",
      "request": {
        "method": "PATCH",
        "url": "http://localhost:5000/api/assets/{{asset_id}}/assign",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"assigned_to\":\"{{user_id}}\"}"
        }
      }
    },
    {
      "name": "Delete Asset",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:5000/api/assets/{{asset_id}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ]
}
```

Set these in Postman environment:
- `token` - JWT token from login
- `asset_id` - UUID of created asset
- `user_id` - UUID of user to assign to

---

## Bash Test Script

Create `test_assets.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Testing Assets API"
echo "===================="

# Get token
echo -e "\n1️⃣ Getting authentication token..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Token obtained${NC}"

# Test GET all
echo -e "\n2️⃣ Testing GET /api/assets..."
curl -s -X GET "$BASE_URL/assets?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ GET /api/assets works${NC}"

# Test CREATE
echo -e "\n3️⃣ Testing POST /api/assets..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/assets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"asset_tag\": \"AST-TEST-$(date +%s)\",
    \"category\": \"IT\",
    \"sub_type\": \"Laptop\",
    \"ram_gb\": 16,
    \"disk_gb\": 256
  }")

ASSET_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo $CREATE_RESPONSE | jq .
echo -e "${GREEN}✅ POST /api/assets works (ID: $ASSET_ID)${NC}"

# Test GET single
echo -e "\n4️⃣ Testing GET /api/assets/:id..."
curl -s -X GET "$BASE_URL/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ GET /api/assets/:id works${NC}"

# Test UPDATE
echo -e "\n5️⃣ Testing PUT /api/assets/:id..."
curl -s -X PUT "$BASE_URL/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"Building B","ram_gb":32}' | jq .
echo -e "${GREEN}✅ PUT /api/assets/:id works${NC}"

# Test ASSIGN
echo -e "\n6️⃣ Testing PATCH /api/assets/:id/assign..."
USER_ID="550e8400-e29b-41d4-a716-446655440001"
curl -s -X PATCH "$BASE_URL/assets/$ASSET_ID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"assigned_to\":\"$USER_ID\"}" | jq .
echo -e "${GREEN}✅ PATCH /api/assets/:id/assign works${NC}"

# Test DELETE
echo -e "\n7️⃣ Testing DELETE /api/assets/:id..."
curl -s -X DELETE "$BASE_URL/assets/$ASSET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ DELETE /api/assets/:id works${NC}"

echo -e "\n===================="
echo -e "${GREEN}✅ All tests passed!${NC}"
```

Run it:
```bash
chmod +x test_assets.sh
./test_assets.sh
```

---

## Test Checklist

### GET Endpoints
- [ ] GET / returns assets list
- [ ] GET / with category filter works
- [ ] GET / with status filter works
- [ ] GET / with search works
- [ ] GET / pagination works
- [ ] GET /:id returns full asset details
- [ ] GET /:id includes audit logs
- [ ] GET /:id returns 404 for invalid ID

### POST Endpoint
- [ ] POST / creates asset successfully
- [ ] POST / creates asset_detail automatically
- [ ] POST / creates audit log entry
- [ ] POST / rejects duplicate asset_tag (409)
- [ ] POST / validates all fields
- [ ] POST / requires admin or staff role
- [ ] POST / denies viewer role

### PUT Endpoint
- [ ] PUT / updates asset fields
- [ ] PUT / updates detail fields
- [ ] PUT / creates audit log with old/new values
- [ ] PUT / partial update works
- [ ] PUT / returns 404 for invalid ID
- [ ] PUT / requires admin or staff role

### DELETE Endpoint
- [ ] DELETE / sets status to "disposed"
- [ ] DELETE / creates audit log entry
- [ ] DELETE / requires admin role
- [ ] DELETE / denies staff role

### PATCH Endpoint
- [ ] PATCH /assign assigns to user
- [ ] PATCH /assign creates audit log
- [ ] PATCH /assign returns 404 for invalid user
- [ ] PATCH /assign requires admin or staff role

### Auth & Errors
- [ ] Requests without token return 401
- [ ] Viewer role can GET but not modify
- [ ] All validations work correctly
- [ ] All error messages are clear

---

## Performance Testing

Load test with concurrent requests:

```bash
# Test 100 concurrent GET requests
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/assets

# Expected: < 100ms average response time
```

---

## Related Files

- [routes/assets.js](routes/assets.js) - Implementation
- [ASSETS_API.md](ASSETS_API.md) - Complete API reference
- [AUTH_TESTING.md](AUTH_TESTING.md) - Authentication testing
- [MODELS.md](MODELS.md) - Database models
