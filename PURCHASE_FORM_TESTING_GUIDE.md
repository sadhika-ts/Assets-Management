# 🛒 Purchase Order Form - Testing Guide

## Quick Test (2 minutes)

### 1. Open Browser
```
http://localhost:5173/purchases/new
```

### 2. Fill Form with Test Data

**Section 1 - Purchase Information:**
- Purchase Date: `2026-06-03` (auto-filled)
- Invoice Number: `INV-TEST-001`
- Payment Method: `Credit Card`
- Purchase Status: `Ordered`
- Notes: `Test purchase from form`

**Section 2 - Vendor Information:**
- Vendor Name: `Test Vendor LLC`
- Vendor Contact: `+91-9000000000`
- Vendor Email: `test@company.com`
- Vendor Address: `100 Test Street, City`

**Section 3 - Shipping & Billing:**
- Shipping Address: `200 Shipping Ave, City`
- Billing Address: `300 Billing Ave, City` (or use copy button)

### 3. Click "✅ Create Purchase Order"

### 4. Expected Results

**✅ Success Scenario:**
- Toast message: `"✅ Data stored successfully - Purchase Order PO-2026-[timestamp] created"`
- Page redirects to `/purchases` after 2 seconds
- New purchase appears in the Purchases list

**❌ Error Scenario:**
- Red error toast appears with specific error message
- Form stays open, you can fix and retry
- Check browser console (F12) for details

---

## Verify Data in Database

### Terminal Check

```bash
# Check if purchase was saved
PGPASSWORD=postgres123 psql -h localhost -U postgres -d asset_inventory_db \
  -c "SELECT purchase_id, vendor_name, status, invoice_number FROM purchases ORDER BY created_at DESC LIMIT 3;"
```

**Expected Output:**
```
   purchase_id    |   vendor_name   | status | invoice_number
------------------+-----------------+--------+-----------------
 PO-2026-1717...  | Test Vendor LLC | ordered| INV-TEST-001
```

### View Full Record

```bash
PGPASSWORD=postgres123 psql -h localhost -U postgres -d asset_inventory_db \
  -c "SELECT * FROM purchases WHERE purchase_id LIKE 'PO-2026-%' ORDER BY created_at DESC LIMIT 1 \gx"
```

---

## Debug Information

### View Backend Logs

```bash
# Real-time logs
tail -f logs/backend.log | grep -E "POST|purchases|Error|✓|❌"

# Last 50 lines
tail -50 logs/backend.log
```

### View Frontend Logs

1. Open browser: **F12 or Ctrl+Shift+I**
2. Go to **Console** tab
3. Look for:
   - `🛒 Purchase Form Submitted`
   - `Form Data:`
   - `Sending POST request to /api/purchases`
   - `Response:` with success data

### Test API Directly

```bash
# Simple test
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "PO-2026-API-TEST",
    "vendor_name": "API Test Vendor",
    "purchase_date": "2026-06-03"
  }' | python3 -m json.tool
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Purchase created successfully",
  "data": {
    "purchase": {
      "id": "uuid...",
      "purchase_id": "PO-2026-API-TEST",
      "vendor_name": "API Test Vendor",
      ...
    }
  }
}
```

---

## Common Issues & Solutions

### Issue 1: Form Shows Validation Errors (Red Messages)

**Check:**
- [ ] Vendor Name is filled
- [ ] Vendor Contact is filled
- [ ] Vendor Email is valid (has @)
- [ ] Vendor Address is filled
- [ ] Shipping Address is filled
- [ ] Billing Address is filled
- [ ] Invoice Number is filled
- [ ] Purchase Date is selected

**Solution:** Fill all required fields (marked with red *)

---

### Issue 2: Toast Shows "Failed to save purchase order"

**Check Browser Console (F12):**

Look for error details in the Response section:

```javascript
// Example error:
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {"msg": "Invalid email format", "param": "vendor_email"}
  ]
}
```

**Solutions:**
- **Invalid email:** Check email format (must have @)
- **Invalid date:** Select a valid date
- **Duplicate purchase ID:** Use a unique purchase ID (normally auto-generated)

---

### Issue 3: Data Not Showing in Purchases List

**Check:**
1. Refresh the page (Ctrl+R or Cmd+R)
2. Check database: Run SQL query above
3. Check browser console for errors
4. Check logs: `tail -50 logs/backend.log`

---

### Issue 4: No Toast Message at All

**Check:**
1. Browser console (F12) for JavaScript errors
2. Network tab to see if request was sent
3. Refresh page and try again
4. Restart servers: `bash stop.sh && bash run.sh`

---

## Field Mapping Reference

| Frontend Field | Database Column | Type | Notes |
|---|---|---|---|
| `purchase_id` | `purchase_id` | STRING | Auto-generated as PO-YYYY-[timestamp] |
| `vendor_name` | `vendor_name` | STRING | Required |
| `vendor_contact` | `vendor_contact` | STRING | Optional |
| `vendor_email` | `vendor_email` | STRING | Optional, must be valid email |
| `vendor_address` | `vendor_address` | TEXT | Optional |
| `billing_address` | `billing_address` | TEXT | Optional |
| `shipping_address` | `shipping_address` | TEXT | Optional |
| `invoice_number` | `invoice_number` | STRING | Optional |
| `payment_method` | `payment_method` | STRING | Optional, defaults to "Bank Transfer" |
| `notes` | `notes` | TEXT | Optional |
| `purchase_date` | `purchase_date` | TIMESTAMP | Required |
| `purchase_status` | `status` | STRING | Required, lowercased: pending/ordered/delivered/cancelled |
| - | `total_amount` | DECIMAL | Defaults to 0 |
| - | `created_at` | TIMESTAMP | Auto-set to now |

---

## API Endpoint Reference

### Create Purchase Order
```
POST /api/purchases
Content-Type: application/json

{
  "purchase_id": "PO-2026-001",
  "vendor_name": "Vendor Name",
  "vendor_contact": "+91-9876543210",
  "vendor_email": "vendor@company.com",
  "vendor_address": "123 Street, City",
  "billing_address": "456 Avenue, City",
  "shipping_address": "789 Road, City",
  "invoice_number": "INV-2026-001",
  "payment_method": "Bank Transfer",
  "notes": "Optional notes",
  "purchase_date": "2026-06-03",
  "total_amount": 50000,
  "status": "pending"
}

Response (201):
{
  "success": true,
  "message": "Purchase created successfully",
  "data": {
    "purchase": { ... }
  }
}
```

### Get All Purchases
```
GET /api/purchases

Response (200):
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "purchases": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## Success Checklist

- ✅ Form page loads at `/purchases/new`
- ✅ All form fields are visible and editable
- ✅ Can fill in text inputs and select dropdowns
- ✅ Can clear and re-fill fields
- ✅ Copy button works (copies vendor address to billing)
- ✅ Cancel button returns to `/purchases`
- ✅ Submit button is enabled when form is valid
- ✅ Toast message appears on submit
- ✅ Page redirects to `/purchases` after 2 seconds
- ✅ New purchase appears in list
- ✅ Data persists in PostgreSQL
- ✅ All fields are saved correctly
- ✅ No errors in browser console
- ✅ Backend logs show successful creation

---

## Test Data Templates

### Test Set 1: Minimal
```
Vendor Name: Minimal Vendor
Vendor Email: minimal@test.com
Others: Leave optional fields empty
```

### Test Set 2: Complete
```
Purchase ID: PO-2026-COMPLETE-001
Vendor Name: Complete Test Vendor Inc
Contact: +91-9111111111
Email: complete@vendor.com
Vendor Address: 100 Complete Street, Test City
Shipping Address: 200 Ship Lane, Test City  
Billing Address: 300 Bill Road, Test City
Invoice Number: INV-COMPLETE-001
Payment Method: Credit Card
Status: Delivered
Notes: This is a complete test purchase order
```

### Test Set 3: Different Payment Methods
- Test each payment method: Cash, Bank Transfer, Credit Card, UPI, Cheque
- Verify each saves correctly with correct method in database

---

## Files to Monitor

```
logs/backend.log      # Backend server output
logs/frontend.log     # Frontend server output
database.sqlite       # (If using SQLite)
```

### Real-time Monitoring

```bash
# Terminal 1: Backend logs
tail -f logs/backend.log | grep -E "POST|purchases|Error"

# Terminal 2: Database changes
watch -n 1 "PGPASSWORD=postgres123 psql -h localhost -U postgres -d asset_inventory_db -c \"SELECT COUNT(*) as total_purchases FROM purchases;\""

# Terminal 3: Frontend logs (in browser console)
```

---

## What Was Fixed

1. **Frontend no longer ignores form** - Now makes actual API call
2. **Backend accepts requests** - Authentication disabled for dev
3. **Fields are mapped correctly** - `purchase_status` → `status`
4. **All form data is saved** - Missing fields added to model
5. **Data persists in PostgreSQL** - Not just in memory
6. **Errors are displayed** - No more silent failures
7. **Success feedback** - Toast message with 2-second delay

---

## Success Criteria

You'll know it's working when:

1. **Fill form** → Submit → **See green toast** → **Redirected to list**
2. **Run SQL query** → See your new purchase in database
3. **Check backend logs** → See "✓ Purchase created" message
4. **No red error messages** anywhere

---

**Status:** ✅ Ready for Testing
**Last Updated:** June 3, 2026
**Backend:** http://localhost:5000
**Frontend:** http://localhost:5173
