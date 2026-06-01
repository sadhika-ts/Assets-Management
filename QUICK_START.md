# Quick Start Guide - 5 Minutes

Get the IT Asset Inventory System running in 5 steps.

## Step 1: Install Dependencies (1 min)
```bash
npm install
```

## Step 2: Configure Environment (1 min)
```bash
cp .env.example .env
```

**Edit `.env`** - Update these 3 lines with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Step 3: Create Database (1 min)
```bash
createdb asset_inventory_db
```

## Step 4: Setup Database (1 min)
```bash
# Create all tables
npm run db:sync

# Populate with sample data
npm run db:seed
```

## Step 5: Start Server (1 min)
```bash
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
✅ Server is running on port 5000
```

---

## Test It's Working

```bash
curl http://localhost:5000/api/health
```

**Should return:**
```json
{
  "message": "Server is running",
  "timestamp": "2024-03-15T10:30:45.123Z"
}
```

✅ **You're done!** Server is running with 5 sample assets loaded.

---

## What Was Created

### 6 Sequelize Models
- **User** - System users (admin, staff, viewer)
- **Asset** - Asset inventory items
- **AssetDetail** - Detailed IT specs (one-to-one with Asset)
- **Purchase** - Purchase orders
- **Contract** - Service contracts
- **AuditLog** - Change audit trail

### 6 Database Tables
- users
- assets
- asset_details
- purchases
- contracts
- audit_logs

### Sample Data
- 4 Users (1 admin, 2 staff, 1 viewer)
- 5 Assets (laptops, desktop, monitor, printer)
- 2 Purchases
- 3 Contracts
- 2 Audit logs

---

## Common Commands

```bash
npm run dev              # Start with auto-reload
npm run db:sync         # Create/update tables
npm run db:sync:fresh   # Drop and recreate tables
npm run db:seed         # Add sample data
npm run db:setup        # Sync + seed
npm start               # Production start
```

---

## Next Steps

1. **Read the docs:**
   - [MODELS_SUMMARY.md](MODELS_SUMMARY.md) - Quick model reference
   - [MODELS.md](MODELS.md) - Detailed model documentation
   - [SETUP.md](SETUP.md) - Complete setup guide

2. **Implement API endpoints:**
   - `/routes/auth.js` - Authentication
   - `/routes/assets.js` - Asset CRUD
   - `/routes/purchases.js` - Purchase management
   - `/routes/contracts.js` - Contract management
   - `/routes/reports.js` - Analytics

3. **Test with Postman/Insomnia:**
   - GET http://localhost:5000/api/health

---

## Troubleshooting

**PostgreSQL connection error?**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check database was created
createdb asset_inventory_db
```

**Port 5000 already in use?**
```bash
# Edit .env
PORT=5001
```

**Database errors?**
```bash
# Fresh reset
npm run db:sync:fresh
npm run db:seed
```

---

## Project Structure
```
├── models/              # 6 Sequelize models
├── config/db.js         # Database config
├── scripts/
│   ├── syncDb.js        # Create tables
│   └── seedDb.js        # Add sample data
├── server.js            # Express entry point
├── package.json         # Dependencies
└── .env                 # Your config (create from .env.example)
```

---

## Sample Database Queries

**Get all active assets:**
```javascript
const assets = await Asset.findAll({
  where: { status: 'active' }
});
```

**Get asset with all details:**
```javascript
const asset = await Asset.findByPk(assetId, {
  include: ['purchase', 'assignedUser', 'detail', 'auditLogs']
});
```

**Get user's assets:**
```javascript
const assets = await Asset.findAll({
  where: { assigned_to: userId },
  include: ['detail']
});
```

**Get asset history:**
```javascript
const history = await AuditLog.findAll({
  where: { asset_id: assetId },
  order: [['changed_at', 'DESC']]
});
```

---

## API Endpoints Ready to Implement

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check ✅ |
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/assets` | GET | List assets |
| `/api/assets` | POST | Create asset |
| `/api/assets/:id` | GET | Get asset details |
| `/api/assets/:id` | PUT | Update asset |
| `/api/assets/:id` | DELETE | Delete asset |
| `/api/purchases` | GET | List purchases |
| `/api/purchases` | POST | Create purchase |
| `/api/contracts` | GET | List contracts |
| `/api/contracts` | POST | Create contract |

---

## Login Credentials (Sample Data)

After running `npm run db:seed`, you can use these to test:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | password123 | admin |
| john.doe@company.com | password123 | staff |
| jane.smith@company.com | password123 | staff |
| viewer@company.com | password123 | viewer |

---

## File Locations

| File | Purpose |
|------|---------|
| `models/User.js` | User model with roles |
| `models/Asset.js` | Core asset model |
| `models/AssetDetail.js` | IT specifications |
| `models/Purchase.js` | Purchase orders |
| `models/Contract.js` | Service contracts |
| `models/AuditLog.js` | Change history |
| `models/index.js` | Model initialization |
| `scripts/syncDb.js` | Create database tables |
| `scripts/seedDb.js` | Add sample data |
| `config/db.js` | Sequelize config |
| `MODELS_SUMMARY.md` | Quick model reference |
| `MODELS.md` | Detailed documentation |
| `SETUP.md` | Complete setup guide |

---

**Ready to build APIs! 🚀**

For detailed docs, see [MODELS_SUMMARY.md](MODELS_SUMMARY.md)
