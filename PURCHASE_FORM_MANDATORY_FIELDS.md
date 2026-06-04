# Purchase Order Form - Mandatory Fields Guide

## 📋 Quick Summary

**Total Fields:** 11 Fields  
**Mandatory Fields:** 9  
**Optional Fields:** 2  

---

## 🔴 **MANDATORY FIELDS** (Must Fill Before Submit)

### **Section 1: Purchase Information**

#### **1. Purchase Date** ⭐ REQUIRED
- **Type:** Date picker
- **Format:** YYYY-MM-DD (e.g., 2026-06-04)
- **Default:** Today's date (auto-filled)
- **Purpose:** When the purchase order was created
- **Example:** 2026-06-04

#### **2. Invoice Number** ⭐ REQUIRED
- **Type:** Text input
- **Format:** Any alphanumeric format
- **Example:** INV-2024-001, INV-2026-0042, 12345
- **Purpose:** Vendor's invoice reference number
- **Validation:** Cannot be empty
- **Tips:**
  - Use vendor's official invoice number
  - Can follow any format (vendor decides)
  - Used for payment reconciliation

#### **3. Total Amount** ⭐ REQUIRED
- **Type:** Number input (with currency symbol ₹)
- **Format:** Decimal number
- **Example:** 50000, 1000.50, 150000.75
- **Minimum:** Must be > 0
- **Purpose:** Total purchase cost
- **Validation:** Cannot be empty, must be > 0
- **Tips:**
  - Match vendor invoice amount
  - Use decimals for precise values (e.g., 1000.50)
  - Critical for budget tracking
  - Used in financial reports

### **Section 2: Vendor Information**

#### **4. Vendor Name** ⭐ REQUIRED
- **Type:** Text input
- **Format:** Any alphanumeric format
- **Example:** INV-2024-001, INV-2026-0042, 12345
- **Purpose:** Vendor's invoice reference number
- **Validation:** Cannot be empty
- **Tips:**
  - Use vendor's official invoice number
  - Can follow any format (vendor decides)
  - Used for payment reconciliation

#### **3. Total Amount** ⭐ REQUIRED
- **Type:** Number input
- **Currency:** Indian Rupees (₹)
- **Format:** Decimal number (can have decimals)
- **Example:** 50000, 1000.50, 150000.75
- **Minimum Value:** Must be greater than 0
- **Validation:**
  - Cannot be empty or zero
  - Must be a valid number
  - Supports decimal values (e.g., 1000.50)
- **Purpose:** Total cost of the purchase order
- **Character Limit:** No limit
- **Tips:**
  - Match vendor's invoice amount
  - Use decimal for precise values
  - Important for budget tracking
  - Used for financial reporting

### **Section 2: Vendor Information**

#### **5. Vendor Contact Number** ⭐ REQUIRED
- **Type:** Telephone input
- **Format:** Phone number (any format)
- **Examples:**
  - +91-9876543210
  - +1-800-123-4567
  - 1800-XXX-XXXX
  - 9876543210
- **Validation:** Cannot be empty, must be trimmed
- **Purpose:** For reaching vendor regarding the order
- **Tips:**
  - Use landline or primary contact
  - Include country code for international
  - Keep current and verified

#### **5. Vendor Email** ⭐ REQUIRED
- **Type:** Email input
- **Format:** valid@email.com
- **Examples:**
  - sales@dell.com
  - vendor@company.co.in
  - contact@office.com
- **Validation:**
  - Cannot be empty
  - Must contain '@' symbol
  - Valid email format required
- **Purpose:** For order confirmation and communication
- **Tips:**
  - Use official vendor email
  - Verify email before saving
  - Use primary contact email

#### **6. Vendor Address** ⭐ REQUIRED
- **Type:** Text input
- **Format:** Complete address
- **Example:** 123 Tech Park, Bangalore, Karnataka 560001, India
- **Validation:** Cannot be empty, must be trimmed
- **Purpose:** Vendor's official address for records
- **Tips:**
  - Use complete address (street, city, state, PIN)
  - Useful for legal documentation
  - Should match vendor's official address

### **Section 3: Shipping & Billing Information**

#### **7. Shipping Address** ⭐ REQUIRED
- **Type:** Textarea (multi-line)
- **Format:** Complete address
- **Example:**
  ```
  Conference Room A
  3rd Floor, Building B
  Tech Campus, Bangalore
  Karnataka 560001, India
  ```
- **Validation:** Cannot be empty, must be trimmed
- **Purpose:** Where to ship the purchased items
- **Character Limit:** None specified
- **Tips:**
  - Use complete address
  - Include department/building/floor if applicable
  - Verify location exists
  - Include contact person if possible

#### **8. Billing Address** ⭐ REQUIRED
- **Type:** Textarea (multi-line)
- **Format:** Complete address
- **Example:**
  ```
  Finance Department
  Accounts Payable
  Company Headquarters
  Bangalore, Karnataka 560001
  India
  ```
- **Validation:** Cannot be empty, must be trimmed
- **Purpose:** Where invoice should be sent
- **Helper Button:** "📋 Copy Vendor Address" button available
- **Tips:**
  - Usually company's billing address
  - Can copy from vendor address if same
  - Use accounting department address
  - Important for invoice processing

---

## 🟢 **OPTIONAL FIELDS** (Can Skip)

### **Section 1: Purchase Information**

#### **1. Payment Method** (Optional but has default)
- **Type:** Dropdown select
- **Default Value:** "Bank Transfer"
- **Available Options:**
  - Cash
  - Bank Transfer
  - Credit Card
  - UPI
  - Cheque
- **Purpose:** How payment will be made
- **Tips:**
  - Select most common method
  - Affects accounting/payment processing
  - Keep consistent with company policy

#### **2. Purchase Status** (Optional but has default)
- **Type:** Dropdown select
- **Default Value:** "Pending"
- **Available Options:**
  - Pending (initial state)
  - Ordered (confirmed)
  - Delivered (received)
  - Cancelled (if needed)
- **Purpose:** Track order status
- **Tips:**
  - Usually starts as "Pending"
  - Update as status changes
  - Helps track delivery

#### **3. Notes / Special Instructions** (Optional)
- **Type:** Textarea (multi-line)
- **Character Limit:** None specified
- **Examples:**
  - "Urgent delivery needed"
  - "Pack carefully - fragile items"
  - "Bill to Project ABC"
  - "Contact John before delivery"
  - "Please include invoice in package"
- **Purpose:** Special instructions for vendor
- **Tips:**
  - Use for special requirements
  - Help vendor understand priority
  - Include any special handling
  - Keep concise and clear

---

## ✅ **Validation Summary**

| Field | Required | Type | Validation |
|-------|----------|------|-----------|
| Purchase Date | ✅ YES | Date | Not empty |
| Invoice Number | ✅ YES | Text | Not empty, trimmed |
| Vendor Name | ✅ YES | Text | Not empty, trimmed |
| Vendor Contact | ✅ YES | Phone | Not empty, trimmed |
| Vendor Email | ✅ YES | Email | Not empty, valid format with @ |
| Vendor Address | ✅ YES | Text | Not empty, trimmed |
| Shipping Address | ✅ YES | Text | Not empty, trimmed |
| Billing Address | ✅ YES | Text | Not empty, trimmed |
| Payment Method | ❌ NO | Dropdown | Has default value |
| Purchase Status | ❌ NO | Dropdown | Has default value |
| Notes | ❌ NO | Text | Can be blank |

---

## 📝 **Creating a Purchase Order - Step by Step**

### **Step 1: Purchase Information Section**

```
1️⃣ Purchase Date (Required)
   - Defaults to today
   - Click if you need to change date
   - Format: YYYY-MM-DD

2️⃣ Invoice Number (Required)
   - Enter vendor's invoice number
   - Example: INV-2026-0042
   - Cannot leave blank ❌

3️⃣ Payment Method (Optional)
   - Default: Bank Transfer
   - Change if needed
   - Options: Cash, Bank Transfer, Credit Card, UPI, Cheque

4️⃣ Purchase Status (Optional)
   - Default: Pending
   - Will update as order progresses
   - Options: Pending, Ordered, Delivered, Cancelled

5️⃣ Notes (Optional)
   - Add special instructions
   - Can be left blank
   - Example: "Urgent - needed by Friday"
```

### **Step 2: Vendor Information Section**

```
3️⃣ Vendor Name (Required)
   - Who are you buying from?
   - Example: Dell Technologies
   - Cannot be empty ❌

4️⃣ Vendor Contact Number (Required)
   - How to reach vendor
   - Example: +91-9876543210
   - Cannot be empty ❌

5️⃣ Vendor Email (Required)
   - For order communication
   - Example: sales@dell.com
   - Must have @ symbol ❌
   - Cannot be empty ❌

6️⃣ Vendor Address (Required)
   - Vendor's official address
   - Example: 123 Tech Park, Bangalore
   - Cannot be empty ❌
```

### **Step 3: Shipping & Billing Section**

```
7️⃣ Shipping Address (Required)
   - Where to ship the items
   - Multi-line text area
   - Include floor, building, department
   - Cannot be empty ❌

8️⃣ Billing Address (Required)
   - Where invoice goes
   - Multi-line text area
   - Usually company's billing address
   - Cannot be empty ❌
   - Pro Tip: Use "Copy Vendor Address" button if same
```

### **Step 4: Submit**

```
Review all filled fields
Click "Create Purchase Order" button
✅ Success message appears
✅ Purchase Order created
✅ Redirected to purchases list
```

---

## 🚨 **Common Errors & How to Fix**

### **Error: "Please fill in all required fields"**

**Cause:** One or more mandatory fields are empty

**Check These Fields:**
- ❌ Purchase Date - Is it filled?
- ❌ Invoice Number - Is it filled?
- ❌ Vendor Name - Is it filled?
- ❌ Vendor Contact - Is it filled?
- ❌ Vendor Email - Is it filled with valid email?
- ❌ Vendor Address - Is it filled?
- ❌ Shipping Address - Is it filled?
- ❌ Billing Address - Is it filled?

**Fix:** Fill any empty field and try again

---

### **Error: "Invalid email format"**

**Cause:** Vendor Email doesn't have '@' symbol

**Example of Invalid:**
- ❌ vendor.com (missing @)
- ❌ @vendor (missing domain)
- ❌ vendor@.com (incomplete)

**Example of Valid:**
- ✅ vendor@company.com
- ✅ sales@dell.com
- ✅ contact@email.co.in

**Fix:** Add proper email with @ symbol

---

### **Error: "This field cannot be empty"**

**Cause:** A required field has no text (or only spaces)

**Fields That Show This Error:**
- Vendor Name
- Invoice Number
- Vendor Contact Number
- Vendor Email
- Vendor Address
- Shipping Address
- Billing Address

**Fix:** Enter actual text, not just spaces

---

## 📊 **Example: Complete Purchase Order**

```
SECTION 1: PURCHASE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purchase Date:        2026-06-04 ✅
Invoice Number:       INV-2026-5001 ✅
Payment Method:       Bank Transfer
Purchase Status:      Ordered
Notes:                Urgent delivery needed

SECTION 2: VENDOR INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vendor Name:          Dell Technologies ✅
Vendor Contact:       +91-1800-XXX-XXXX ✅
Vendor Email:         sales@dell.com ✅
Vendor Address:       Dell HQ, Bangalore ✅

SECTION 3: SHIPPING & BILLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shipping Address:     Conference Room A ✅
                      3rd Floor, Building B
                      Tech Campus, Bangalore

Billing Address:      Finance Department ✅
                      Accounts Payable
                      Company HQ, Bangalore

Status: ✅ READY TO SUBMIT
```

---

## 💡 **Tips for Success**

1. **Use Copy Button**
   - If shipping and billing are same
   - Click "Copy Vendor Address" button
   - Saves time and reduces errors

2. **Consistent Vendor Names**
   - Use same name every time
   - Helps with vendor tracking
   - Makes searching easier

3. **Current Contact Information**
   - Verify phone and email
   - Update if vendor changes contact
   - Ensure you can reach vendor

4. **Complete Addresses**
   - Include street, city, state, PIN
   - Add department/building if applicable
   - Prevents delivery issues

5. **Invoice Number**
   - Must match vendor's invoice
   - Use for payment reconciliation
   - Keep organized for accounting

6. **Status Updates**
   - Update as order progresses
   - Helps track deliveries
   - Important for follow-ups

---

## 🎓 **Learning Summary**

**Mandatory Fields (8):**
1. Purchase Date
2. Invoice Number
3. Vendor Name
4. Vendor Contact Number
5. Vendor Email
6. Vendor Address
7. Shipping Address
8. Billing Address

**Optional Fields (3):**
1. Payment Method (default: Bank Transfer)
2. Purchase Status (default: Pending)
3. Notes (blank is OK)

**Remember:** Red asterisk (*) marks required fields!

---

## ✅ **Pre-Submission Checklist**

Before clicking "Create Purchase Order":

- [ ] Purchase Date is set (not empty)
- [ ] Invoice Number is filled
- [ ] Vendor Name is filled
- [ ] Vendor Contact Number is filled
- [ ] Vendor Email is valid (has @)
- [ ] Vendor Address is filled
- [ ] Shipping Address is filled
- [ ] Billing Address is filled
- [ ] Payment Method selected (or use default)
- [ ] Purchase Status selected (or use default)
- [ ] Notes added if needed (optional)

**All 8 mandatory fields filled?** → ✅ Ready to submit!

