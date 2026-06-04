# Business Rules Testing Guide

## Quick Test Guide

### Test Requirement 1: MAC Address Hidden for Non-IT Assets

#### Test 1A: Create Non-IT Asset (No MAC Address)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "Non-IT"
2. Sub Type: Select "Chair"
3. Asset Name: Type "Executive Chair"
4. Status: Select "Active"
5. ✅ MAC Address field should NOT be visible
6. Serial Number: (optional)
7. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ No error messages
✅ Redirects to assets list
✅ New asset shows in list
```

#### Test 1B: Create IT Asset (With MAC Address)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "IT"
2. Sub Type: Select "Laptop"
3. Asset Name: Type "Dell XPS 13"
4. Status: Select "Active"
5. ✅ MAC Address field SHOULD be visible
6. MAC Address: Type "00:1A:2B:3C:4D:5E"
7. Serial Number: Type "DELL-001"
8. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ MAC address saved to database
✅ Can be queried from assets list
```

---

### Test Requirement 2: Assigned To Disabled for Non-Active Assets

#### Test 2A: Create Inactive Asset (Assigned To Disabled)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "IT"
2. Sub Type: Select "Monitor"
3. Asset Name: Type "Dell Monitor"
4. Status: Select "Inactive"
5. ✅ Assigned To field should be DISABLED
6. ✅ Field background should be GRAY
7. ✅ Helper text: "Cannot assign inactive assets..."
8. Try to click Assigned To dropdown → No action
9. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ assigned_to = null in database
✅ No validation errors
```

#### Test 2B: Create Disposed Asset (Assigned To Disabled)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "Non-IT"
2. Sub Type: Select "Desk"
3. Asset Name: Type "Old Desk"
4. Status: Select "Disposed"
5. ✅ Assigned To field should be DISABLED
6. ✅ Field background should be GRAY
7. ✅ Helper text: "Cannot assign disposed assets..."
8. Try to click dropdown → No action
9. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ assigned_to = null in database
```

#### Test 2C: Create Active Asset (Assigned To Enabled)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "IT"
2. Sub Type: Select "Laptop"
3. Asset Name: Type "Work Laptop"
4. Status: Select "Active"
5. ✅ Assigned To field should be ENABLED
6. ✅ Field background should be WHITE/NORMAL
7. Click Assigned To → Select "Prakash"
8. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ assigned_to = "Prakash" in database
✅ Can see in assets list
```

#### Test 2D: Change Status Active → Inactive (Auto-Clear)
```
URL: http://localhost:5173/assets/new

Steps:
1. Category: Select "IT"
2. Sub Type: Select "Router"
3. Asset Name: Type "Network Router"
4. Status: Select "Active"
5. Assigned To: Select "Vaidyanathan"
6. Status: Change to "Inactive"
7. ✅ Assigned To field should AUTO-CLEAR (empty)
8. ✅ Assigned To field should become DISABLED
9. Click "Create Asset"

Expected Result:
✅ Asset created successfully
✅ assigned_to = null in database (cleared)
✅ Status = "inactive"
```

---

## API Testing (cURL)

### Test 1: POST Non-IT Asset with MAC Address (Should Ignore)
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "CHR-001",
    "asset_name": "Test Chair",
    "category": "Non-IT",
    "sub_type": "Chair",
    "status": "active",
    "mac_address": "00:1A:2B:3C:4D:5E"
  }'

Expected:
✅ Status 201 Created
✅ Asset created
✅ mac_address is null in response
```

### Test 2: POST Inactive Asset with Assigned To (Should Fail)
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "LAP-001",
    "asset_name": "Test Laptop",
    "category": "IT",
    "sub_type": "Laptop",
    "status": "inactive",
    "assigned_to": "Prakash"
  }'

Expected:
❌ Status 400 Bad Request
❌ Message: "Cannot assign assets with status 'inactive'..."
❌ No asset created
```

### Test 3: POST Active Asset with Assigned To (Should Succeed)
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_tag": "LAP-002",
    "asset_name": "Test Laptop",
    "category": "IT",
    "sub_type": "Laptop",
    "status": "active",
    "assigned_to": "Prakash"
  }'

Expected:
✅ Status 201 Created
✅ Asset created
✅ assigned_to = "Prakash"
```

---

## Database Verification

### Check Non-IT Asset (No MAC)
```sql
SELECT asset_tag, asset_name, category, mac_address, assigned_to 
FROM assets 
WHERE category = 'Non-IT' 
LIMIT 5;
```
Expected: `mac_address` is NULL for all Non-IT assets

### Check Inactive Asset (No Assignment)
```sql
SELECT asset_tag, asset_name, status, assigned_to 
FROM assets 
WHERE status != 'active' 
LIMIT 5;
```
Expected: `assigned_to` is NULL for all non-active assets

### Check Active IT Asset with Assignment
```sql
SELECT asset_tag, asset_name, category, status, mac_address, assigned_to 
FROM assets 
WHERE category = 'IT' AND status = 'active' AND assigned_to IS NOT NULL 
LIMIT 5;
```
Expected: Shows IT assets with MAC address and assigned user

---

## Common Test Cases

| Scenario | Category | Status | MAC | Assigned To | Expected |
|----------|----------|--------|-----|-------------|----------|
| Non-IT Chair | Non-IT | active | input | input | MAC ignored, Assigned OK |
| IT Laptop | IT | active | input | input | Both saved ✅ |
| Inactive Laptop | IT | inactive | input | input | Fails - can't assign ❌ |
| Disposed Chair | Non-IT | disposed | input | input | Fails - can't assign ❌ |
| Active Desktop | IT | active | input | empty | MAC saved, no assign ✅ |
| Status change Active→Inactive | IT | inactive | - | empty → auto-cleared | Clears assignment ✅ |

---

## Expected Log Messages

### Frontend Logs (Browser Console)
```
Generated asset tag: CHR-001
Status changed to inactive - clearing assigned_to
Form submitted with data: {...}
Sending payload: {...}
Create response: {...}
```

### Backend Logs (Terminal)
```
📝 POST /api/assets - Create Asset
Request Body: {...}
✓ Validation passed
Creating asset: {asset_tag: "CHR-001", ...}
✓ Asset created: {id: "uuid", asset_tag: "CHR-001"}
✓ Asset detail created: {id: "uuid"}
✓ Transaction committed
```

### When Rule Violated
```
❌ Attempted to assign non-active asset: {status: "inactive", assigned_to: "Prakash"}
⚠️ MAC Address provided for Non-IT asset - will be ignored
Status changed to inactive - clearing assigned_to
```

---

## Troubleshooting

### Issue: MAC Address field still showing for Non-IT
**Solution:** Hard refresh browser (Ctrl+Shift+R), check that selectedCategory is being watched

### Issue: Assigned To not getting disabled
**Solution:** Verify selectedStatus watch is properly watching status field, check React Hook Form setValue is called

### Issue: Backend accepting assigned_to for inactive
**Solution:** Check routes/assets.js validation custom function is properly checking status, restart backend

### Issue: MAC Address saving for Non-IT assets
**Solution:** Verify the assetData construction sets mac_address to null for Non-IT, check database value

---

## Success Criteria

✅ Non-IT assets cannot have MAC address saved  
✅ Inactive/Disposed assets cannot have assigned user  
✅ Frontend properly hides/disables fields based on rules  
✅ Backend rejects invalid data  
✅ Database maintains data integrity  
✅ User-friendly error messages  
✅ All CRUD operations work correctly  
✅ Edit/Update respects business rules  

