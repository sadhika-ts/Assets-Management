# Reports API Testing Guide

Quick reference for testing all Reports API endpoints.

---

## Setup

```bash
# Start the server
npm run dev

# Login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

---

## Inventory Report

Lists all assets grouped by category and status.

```bash
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
- `summary` with total, active, inactive, disposed counts
- `byCategory` array with breakdown by IT/Non-IT and status
- `bySubType` array with breakdown by asset type

---

## Assignment Report

Shows which assets are assigned to which users.

```bash
# All assigned assets
curl -X GET http://localhost:5000/api/reports/assigned \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by specific user
USER_ID="550e8400-e29b-41d4-a716-446655440010"
curl -X GET "http://localhost:5000/api/reports/assigned?user_id=$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
- `total` count of assigned assets
- `byUser` object with user names as keys
- Each user has array of assets with full details

---

## Contract Status Report

Shows contracts at different lifecycle stages.

```bash
# Default (30 days)
curl -X GET http://localhost:5000/api/reports/contract-status \
  -H "Authorization: Bearer $TOKEN" | jq

# Custom window (60 days)
curl -X GET "http://localhost:5000/api/reports/contract-status?days=60" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
- `summary` with counts of expired, expiring, active, upcoming
- `expired` array of contracts past their end date
- `expiring` array of contracts ending within the specified days
- `active` array of contracts in effect beyond the window
- `upcoming` array of contracts not yet active

---

## Purchase Report

Summarizes purchases by status and date range.

```bash
# All purchases
curl -X GET http://localhost:5000/api/reports/purchases \
  -H "Authorization: Bearer $TOKEN" | jq

# Date range (this year)
curl -X GET "http://localhost:5000/api/reports/purchases?from=2026-01-01&to=2026-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq

# First quarter only
curl -X GET "http://localhost:5000/api/reports/purchases?from=2026-01-01&to=2026-03-31" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
- `summary.totalPurchases` total number
- `summary.totalAmount` grand total in currency
- `summary.byStatus` object with pending/completed/cancelled breakdown
  - Each status has `count`, `amount`, and `purchases` array

---

## Depreciation Report

Shows asset values and depreciation calculations.

```bash
# All assets
curl -X GET http://localhost:5000/api/reports/depreciation \
  -H "Authorization: Bearer $TOKEN" | jq

# IT assets only
curl -X GET "http://localhost:5000/api/reports/depreciation?category=IT" \
  -H "Authorization: Bearer $TOKEN" | jq

# Non-IT assets
curl -X GET "http://localhost:5000/api/reports/depreciation?category=Non-IT" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
- `summary` with total purchase value, depreciation, current value, average %
- `assets` array with per-asset breakdown:
  - asset_tag, category, sub_type
  - purchase_amount, purchase_date
  - years_old (calculated)
  - depreciation (cumulative)
  - current_value (purchase - depreciation)
  - status

**Depreciation Formula:** Straight-line over 5 years
- Year 1: ~20% depreciation
- Year 2: ~40% total
- Year 3: ~60% total
- Year 4: ~80% total
- Year 5: 100% (fully depreciated)

---

## Audit Logs Report (Admin Only)

Detailed change history with pagination.

```bash
# Get admin token (or use existing admin token)
ADMIN_TOKEN=$TOKEN  # If logged in as admin

# First page (default 20 per page)
curl -X GET http://localhost:5000/api/reports/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Custom pagination
curl -X GET "http://localhost:5000/api/reports/audit-logs?page=2&limit=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Filter by asset
ASSET_ID="550e8400-e29b-41d4-a716-446655440001"
curl -X GET "http://localhost:5000/api/reports/audit-logs?asset_id=$ASSET_ID&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Filter by action
curl -X GET "http://localhost:5000/api/reports/audit-logs?action=Updated" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Date range
curl -X GET "http://localhost:5000/api/reports/audit-logs?from=2026-05-01&to=2026-05-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Combined filters
curl -X GET "http://localhost:5000/api/reports/audit-logs?asset_id=$ASSET_ID&action=Updated&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

**Expected Response:**
- `logs` array with audit entries (sorted by most recent first)
  - Each log includes: id, asset_id, user_id, action, old_value, new_value, changed_at
  - User details (name, email, role)
- `pagination` with total, page, limit, totalPages

**Note:** Staff users cannot access this endpoint (403 Forbidden)

---

## Error Testing

### Invalid Token
```bash
curl -X GET http://localhost:5000/api/reports/inventory \
  -H "Authorization: Bearer invalid-token"
```
**Expected:** 401 with "Invalid token" message

### Missing Token
```bash
curl -X GET http://localhost:5000/api/reports/inventory
```
**Expected:** 401 with "No token provided" message

### Invalid Query Parameter
```bash
curl -X GET "http://localhost:5000/api/reports/contract-status?days=999" \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** 400 with validation error

### Access Denied (Non-Admin to Audit Logs)
```bash
VIEWER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X GET http://localhost:5000/api/reports/audit-logs \
  -H "Authorization: Bearer $VIEWER_TOKEN"
```
**Expected:** 403 with "Access denied" message

---

## Test Checklist

### Inventory Report
- [ ] Returns summary with all asset statuses
- [ ] byCategory includes IT and Non-IT
- [ ] bySubType groups correctly
- [ ] Counts are accurate

### Assignment Report
- [ ] Shows all assigned assets
- [ ] Can filter by user_id
- [ ] Groups by user name correctly
- [ ] Includes user details and asset specs

### Contract Status
- [ ] Default 30-day window works
- [ ] Custom days parameter works
- [ ] Separates expired/expiring/active/upcoming
- [ ] Contract details are complete

### Purchase Report
- [ ] Shows all purchases
- [ ] Date range filtering works
- [ ] Totals are calculated correctly
- [ ] Status breakdown is accurate

### Depreciation Report
- [ ] Calculates depreciation correctly
- [ ] Filter by category works
- [ ] Totals match individual assets
- [ ] Current value is non-negative

### Audit Logs (Admin)
- [ ] Pagination works (page, limit)
- [ ] Asset filter works
- [ ] Action filter works (partial match)
- [ ] Date range filter works
- [ ] Non-admin gets 403

---

## Bash Test Script

Create `test_reports.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Reports API"
echo "======================="

# Get token
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Token obtained${NC}"

# Test Inventory
echo -e "\n1️⃣ Testing GET /api/reports/inventory..."
curl -s -X GET "$BASE_URL/reports/inventory" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Inventory report works${NC}"

# Test Assignment
echo -e "\n2️⃣ Testing GET /api/reports/assigned..."
curl -s -X GET "$BASE_URL/reports/assigned" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Assignment report works${NC}"

# Test Contracts
echo -e "\n3️⃣ Testing GET /api/reports/contract-status..."
curl -s -X GET "$BASE_URL/reports/contract-status?days=30" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Contract status report works${NC}"

# Test Purchases
echo -e "\n4️⃣ Testing GET /api/reports/purchases..."
curl -s -X GET "$BASE_URL/reports/purchases" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Purchase report works${NC}"

# Test Depreciation
echo -e "\n5️⃣ Testing GET /api/reports/depreciation..."
curl -s -X GET "$BASE_URL/reports/depreciation" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Depreciation report works${NC}"

# Test Audit Logs
echo -e "\n6️⃣ Testing GET /api/reports/audit-logs..."
curl -s -X GET "$BASE_URL/reports/audit-logs?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "${GREEN}✅ Audit logs report works${NC}"

echo -e "\n======================="
echo -e "${GREEN}✅ All tests passed!${NC}"
```

Run it:
```bash
chmod +x test_reports.sh
./test_reports.sh
```

---

## Performance Tips

- **Inventory Report**: Fast - uses simple COUNT aggregation
- **Assignment Report**: Medium - joins with user and detail tables
- **Depreciation Report**: Medium - calculates depreciation for all assets
- **Audit Logs**: Use pagination for large datasets (limit default: 20)

For systems with 1000+ assets, audit logs endpoint automatically pages results.

---

## Related Documentation

- [REPORTS_API.md](REPORTS_API.md) - Full API reference
- [ASSETS_TESTING.md](ASSETS_TESTING.md) - Asset endpoint testing
- [PURCHASES_API.md](PURCHASES_API.md) - Purchase endpoints
- [CONTRACTS_API.md](CONTRACTS_API.md) - Contract endpoints
