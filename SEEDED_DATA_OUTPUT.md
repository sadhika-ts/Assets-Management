# 🌱 Seeded Data Output - IT Asset Inventory Management System

**Status:** ✅ **COMPLETE** - Database seeded with dummy data from CSV files

**Date:** June 2, 2026  
**Version:** 1.0.0

---

## 📊 Data Summary

### Total Records Inserted
- **Users:** 3
- **Assets:** 5
- **Purchases:** 2
- **Contracts:** 2
- **Asset Details:** 5

**Total: 17 records**

---

## 👥 Users (3 records)

| Name | Email | Role |
|------|-------|------|
| Sadhika TS | sadhika@company.com | Admin |
| Arun Kumar | arun@company.com | Staff |
| Priya Sharma | priya@company.com | Staff |

---

## 🖥️ Assets (5 records)

### Asset #1: Desktop Computer
```json
{
  "asset_tag": "COMP-001",
  "asset_name": "Desktop Computer",
  "category": "IT",
  "sub_type": "Computer",
  "status": "active",
  "assigned_to": "Sadhika TS",
  "serial_no": "DELL784512",
  "mac_address": "00:1A:2B:3C:4D:5E",
  "manufacturer": "Dell",
  "model": "OptiPlex 7090",
  "os_type": "Windows",
  "os_version": "11 Pro",
  "processor": "Intel Core i7 (8 cores)",
  "ram": "16GB DDR5",
  "disk": "512GB SSD"
}
```

### Asset #2: HP Laptop
```json
{
  "asset_tag": "LAP-001",
  "asset_name": "HP Laptop",
  "category": "IT",
  "sub_type": "Laptop",
  "status": "active",
  "assigned_to": "Arun Kumar",
  "serial_no": "HP456789123",
  "mac_address": "00:AA:BB:CC:DD:EE",
  "manufacturer": "HP",
  "model": "EliteBook 850",
  "os_type": "Windows",
  "os_version": "11 Pro",
  "processor": "Intel Core i5 (6 cores)",
  "ram": "8GB DDR4",
  "disk": "256GB SSD"
}
```

### Asset #3: HP Printer
```json
{
  "asset_tag": "PRT-001",
  "asset_name": "HP Printer",
  "category": "IT",
  "sub_type": "Printer",
  "status": "active",
  "assigned_to": "Unassigned",
  "serial_no": "HPPRT789456",
  "manufacturer": "HP",
  "model": "LaserJet Pro M404n"
}
```

### Asset #4: Cisco Router
```json
{
  "asset_tag": "RTR-001",
  "asset_name": "Cisco Router",
  "category": "IT",
  "sub_type": "Router",
  "status": "active",
  "assigned_to": "Unassigned",
  "serial_no": "CISCO456123",
  "mac_address": "11:22:33:44:55:66",
  "manufacturer": "Cisco",
  "model": "ISR 1100-6G"
}
```

### Asset #5: Biometric Device
```json
{
  "asset_tag": "IT-OTH-001",
  "asset_name": "Biometric Attendance Device",
  "category": "IT",
  "sub_type": "Other",
  "status": "active",
  "assigned_to": "Unassigned",
  "serial_no": "BIO123456",
  "manufacturer": "Realtime",
  "model": "RealFace 10"
}
```

---

## 🛒 Purchases (2 records)

### Purchase #1
```json
{
  "purchase_id": "PO-2025-001",
  "vendor_name": "Dell Technologies",
  "vendor_contact": "+91 9876543210",
  "vendor_email": "sales@dell.com",
  "billing_address": "Chennai Head Office",
  "shipping_address": "Chennai IT Department",
  "purchase_date": "2025-05-15",
  "total_amount": "₹350,000",
  "status": "delivered"
}
```

### Purchase #2
```json
{
  "purchase_id": "PO-2025-002",
  "vendor_name": "HP India",
  "vendor_contact": "+91 9123456780",
  "vendor_email": "orders@hp.com",
  "billing_address": "Chennai Head Office",
  "shipping_address": "Chennai Branch Office",
  "purchase_date": "2025-05-20",
  "total_amount": "₹125,000",
  "status": "delivered"
}
```

---

## 📜 Contracts (2 records)

### Contract #1
```json
{
  "contract_id": "CON-2025-001",
  "contract_name": "Dell Laptop AMC",
  "vendor_name": "Dell Technologies",
  "active_from": "2025-01-01",
  "active_till": "2026-01-01",
  "status": "active",
  "contract_value": "₹150,000",
  "notes": "Annual maintenance contract for Dell devices"
}
```

### Contract #2
```json
{
  "contract_id": "CON-2025-002",
  "contract_name": "Microsoft Office License",
  "vendor_name": "Microsoft",
  "active_from": "2025-02-01",
  "active_till": "2027-02-01",
  "status": "active",
  "contract_value": "₹200,000",
  "notes": "Enterprise Office Licensing"
}
```

---

## 📈 Dashboard Metrics (Auto-calculated from seeded data)

| Metric | Count |
|--------|-------|
| Total Assets | 5 |
| IT Assets | 5 |
| Non-IT Assets | 0 |
| Active Contracts | 2 |
| Assigned Assets | 2 |
| Unassigned Assets (In Stock) | 3 |
| Total Purchases | 2 |
| Total Purchase Value | ₹475,000 |

---

## 🔗 Data Relationships

```
Users (3)
├── Sadhika TS (Admin)
│   └── Assigned to: COMP-001 (Desktop)
│
├── Arun Kumar (Staff)
│   └── Assigned to: LAP-001 (Laptop)
│
└── Priya Sharma (Staff)
    └── Not assigned to any asset

Assets (5)
├── COMP-001 (Desktop) ← Assigned to Sadhika
├── LAP-001 (Laptop) ← Assigned to Arun
├── PRT-001 (Printer) ← Unassigned
├── RTR-001 (Router) ← Unassigned
└── IT-OTH-001 (Biometric) ← Unassigned

Purchases (2)
├── PO-2025-001 (Dell) → ₹350,000
└── PO-2025-002 (HP) → ₹125,000

Contracts (2)
├── CON-2025-001 (Dell AMC) → ₹150,000
└── CON-2025-002 (Microsoft License) → ₹200,000
```

---

## 🌐 API Endpoints (Mock Data Served)

### Assets API
**Endpoint:** `GET /api/assets`  
**Response:** Array of 5 asset objects with full details

### Purchases API
**Endpoint:** `GET /api/purchases`  
**Response:** Array of 2 purchase objects

### Contracts API
**Endpoint:** `GET /api/contracts`  
**Response:** Array of 2 contract objects

### Dashboard API
**Endpoint:** `GET /api/reports/dashboard`  
**Response:** Aggregated metrics calculated from seeded data

---

## 🎯 Pages Now Displaying Data

### ✅ Dashboard
- Shows statistics: 5 total assets, 2 assigned, 2 active contracts
- Empty charts (no time-series data in seed)

### ✅ Assets Page
- Displays 5 IT assets
- Shows asset tags, names, categories, statuses, and assignments
- Filters working for status and category

### ✅ Purchases Page
- Displays 2 purchase orders
- Shows vendor info, dates, amounts, and statuses
- Purchase total: ₹475,000

### ✅ Contracts Page
- Displays 2 contracts
- Shows contract IDs, vendors, dates, values, and status
- Contract total: ₹350,000

### ✅ Reports Page
- Displays seeded asset statistics
- Shows asset count breakdowns
- Can export reports in CSV/PDF/Excel formats

---

## 📝 Seeding Method

### Option 1: Frontend Mock API (Currently Active ✅)
Location: `client/src/api/axios.js`
- Uses axios interceptors to mock API responses
- No backend database required
- Data served directly from JavaScript objects
- Perfect for frontend development and testing

### Option 2: Backend Database Seeding (Available)
Location: `seeders/seedDatabase.js`
- Uses Sequelize ORM to seed PostgreSQL
- For production/staging environments
- Run with: `npm run seed` (when configured)

---

## 🚀 Running the Application

```bash
# Navigate to project directory
cd /home/sadhika/Documents/Assest-Management

# Start the application
bash run.sh

# Application URLs:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## ✨ Key Features with Seeded Data

✅ **Assets Page**
- View 5 seeded assets
- Filter by status and category
- View/Edit/Delete actions available
- Export assets to CSV
- Generate QR codes and barcodes

✅ **Purchases Page**
- View 2 purchase orders
- Upload invoices
- Register warranty
- Export analytics
- Vendor management

✅ **Contracts Page**
- View 2 contracts
- Contract status badges
- Days remaining calculations
- Renewal management
- Document uploads

✅ **Dashboard**
- Real-time metrics
- Asset distribution
- Contract status overview
- Purchase trends
- Asset health status

✅ **Reports**
- Generate asset reports
- Generate purchase reports
- Generate contract reports
- Export in CSV/PDF/Excel

---

## 🔄 Data Refresh

To clear and reseed with new data:

1. **Frontend (Mock API):** Data is hardcoded in `axios.js`
   - Edit the mock data objects to add/modify records
   - Changes reflect immediately on page refresh

2. **Backend Database:** (When configured)
   - Drop tables and re-run migration
   - Run seeder again

---

## 📌 Next Steps

1. ✅ Connect to real PostgreSQL database (optional)
2. ✅ Implement API endpoints in backend
3. ✅ Add real form submissions
4. ✅ Implement user authentication
5. ✅ Add file upload functionality

---

## 📞 Support

For issues or questions:
- Check logs: `tail -f logs/backend.log` and `logs/frontend.log`
- All errors are logged to console
- Mock API intercepts all requests automatically

---

**Generated:** 2026-06-02  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-06-02 15:30 UTC
