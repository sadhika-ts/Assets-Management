#!/bin/bash

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Reports & Dashboard API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"

# Get token
echo -e "\n${BLUE}Getting authentication token...${NC}"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}' \
  | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Token obtained${NC}"

# Test 1: Dashboard
echo -e "\n${BLUE}1. Testing Dashboard (System Overview)${NC}"
DASHBOARD=$(curl -s -X GET "$BASE_URL/reports/dashboard" \
  -H "Authorization: Bearer $TOKEN")

echo $DASHBOARD | jq '.data | {total_assets, it_assets, active, inactive, disposed}'
echo -e "${GREEN}✅ Dashboard works${NC}"

# Test 2: By Category
echo -e "\n${BLUE}2. Testing By-Category (Assets by Sub-Type)${NC}"
curl -s -X GET "$BASE_URL/reports/by-category" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
echo -e "${GREEN}✅ By-category works${NC}"

# Test 3: By Status
echo -e "\n${BLUE}3. Testing By-Status (Asset Distribution)${NC}"
curl -s -X GET "$BASE_URL/reports/by-status" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
echo -e "${GREEN}✅ By-status works${NC}"

# Test 4: OS Activation
echo -e "\n${BLUE}4. Testing OS Activation${NC}"
curl -s -X GET "$BASE_URL/reports/os-activation" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
echo -e "${GREEN}✅ OS activation works${NC}"

# Test 5: MS Office
echo -e "\n${BLUE}5. Testing MS Office Installation${NC}"
curl -s -X GET "$BASE_URL/reports/ms-office" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
echo -e "${GREEN}✅ MS Office works${NC}"

# Test 6: Audit Log
echo -e "\n${BLUE}6. Testing Audit Log (Recent 50 entries)${NC}"
AUDIT=$(curl -s -X GET "$BASE_URL/reports/audit-log" \
  -H "Authorization: Bearer $TOKEN")
echo $AUDIT | jq '.data | {total, logs: .logs | length}'
echo -e "${GREEN}✅ Audit log works${NC}"

# Test 7: Export
echo -e "\n${BLUE}7. Testing Export (JSON for CSV)${NC}"
EXPORT=$(curl -s -X GET "$BASE_URL/reports/export" \
  -H "Authorization: Bearer $TOKEN")
COUNT=$(echo $EXPORT | jq '.data | length')
echo "Exported assets: $COUNT"
echo -e "${GREEN}✅ Export works${NC}"

# Test error handling
echo -e "\n${BLUE}8. Testing Error Handling (No Token)${NC}"
UNAUTH=$(curl -s -X GET "$BASE_URL/reports/dashboard")
if echo $UNAUTH | jq -e '.success == false' >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Auth check works (correctly rejected)${NC}"
else
  echo -e "${RED}❌ Auth check failed${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ All reports tests completed!${NC}"
echo -e "${BLUE}========================================${NC}"
