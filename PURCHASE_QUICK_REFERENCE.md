# Purchase Order Form - Quick Reference

## 🚀 Quick View: Mandatory Fields

```
┌─────────────────────────────────────────────────────────────┐
│                  PURCHASE ORDER FORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SECTION 1: PURCHASE INFORMATION                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  ✅ MANDATORY: Purchase Date *                             │
│     Type: Date picker                                      │
│     Default: Today's date                                  │
│     Example: 2026-06-04                                    │
│                                                             │
│  ✅ MANDATORY: Invoice Number *                            │
│     Type: Text input                                       │
│     Example: INV-2026-5001                                │
│     Cannot be empty!                                       │
│                                                             │
│  ⏸️  OPTIONAL: Payment Method                              │
│     Type: Dropdown                                         │
│     Default: Bank Transfer                                 │
│     Options: Cash, Bank Transfer, Credit Card, UPI, Cheque │
│                                                             │
│  ⏸️  OPTIONAL: Purchase Status                             │
│     Type: Dropdown                                         │
│     Default: Pending                                       │
│     Options: Pending, Ordered, Delivered, Cancelled       │
│                                                             │
│  ⏸️  OPTIONAL: Notes                                       │
│     Type: Textarea                                         │
│     Can be blank                                           │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  SECTION 2: VENDOR INFORMATION                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  ✅ MANDATORY: Vendor Name *                               │
│     Type: Text input                                       │
│     Example: Dell Technologies                             │
│     Cannot be empty!                                       │
│                                                             │
│  ✅ MANDATORY: Vendor Contact Number *                     │
│     Type: Phone input                                      │
│     Example: +91-9876543210                               │
│     Cannot be empty!                                       │
│                                                             │
│  ✅ MANDATORY: Vendor Email *                              │
│     Type: Email input                                      │
│     Example: sales@dell.com                               │
│     Must have @ symbol!                                    │
│                                                             │
│  ✅ MANDATORY: Vendor Address *                            │
│     Type: Text input                                       │
│     Example: 123 Tech Park, Bangalore                     │
│     Cannot be empty!                                       │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  SECTION 3: SHIPPING & BILLING                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  ✅ MANDATORY: Shipping Address *                          │
│     Type: Textarea (multi-line)                            │
│     Example: Conference Room A, 3rd Floor, Building B      │
│     Cannot be empty!                                       │
│                                                             │
│  ✅ MANDATORY: Billing Address *                           │
│     Type: Textarea (multi-line)                            │
│     Example: Finance Department, Company HQ               │
│     Cannot be empty!                                       │
│     💡 Tip: Use "Copy Vendor Address" button              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Cancel]                              [✅ Create Purchase] │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 All Fields Summary Table

| # | Field Name | Section | Required | Type | Notes |
|---|-----------|---------|----------|------|-------|
| 1 | Purchase Date | Info | ✅ YES | Date | Auto-filled, change if needed |
| 2 | Invoice Number | Info | ✅ YES | Text | Vendor's invoice #, cannot be empty |
| 3 | Payment Method | Info | ❌ NO | Dropdown | Default: Bank Transfer |
| 4 | Purchase Status | Info | ❌ NO | Dropdown | Default: Pending |
| 5 | Notes | Info | ❌ NO | Textarea | Special instructions, optional |
| 6 | Vendor Name | Vendor | ✅ YES | Text | Cannot be empty |
| 7 | Vendor Contact | Vendor | ✅ YES | Phone | Cannot be empty |
| 8 | Vendor Email | Vendor | ✅ YES | Email | Must have @, cannot be empty |
| 9 | Vendor Address | Vendor | ✅ YES | Text | Cannot be empty |
| 10 | Shipping Address | Shipping | ✅ YES | Textarea | Cannot be empty |
| 11 | Billing Address | Shipping | ✅ YES | Textarea | Cannot be empty, has copy button |

---

## 📍 Location of Each Field

### **Section 1: Purchase Information**
- Purchase Date (Left column)
- Invoice Number (Middle column)
- Payment Method (Right column)
- Purchase Status (Left column, below)
- Notes (Full width, textarea)

### **Section 2: Vendor Information**
- Vendor Name (Left column)
- Vendor Contact Number (Right column)
- Vendor Email (Left column, below)
- Vendor Address (Right column, below)

### **Section 3: Shipping & Billing**
- Shipping Address (Left column, multi-line)
- Billing Address (Right column, multi-line)
- Copy Button (Below Billing Address)

---

## 🎯 What You Must Fill

### **MUST FILL (8 Fields):**
```
☑️ Purchase Date
☑️ Invoice Number
☑️ Vendor Name
☑️ Vendor Contact Number
☑️ Vendor Email
☑️ Vendor Address
☑️ Shipping Address
☑️ Billing Address
```

### **CAN SKIP (3 Fields):**
```
☐ Payment Method (has default)
☐ Purchase Status (has default)
☐ Notes (optional notes field)
```

---

## 📝 Example Values for Each Field

### **SECTION 1**
```
Purchase Date:        2026-06-04
Invoice Number:       INV-2026-5001
Payment Method:       Bank Transfer
Purchase Status:      Ordered
Notes:                Deliver before Friday - Urgent
```

### **SECTION 2**
```
Vendor Name:          Dell Technologies
Vendor Contact:       +91-1800-DELL-001
Vendor Email:         enterprise.sales@dell.com
Vendor Address:       Dell Campus, Bangalore 560001
```

### **SECTION 3**
```
Shipping Address:     Conference Room A
                      3rd Floor, IT Building
                      Tech Campus, Bangalore 560001

Billing Address:      Finance Department
                      Accounts Payable Section
                      Company Headquarters, Bangalore
```

---

## ⚠️ Common Mistakes to Avoid

| Mistake | ❌ Wrong | ✅ Right |
|---------|----------|----------|
| Email format | vendor@.com | vendor@company.com |
| Empty required field | (blank) | Dell Technologies |
| Phone format | 98765 43210 | +91-9876543210 |
| Invoice number | (blank) | INV-2026-5001 |
| Address too short | Bangalore | 123 Tech Park, Bangalore, KA 560001 |
| Vendor name | dell, DELL | Dell Technologies |
| Billing = Shipping | Type separately | Use Copy button if same |

---

## ✅ Validation Rules

```
Purchase Date:
  ✓ Cannot be empty
  ✓ Must be valid date
  ✓ Format: YYYY-MM-DD

Invoice Number:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Any text format allowed

Vendor Name:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Trimmed (spaces removed)

Vendor Contact:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Any phone format

Vendor Email:
  ✓ Cannot be empty
  ✓ Must contain @ symbol
  ✓ Valid email format required

Vendor Address:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Complete address needed

Shipping Address:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Multi-line allowed

Billing Address:
  ✓ Cannot be empty
  ✓ Cannot be just spaces
  ✓ Multi-line allowed
```

---

## 🏃 Fast Track: Minimum Required

To create a purchase order, you MUST fill these 8 fields:

```
1. Purchase Date:        [Fill today's date or change]
2. Invoice Number:       [Enter invoice number]
3. Vendor Name:          [Enter vendor name]
4. Vendor Contact:       [Enter phone number]
5. Vendor Email:         [Enter email]
6. Vendor Address:       [Enter vendor address]
7. Shipping Address:     [Enter shipping address]
8. Billing Address:      [Enter billing address or copy]

Then: Click "Create Purchase Order" button
```

---

## 🎓 Before You Submit

Checklist:

- [ ] All 8 mandatory fields have values?
- [ ] No empty red-bordered fields?
- [ ] Vendor email has @ symbol?
- [ ] All addresses are complete?
- [ ] Ready to submit?

✅ **YES** → Click "Create Purchase Order"  
❌ **NO** → Fix the empty fields first

---

## 🆘 If You Get an Error

**Error Message:** "Please fill in all required fields"

**Solution:**
1. Look for red-bordered fields (empty/invalid)
2. Fill those fields
3. If vendor email: ensure it has @
4. Click "Create Purchase Order" again

**Example Error:**
```
❌ Vendor Email: "vendor.com" (missing @)
✅ Fix to: "vendor@company.com"
```

---

## 💡 Pro Tips

1. **Copy Button**: Use "Copy Vendor Address" if shipping = billing
2. **Invoice Number**: Always match vendor's invoice
3. **Email Format**: Must have @ (vendor@company.com)
4. **Contact**: Keep current and verified
5. **Address**: Include complete details (street, city, state)
6. **Status**: Update as order progresses
7. **Notes**: Use for special instructions

---

## ✨ Summary

**MANDATORY:** 8 fields  
**OPTIONAL:** 3 fields  
**All Sections:** 3 sections  

Fill the 8 mandatory fields (marked with red *) and click Submit!

