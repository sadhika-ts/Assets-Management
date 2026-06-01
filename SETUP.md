# Setup Guide - IT Asset Inventory Management System

Complete step-by-step guide to get the system running.

## Prerequisites

- Node.js v14+ and npm
- PostgreSQL 12+ installed and running
- Git (optional)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **express** - Web framework
- **sequelize** - ORM for PostgreSQL
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT auth
- **bcryptjs** - Password hashing
- **cors** - Cross-origin support
- **dotenv** - Environment variables
- **nodemon** - Dev auto-reload

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_inventory_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

### 3. Create PostgreSQL Database

```bash
# Option 1: Using psql
createdb asset_inventory_db

# Option 2: Using pgAdmin or another tool
CREATE DATABASE asset_inventory_db;
```

### 4. Sync Database Schema

Creates all tables based on Sequelize models:

```bash
npm run db:sync
```

**Output:**
```
🔄 Syncing database...
✅ Database connected successfully
✅ Database synchronized successfully

Tables created:
  - users
  - purchases
  - assets
  - asset_details
  - contracts
  - audit_logs
```

### 5. Seed Sample Data (Optional)

Populates database with 5 sample assets and test data:

```bash
npm run db:seed
```

**Sample Data:**
- 4 Users (1 admin, 2 staff, 1 viewer)
- 2 Purchases
- 5 Assets (laptops, desktop, monitor, printer, disposed)
- 3 Contracts
- 2 Audit logs

### 6. Start Development Server

```bash
npm run dev
```

Server will start on: **http://localhost:5000**

```
✅ Database connected successfully
✅ Server is running on port 5000
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload (development) |
| `npm run db:sync` | Create/sync all database tables |
| `npm run db:sync:fresh` | Drop and recreate all tables (development only) |
| `npm run db:seed` | Populate database with sample data |
| `npm run db:setup` | Sync + seed in one command |

---

## Database Schema

### Tables Created

1. **users** - System users with roles (admin, staff, viewer)
2. **purchases** - Purchase orders and vendor info
3. **assets** - Core asset inventory items
4. **asset_details** - Detailed specs for IT assets (OS, RAM, CPU, etc.)
5. **contracts** - Service and support contracts
6. **audit_logs** - Change history and audit trail

### Key Relationships

```
User (1) ──→ (Many) Asset (assigned_to)
Purchase (1) ──→ (Many) Asset
Asset (1) ──→ (1) AssetDetail
Asset (1) ──→ (Many) AuditLog
```

---

## Sample Data Overview

### Users
```
Email                     Role      Password
────────────────────────  ────────  ────────────
admin@company.com         admin     password123
john.doe@company.com      staff     password123
jane.smith@company.com    staff     password123
viewer@company.com        viewer    password123
```

### Assets
| Asset Tag | Type | Sub Type | Status | Assigned To |
|-----------|------|----------|--------|-------------|
| AST-2024-001 | IT | Laptop | active | John Doe |
| AST-2024-002 | IT | Desktop | active | Jane Smith |
| AST-2024-003 | IT | Monitor | active | John Doe |
| AST-2024-004 | Non-IT | Printer | active | (unassigned) |
| AST-2024-005 | IT | Laptop | disposed | (unassigned) |

### Purchases
| Purchase ID | Vendor | Total | Status |
|-------------|--------|-------|--------|
| PO-2024-001 | Dell Technologies | $5,500.00 | completed |
| PO-2024-002 | HP Inc. | $3,200.00 | completed |

### Contracts
| Contract ID | Name | Vendor | Status |
|-------------|------|--------|--------|
| CT-2024-001 | Dell Hardware Support | Dell Technologies | active |
| CT-2024-002 | Microsoft Office 365 | Microsoft | active |
| CT-2024-003 | HP Printer Support | HP Inc. | expired |

---

## Troubleshooting

### PostgreSQL Connection Error
**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Ensure PostgreSQL is running
2. Check .env database credentials
3. Verify database exists: `psql -l`

### Database Sync Errors
**Error:** `Column already exists`

**Solutions:**
```bash
# Fresh start (development only)
npm run db:sync:fresh
npm run db:seed
```

### Port Already in Use
**Error:** `listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Change port in .env
PORT=5001

# Or kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### Foreign Key Constraint Error
**Error:** `foreign key constraint violated`

**Solutions:**
- Ensure parent records exist before creating child records
- Users must exist before assigning assets
- Purchases must exist before linking assets

---

## Project Structure

```
├── config/
│   └── db.js                 # Sequelize PostgreSQL connection
├── models/
│   ├── index.js              # Model initialization & associations
│   ├── User.js               # User model
│   ├── Asset.js              # Asset model
│   ├── AssetDetail.js        # Detailed asset specs
│   ├── Purchase.js           # Purchase/transaction
│   ├── Contract.js           # Service contracts
│   └── AuditLog.js           # Change audit trail
├── routes/
│   ├── auth.js               # Authentication (to implement)
│   ├── assets.js             # Asset CRUD (to implement)
│   ├── purchases.js          # Purchase management (to implement)
│   ├── contracts.js          # Contract management (to implement)
│   └── reports.js            # Analytics (to implement)
├── middleware/
│   └── auth.js               # JWT verification & role checks
├── scripts/
│   ├── syncDb.js             # Database table creation
│   ├── seedDb.js             # Sample data population
│   └── initDb.js             # Legacy initialization
├── server.js                 # Express entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .env                      # Your environment config (create from example)
├── README.md                 # Overview documentation
├── MODELS.md                 # Detailed model documentation
└── SETUP.md                  # This file
```

---

## Next Steps

1. **Implement Authentication Routes** (`/api/auth`)
   - POST /register - Register new user
   - POST /login - Login and receive JWT
   - POST /logout - Logout

2. **Implement Asset Routes** (`/api/assets`)
   - GET / - List all assets
   - POST / - Create asset
   - PUT /:id - Update asset
   - DELETE /:id - Delete asset
   - GET /:id - Get asset details

3. **Implement Purchase Routes** (`/api/purchases`)
   - CRUD operations for purchases

4. **Implement Contract Routes** (`/api/contracts`)
   - CRUD operations for contracts

5. **Implement Report Routes** (`/api/reports`)
   - Asset inventory reports
   - Depreciation analysis
   - Contract alerts

6. **Add Frontend**
   - Build React or Vue dashboard
   - Connect to API endpoints

---

## Development Workflow

```bash
# 1. Start development server (auto-reloads on file changes)
npm run dev

# 2. Make code changes
# (nodemon will auto-restart)

# 3. Test with API tool (Postman, Insomnia, curl)
curl http://localhost:5000/api/health

# 4. Commit changes
git add .
git commit -m "Add asset endpoints"

# 5. Deploy to production
npm start
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
DB_NAME=asset_inventory_db
```

### Production
```env
NODE_ENV=production
JWT_SECRET=production_secret_key_with_high_entropy
DB_HOST=production_db_host
DB_NAME=asset_inventory_prod
```

---

## Quick Reset

Reset database to fresh state (development only):

```bash
# Drop and recreate all tables
npm run db:sync:fresh

# Repopulate with sample data
npm run db:seed
```

---

## API Health Check

Verify server is running:

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "message": "Server is running",
  "timestamp": "2024-03-15T10:30:45.123Z"
}
```

---

## Support

For detailed model documentation, see [MODELS.md](MODELS.md)

For API endpoints, see [README.md](README.md)

---

**Happy coding! 🚀**
