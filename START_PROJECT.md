# 🚀 IT Asset Inventory Management System - Quick Start

## System Requirements
- Node.js v18+ 
- npm v9+
- PostgreSQL (or SQLite for development)

## ✅ Current Status
- ✅ Backend API fully built (Express.js + Sequelize)
- ✅ Frontend React app with all pages
- ✅ Database models and migrations
- ✅ Authentication system
- ✅ All API endpoints implemented

---

## 🔧 STEP 1: Backend Setup (Terminal 1)

```bash
cd /home/sadhika/Documents/Assest-Management

# Install dependencies
npm install

# Setup database (creates tables and seeds sample data)
npm run db:setup

# Start backend server (runs on port 5000)
npm run dev
```

**Expected Output:**
```
✅ Backend server running on http://localhost:5000
✅ Database synced and seeded
```

---

## 🎨 STEP 2: Frontend Setup (Terminal 2)

```bash
cd /home/sadhika/Documents/Assest-Management/client

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev
```

**Expected Output:**
```
✅ Frontend running on http://localhost:5173
```

---

## 🌐 Access the Application

**URL:** http://localhost:5173

---

## 👤 Login Credentials

Use any of these accounts to test different user roles:

### Admin Account (Full Access)
- **Email:** `admin@company.com`
- **Password:** `password123`
- **Permissions:** Create, Edit, Delete all resources

### Staff Account (Limited Access)
- **Email:** `john.doe@company.com`
- **Password:** `password123`
- **Permissions:** Create, Edit (but cannot Delete)

### Viewer Account (Read-Only)
- **Email:** `viewer@company.com`
- **Password:** `password123`
- **Permissions:** View only (no Create, Edit, Delete)

---

## 📋 Pages & Features

### 1. **Dashboard** (`/dashboard`)
   - 6 stat cards (clickable, shows filtered assets)
   - Expiring contracts banner
   - Quick stats sidebar
   - Recent assets table
   - Loading skeletons

### 2. **Assets** (`/assets`)
   - Table view with 20 items per page
   - Search (serial no, asset tag)
   - Filter by: Category, Sub Type, Status
   - Add/Edit/Delete (admin/staff only)
   - Click row to view details

### 3. **Asset Detail** (`/assets/:id`)
   - Full asset information
   - Basic info card
   - Technical details (IT assets only)
   - Activation status badges
   - Software list as pills
   - Audit history table
   - Assign button (reassign to user)
   - Print-friendly layout

### 4. **Asset Form** (`/assets/new`, `/assets/:id/edit`)
   - Basic info section (Asset Tag, Category, Sub Type, Serial No, MAC, Status, Purchase, Assigned To)
   - Technical details section (OS Type, Processor, RAM, Disk, MS Office, Software List, etc.)
   - Form validation with inline error messages
   - Success toast on save

### 5. **Purchases** (`/purchases`)
   - Expandable rows showing linked assets
   - Filter by vendor name and date range
   - Add/Edit/Delete purchases (admin only)
   - Purchase status badges

### 6. **Contracts** (`/contracts`)
   - Status badges (Green=Active, Blue=Upcoming, Red=Expired)
   - "Expiring Soon" banner (30-day warning)
   - Filter by status
   - Add/Edit/Delete contracts (admin only)

### 7. **Reports** (`/reports`)
   - **Assets by Sub Type** - Bar chart
   - **OS Activation Status** - Pie chart
   - **MS Office Status** - Pie chart
   - **Asset Status Breakdown** - Bar chart (colored by status)
   - **Audit Log Table** - Last 50 changes
   - Export buttons:
     - "Export All Assets CSV"
     - "Export Audit Log CSV"

---

## 🎯 Test Workflow

1. **Login** with admin@company.com
2. **View Dashboard** - See overview stats
3. **Go to Assets** - Browse, search, filter
4. **Create Asset** - Click "+ Add Asset" button
5. **View Details** - Click any asset row
6. **Edit Asset** - Click "Edit" button
7. **Explore Purchases** - View and expand
8. **Check Contracts** - See expiring soon banner
9. **Generate Reports** - View charts and export CSV

---

## 📊 Sample Data

The database is automatically seeded with:
- 3 users (Admin, Staff, Viewer)
- 5 sample assets (IT & Non-IT)
- 2 purchases
- 2 contracts
- Audit logs

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Start again
npm run dev
```

### Frontend shows blank page
- Open DevTools (F12)
- Check Console for errors
- Make sure backend is running on port 5000
- Check .env file has `VITE_API_URL=http://localhost:5000/api`

### Database connection error
```bash
# Verify database is running
# Then try:
npm run db:sync:fresh
npm run db:seed
```

### Import errors in frontend
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 API Documentation

**Base URL:** `http://localhost:5000/api`

### Key Endpoints
- `POST /auth/login` - Login
- `GET /assets` - List assets (with filters)
- `POST /assets` - Create asset
- `GET /assets/:id` - Get asset details
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset
- `GET /assets/:id/audit-log` - Audit history
- `GET /purchases` - List purchases
- `GET /contracts` - List contracts
- `GET /reports/dashboard` - Dashboard stats
- `GET /reports/export` - Export assets CSV
- `GET /reports/audit-log` - Export audit log CSV

---

## ✨ Features Summary

| Feature | Admin | Staff | Viewer |
|---------|-------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Assets | ✅ | ✅ | ✅ |
| Create Asset | ✅ | ✅ | ❌ |
| Edit Asset | ✅ | ✅ | ❌ |
| Delete Asset | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ |
| Manage Purchases | ✅ | ❌ | ❌ |
| Manage Contracts | ✅ | ❌ | ❌ |

---

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile** (< 768px) - Stack layout
- **Tablet** (768px - 1024px) - 2-column grid
- **Desktop** (> 1024px) - Full layout

---

## 🚢 Production Build

```bash
# Frontend
cd client
npm run build
# Output in dist/ folder

# Deploy to Netlify/Vercel or serve with nginx
```

---

## 📞 Support

For issues, check:
1. Backend logs in Terminal 1
2. Browser console (F12)
3. Network tab (F12 → Network)
4. Database connectivity

---

**Happy Testing! 🎉**
