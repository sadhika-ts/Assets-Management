# Asset Tag Auto-Generation - User Guide

## 🎯 What You'll See Now

### **Before Creating Asset**

```
┌─────────────────────────────────────────────────────┐
│              Add Asset Form                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Basic Information                                  │
│                                                     │
│  Asset Tag *                    │ Category *        │
│  ┌─────────────────────────┐    │ ┌──────────────┐ │
│  │ LAP-003                 │    │ │ IT           │ │
│  │ (Read-only, auto-filled)│    │ └──────────────┘ │
│  └─────────────────────────┘    │                   │
│  Auto-generated based on        │ Sub Type *        │
│  category and sub-type          │ ┌──────────────┐ │
│                                 │ │ Laptop       │ │
│  Asset Name *                   │ └──────────────┘ │
│  ┌─────────────────────────┐    │                   │
│  │ Enter asset name...     │    │ Status *         │
│  └─────────────────────────┘    │ ┌──────────────┐ │
│                                 │ │ Active       │ │
│  Serial Number                  │ └──────────────┘ │
│  ┌─────────────────────────┐    │                   │
│  │ SN-001234               │    │                   │
│  └─────────────────────────┘    │                   │
│                                                     │
│  [Create Asset]  [Cancel]                           │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Key Features

### **1. Asset Tag Auto-Generation**

**What happens:**
- When you select Category (IT/Non-IT) and Sub Type (Laptop/Chair/etc.)
- Asset Tag automatically fills with next sequence number
- Examples:
  - First Laptop → `LAP-001`
  - Second Laptop → `LAP-002`
  - First Chair → `CHR-001`
  - Second Chair → `CHR-002`

**Why this matters:**
- ✅ No manual entry needed
- ✅ Prevents duplicate tags
- ✅ Consistent naming across system
- ✅ Sequential organization

### **2. Read-Only Field**

**Asset Tag field:**
- Gray background indicates read-only
- Cannot be edited manually
- Cannot be cleared
- Only displays auto-generated value

**Why:**
- Ensures uniqueness
- Prevents user errors
- Maintains data integrity

### **3. Automatic Updates**

**Field updates when you:**
- Change Category (IT → Non-IT)
- Change Sub Type (Laptop → Desktop)

**Example:**
```
Initial:
  Category: IT
  Sub Type: Laptop
  → Asset Tag: LAP-001

Change Sub Type to Printer:
  Category: IT
  Sub Type: Printer
  → Asset Tag: PRT-001 (auto-updated)

Change Category to Non-IT:
  Category: Non-IT
  Sub Type: Chair
  → Asset Tag: CHR-001 (auto-updated)
```

---

## 📋 Step-by-Step: Creating An Asset

### **Step 1: Open Form**
```
Navigation → Assets → "Create Asset" button
OR
Navigation → Assets → "Add New Asset" button
```

### **Step 2: Select Category**
```
Category dropdown: Choose "IT" or "Non-IT"
```

**Result:**
- Asset Tag remains blank (waiting for sub type)
- Sub Type dropdown shows options for selected category

### **Step 3: Select Sub Type**
```
Sub Type dropdown: Choose from available options

Examples:
  If IT:    Laptop, Desktop, Monitor, Printer, Router, etc.
  If Non-IT: Chair, Desk, Table, Cabinet, Lamp, etc.
```

**Result:**
- ⚡ Asset Tag auto-fills with generated value
- Examples:
  - Laptop → `LAP-003`
  - Chair → `CHR-002`
  - Printer → `PRT-001`

### **Step 4: Review Auto-Generated Tag**
```
Asset Tag field now shows:
┌──────────────────────────┐
│ LAP-003                  │ ← Auto-generated
│ (Read-only)              │
└──────────────────────────┘
```

No error message, field is gray (read-only)

### **Step 5: Fill Other Required Fields**

```
Asset Name: "Dell XPS 13" (required)
Status: "Active" (required)
Serial Number: "SN-001" (optional)
MAC Address: (for IT only) (optional)
Assigned To: "Prakash" (optional)
```

### **Step 6: Submit Form**
```
Click "Create Asset" button

✅ Asset created with auto-generated tag
✅ Redirected to assets list
✅ New asset visible with tag LAP-003
```

---

## 🔄 Asset Tag Generation Examples

### **Scenario 1: IT Assets (Laptops)**

```
Existing Assets:
  LAP-001: Dell Laptop
  LAP-002: HP Laptop

Create New Laptop:
  Category: IT
  Sub Type: Laptop
  ↓
  Auto-generated: LAP-003
```

### **Scenario 2: Non-IT Assets (Furniture)**

```
Existing Assets:
  CHR-001: Office Chair
  CHR-002: Visitor Chair
  CHR-003: Executive Chair

Create New Chair:
  Category: Non-IT
  Sub Type: Chair
  ↓
  Auto-generated: CHR-004
```

### **Scenario 3: Mixed Categories**

```
Create Laptop:      LAP-005
Create Chair:       CHR-006
Create Printer:     PRT-003
Create Desk:        DES-002
Create Router:      RTR-001
```

Each maintains its own sequence!

### **Scenario 4: Other Subtype**

```
Create Other IT Asset:
  Category: IT
  Sub Type: Other (describe: "Smart Watch")
  ↓
  Auto-generated: IT-OTH-001

Create Other Non-IT Asset:
  Category: Non-IT
  Sub Type: Other (describe: "Air Conditioner")
  ↓
  Auto-generated: NIT-OTH-001
```

---

## 📊 Asset Tag Format

### **Structure: PREFIX-NUMBER**

```
Examples:
  LAP-001    ← Laptop (IT)
  DES-002    ← Desktop (IT)
  PRT-003    ← Printer (IT)
  MON-001    ← Monitor (IT)
  CHR-004    ← Chair (Non-IT)
  TBL-001    ← Table (Non-IT)
  CAB-002    ← Cabinet (Non-IT)
  IT-OTH-001 ← Other IT Item
  NIT-OTH-001← Other Non-IT Item
```

### **Numbering**

```
Always 3 digits with leading zeros:
  001, 002, 003, ..., 009, 010, ..., 099, 100, ..., 999

So you can track up to 999 items of each type!
```

---

## ⚠️ Common Questions

### **Q1: Can I edit the Asset Tag?**
**A:** No, the field is read-only. It's auto-generated to ensure uniqueness.

### **Q2: What if I want a different tag?**
**A:** You cannot change it. The system auto-generates tags to prevent duplicates and maintain consistency.

### **Q3: What if the tag doesn't show?**
**A:** Ensure you've selected both Category and Sub Type. The tag generates when both are selected.

### **Q4: Can multiple assets have the same tag?**
**A:** No, the system prevents duplicates at the database level.

### **Q5: How high can the number go?**
**A:** Up to 999 per prefix (LAP-001 through LAP-999).

### **Q6: What happens after LAP-999?**
**A:** The system will show an error. At that point, you'd need to archive old assets or use a new prefix type.

### **Q7: Is the tag permanent?**
**A:** Yes, once created, the tag cannot be changed.

### **Q8: Can I see tag sequences?**
**A:** Yes, view Assets list and filter/sort by category and subtype to see all tags.

---

## ✅ Checklist: Asset Creation

Before clicking "Create Asset", verify:

- [ ] Category selected (IT or Non-IT)
- [ ] Sub Type selected (Laptop, Chair, etc.)
- [ ] Asset Tag auto-filled and visible
- [ ] No error message next to Asset Tag
- [ ] Asset Name entered
- [ ] Status selected
- [ ] Other optional fields filled (if desired)

---

## 🎉 Success Indicators

### **Asset Created Successfully When:**

```
✅ Success toast message appears:
   "Asset created with auto-generated tag"

✅ Redirected to Assets list page

✅ New asset visible in list with:
   - Asset Tag: LAP-003 (auto-generated)
   - Asset Name: Whatever you entered
   - Category: IT or Non-IT
   - Status: Active/Inactive
   - Status shows "Created successfully"

✅ Can filter/search by new tag:
   Search: "LAP-003" → Finds your asset
```

---

## 📚 Reference: All Asset Prefixes

### **IT Assets**
| Sub Type | Prefix | Example |
|----------|--------|---------|
| Laptop | LAP | LAP-001 |
| Desktop | DES | DES-001 |
| Monitor | MON | MON-001 |
| Keyboard | KBD | KBD-001 |
| Mouse | MOU | MOU-001 |
| Printer | PRT | PRT-001 |
| Scanner | SCN | SCN-001 |
| Router | RTR | RTR-001 |
| Switch | SWT | SWT-001 |
| UPS | UPS | UPS-001 |
| Projector | PROJ | PROJ-001 |
| Webcam | WEB | WEB-001 |
| Headset | HED | HED-001 |
| Mobile | MOB | MOB-001 |
| Tablet | TAB | TAB-001 |
| Other | IT-OTH | IT-OTH-001 |

### **Non-IT Assets**
| Sub Type | Prefix | Example |
|----------|--------|---------|
| Chair | CHR | CHR-001 |
| Desk | DES | DES-001 |
| Cupboard | CUP | CUP-001 |
| Whiteboard | WHI | WHI-001 |
| Shelf | SHF | SHF-001 |
| Cabinet | CAB | CAB-001 |
| Table | TBL | TBL-001 |
| Sofa | SOF | SOF-001 |
| Fan | FAN | FAN-001 |
| Lamp | LAM | LAM-001 |
| Other | NIT-OTH | NIT-OTH-001 |

---

## 🎓 Training Summary

**Key Concept:** Asset Tags are automatically generated by the system when you select Category and Sub Type. You don't need to enter them manually.

**Benefits:**
- Faster asset creation (no tag entry)
- Prevents duplicate tags
- Consistent naming
- Sequential organization
- Unique identification

**Process:**
1. Open Add Asset form
2. Select Category
3. Select Sub Type
4. Asset Tag auto-fills ✅
5. Fill other fields
6. Create Asset
7. Done! ✅

**That's it!** The system handles tag generation automatically.

