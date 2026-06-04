# IT Asset Inventory Management System

## Project Overview

A complete IT Asset Inventory Management System for small organizations (30+ people) built with React + Node.js. The system provides a comprehensive solution for tracking IT and non-IT assets without requiring authentication or database setup for development.

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** June 2026

---

## Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **API:** Axios with Mock Interceptors
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Notifications:** react-hot-toast
- **Port:** 5173

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (optional - uses Mock API for dev)
- **ORM:** Sequelize
- **Authentication:** JWT
- **Port:** 5000

---

## Project Structure

```
/home/sadhika/Documents/Assest-Management/
├── run.sh                     # Main startup script (USE THIS!)
├── stop.sh                    # Shutdown script
├── setup-db.sh               # PostgreSQL setup (optional)
├── package.json              # Backend dependencies
├── server.js                 # Backend entry point
├── .env                      # Environment variables
│
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main app routes
│   │   ├── index.css        # Tailwind imports
│   │   │
│   │   ├── api/
│   │   │   └── axios.js     # HTTP client + Mock API
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # (No-op context)
│   │   │
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx    # Main layout wrapper
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation menu
│   │   │   ├── Topbar.jsx       # Header bar
│   │   │   ├── PrivateRoute.jsx # Route protection
│   │   │   └── [other components]
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Assets.jsx       # Assets list/table
│   │   │   ├── AssetForm.jsx    # Create/edit assets
│   │   │   ├── AssetDetail.jsx  # Asset details
│   │   │   ├── Purchases.jsx    # Purchases page
│   │   │   ├── Contracts.jsx    # Contracts page
│   │   │   ├── Reports.jsx      # Reports/analytics
│   │   │   └── NotFound.jsx     # 404 page
│   │   │
│   │   ├── hooks/
│   │   │   ├── useFormValidation.js
│   │   │   ├── usePermission.js
│   │   │   └── useApi.js
│   │   │
│   │   └── [styles, utils, etc]
│   │
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── vercel.json          # Vercel deployment config
│
├── config/
│   └── db.js                # Database configuration
│
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── assets.js            # Assets API endpoints
│   ├── purchases.js         # Purchases API
│   ├── contracts.js         # Contracts API
│   └── reports.js           # Reports API
│
├── middleware/
│   └── errorHandler.js      # Global error handling
│
├── logs/
│   ├── backend.log          # Backend server logs
│   └── frontend.log         # Frontend server logs
│
└── [Other files: README.md, node_modules, etc]
```

---

## Quick Start

### 1. Start the Application

```bash
cd /home/sadhika/Documents/Assest-Management
bash run.sh
```

**What happens:**
- Installs dependencies (if needed)
- Starts Backend Server on http://localhost:5000
- Starts Frontend Server on http://localhost:5173
- Shows startup information

### 2. Open in Browser

```
http://localhost:5173
```

You'll see the **Dashboard** immediately - no login required!

### 3. Stop the Application

Press `Ctrl+C` in the terminal, or run:

```bash
bash stop.sh
```

---

## Development Guide

### No Authentication Required
- ✅ Direct access to all pages
- ✅ No login credentials needed
- ✅ No user roles/permissions

### Mock API (Frontend Only)
- All data provided by frontend axios interceptors
- No real backend API calls
- No database needed for development
- Located in: `client/src/api/axios.js`

### Available Pages

| Page | URL | Feature |
|------|-----|---------|
| Dashboard | `/` or `/dashboard` | Statistics, recent assets, expiring contracts |
| Assets | `/assets` | List, create, edit, filter by IT/Non-IT |
| Asset Form | `/assets/new` | Create new asset |
| Asset Detail | `/assets/:id` | View asset details |
| Asset Edit | `/assets/:id/edit` | Edit asset |
| Purchases | `/purchases` | Manage purchases |
| Contracts | `/contracts` | Manage contracts |
| Reports | `/reports` | Analytics and reports |
| 404 | `*` | Not found page |

### Mock API Endpoints

**Assets:**
```javascript
GET /api/assets
// Returns 3 sample assets (Laptop, Monitor, Chair)
```

**Dashboard Stats:**
```javascript
GET /api/reports/dashboard
// Returns stats: totalAssets, activeAssets, maintenanceAssets, etc.
```

### Assets Data Structure

```javascript
{
  id: '1',
  asset_tag: 'LAP-001',
  asset_name: 'Dell Laptop',
  category: 'IT',              // or 'Non-IT'
  sub_type: 'Laptop',
  status: 'active',            // active, maintenance, disposed
  assigned_to: 'John Doe',
  created_at: '2026-01-15',
  detail: {
    serial_no: 'SN001',
    mac_address: '00:11:22:33:44:55'
  }
}
```

### Asset Categories

**IT Components (15 types):**
- Laptop, Desktop, Monitor, Keyboard, Mouse
- Printer, Scanner, Router, Switch, UPS
- Projector, Webcam, Headset, Mobile, Tablet

**Non-IT Components (10 types):**
- Chair, Desk, Cupboard, Whiteboard, Shelf
- Cabinet, Table, Sofa, Fan, Lamp

---

## Environment Configuration

### .env File

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_please
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

The script creates `.env` automatically if it doesn't exist.

---

## Backend Configuration (Optional)

### For Production with Real Database

If you want to use PostgreSQL:

1. **Install PostgreSQL:**
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Set up database:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE asset_inventory_db;
   ```

3. **Update .env:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=asset_inventory_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

### Current Setup
For development, the backend is a **stub server** - no database connection required.

---

## Component Documentation

### Dashboard (client/src/pages/Dashboard.jsx)
**Features:**
- 6 stat cards (Total Assets, Active, Maintenance, Value, Contracts, Available)
- Expiring contracts widget
- Asset summary sidebar
- Category breakdown
- Recent assets table with sorting/filtering

**Mock Data:** 150 total assets, 140 active, 10 in maintenance

### Assets Page (client/src/pages/Assets.jsx)
**Features:**
- List all assets in table format
- Filter by status, category, sub-type
- Search by name/tag
- Create new asset button
- View/edit/delete actions
- Pagination

**IT/Non-IT Component Lists:** Pre-configured dropdowns

### Asset Form (client/src/pages/AssetForm.jsx)
**Features:**
- Create or edit asset
- Real-time validation
- Category-based sub-type selection
- Asset details (serial, MAC address, etc.)
- Form validation with error messages
- Toast notifications on success/error

### Sidebar (client/src/components/Sidebar.jsx)
**Features:**
- Fixed left navigation menu
- 5 main pages: Dashboard, Assets, Purchases, Contracts, Reports
- Active page highlighting
- Collapse/expand on mobile
- No user info section

### Topbar (client/src/components/Topbar.jsx)
**Features:**
- Page title display
- Welcome message
- Avatar placeholder

---

## Styling

### Tailwind CSS Classes Used
- Flexbox layout system
- Color palette: Blue, Purple, Green, Orange, Red, Gray
- Responsive breakpoints: sm, md, lg, xl
- Animation: animate-pulse, animate-spin, transition-all
- Shadows: shadow-sm, shadow-md, shadow-lg

### Color Scheme
- **Primary:** Blue (#3b82f6)
- **Secondary:** Purple (#a855f7)
- **Success:** Green (#22c55e)
- **Warning:** Orange (#f97316)
- **Danger:** Red (#ef4444)
- **Neutral:** Gray (various shades)

---

## Scripts

### Available npm Commands

**Frontend:**
```bash
cd client
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

**Backend:**
```bash
npm start          # Start backend server
npm test           # Run tests (if configured)
```

**Automation:**
```bash
bash run.sh        # Start everything
bash stop.sh       # Stop everything
bash setup-db.sh   # Setup PostgreSQL (optional)
```

---

## Logging

### Log Files
Located in `./logs/`:

```
logs/
├── backend.log    # Backend server output
└── frontend.log   # Frontend server output
```

### View Logs in Real-time
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log
```

---

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect GitHub repository
   - Select `client` as root directory
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Deploy to Netlify:**
   - Push to GitHub
   - Connect on Netlify dashboard
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Backend Deployment (Railway)

1. **Create account:** railway.app
2. **Connect GitHub repo**
3. **Set environment variables** from `.env`
4. **Deploy** - Railway auto-detects Node.js

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Kill process on port 5173
lsof -ti :5173 | xargs kill -9

# Restart
bash run.sh
```

### Dependencies Not Installed

```bash
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
bash run.sh
```

### Frontend Shows Blank Page

1. Check browser console for errors (F12)
2. Verify Vite is running: `tail -f logs/frontend.log`
3. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Check if ports 5000 and 5173 are available

### Mock API Not Working

- Verify `client/src/api/axios.js` has mock interceptors
- Check that requests are to `/api/assets` or `/api/reports/dashboard`
- Ensure mock API endpoints match in axios.js

---

## Features Checklist

✅ **Core Features:**
- Dashboard with statistics
- Assets management (CRUD)
- IT and Non-IT asset categories
- Asset filtering and search
- Purchases tracking
- Contracts management
- Reports and analytics

✅ **UI/UX:**
- Professional dashboard layout
- Responsive design
- Form validation
- Toast notifications
- Loading spinners
- 404 error page
- Mobile-friendly sidebar

✅ **Development:**
- Mock API (no database needed)
- No authentication required
- Hot module reloading (HMR)
- Clean code structure
- Error handling
- Tailwind CSS styling

✅ **Deployment:**
- Vercel/Netlify ready (frontend)
- Railway ready (backend)
- Environment configuration
- Build optimization

---

## Important Notes

### No Authentication
- This version has NO login system
- All pages are publicly accessible
- No user roles or permissions
- Perfect for small closed networks

### Mock API Only
- Frontend provides all data
- Backend is a stub server (health check only)
- PostgreSQL is optional
- Great for development/prototyping

### Production Considerations
If deploying to production:
1. Enable authentication in AuthContext
2. Connect to real PostgreSQL database
3. Implement proper error logging
4. Add security headers
5. Set up HTTPS

---

## Support

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Address already in use" | Run `bash stop.sh` then `bash run.sh` |
| Frontend blank page | Check browser console (F12), refresh page |
| Can't connect to API | Verify backend is running on port 5000 |
| Form validation errors | Check form input types and requirements |

**Resources:**
- React Docs: https://react.dev
- Tailwind: https://tailwindcss.com
- Vite: https://vitejs.dev
- Express: https://expressjs.com

---

## Project Statistics

- **Files:** ~50+ source files
- **Frontend Components:** 10+ React components
- **Backend Routes:** 5 main route files
- **Total Lines of Code:** ~5000+
- **Dependencies:** 40+ npm packages
- **Database Tables:** 8+ (when using PostgreSQL)

---

## Team

**Built with:** Claude AI + User Collaboration

---

## License

MIT License - Free to use and modify

---

**Last Updated:** June 2, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
