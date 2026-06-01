# IT Asset Inventory Management System

A comprehensive backend system for managing IT assets in small organizations (30+ people).

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Features
- User authentication and authorization (Admin, Manager, User roles)
- Asset inventory management (laptops, desktops, phones, etc.)
- Purchase tracking and history
- Contract management with expiry alerts
- Asset history and audit trail
- Comprehensive reporting and analytics
- Role-based access control

## Project Structure

```
├── config/
│   └── db.js                 # Sequelize database configuration
├── middleware/
│   └── auth.js               # JWT verification and role-based access control
├── models/
│   ├── index.js              # Model initialization and associations
│   ├── User.js               # User model
│   ├── Asset.js              # Asset model
│   ├── Purchase.js           # Purchase/transaction model
│   ├── Contract.js           # Contract model
│   └── AssetHistory.js       # Audit trail model
├── routes/
│   ├── auth.js               # Authentication endpoints
│   ├── assets.js             # Asset CRUD and management
│   ├── purchases.js          # Purchase history and tracking
│   ├── contracts.js          # Contract management
│   └── reports.js            # Analytics and reporting
├── scripts/
│   └── initDb.js             # Database initialization script
├── server.js                 # Main server entry point
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   Edit `.env` with your database and server configuration:
   ```
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=asset_inventory_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_key
   ```

4. **Create PostgreSQL Database**
   ```bash
   createdb asset_inventory_db
   ```

5. **Initialize Database Schema**
   ```bash
   npm run db:init
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token

### Asset Routes (`/api/assets`)
- `GET /` - Get all assets (with filters)
- `GET /:id` - Get asset details
- `POST /` - Create new asset
- `PUT /:id` - Update asset
- `DELETE /:id` - Delete asset
- `POST /:id/assign` - Assign to user
- `POST /:id/unassign` - Unassign from user

### Purchase Routes (`/api/purchases`)
- `GET /` - Get all purchases
- `GET /:id` - Get purchase details
- `POST /` - Create new purchase
- `PUT /:id` - Update purchase
- `DELETE /:id` - Delete purchase

### Contract Routes (`/api/contracts`)
- `GET /` - Get all contracts
- `GET /:id` - Get contract details
- `POST /` - Create new contract
- `PUT /:id` - Update contract
- `DELETE /:id` - Delete contract

### Report Routes (`/api/reports`)
- `GET /inventory` - Inventory report
- `GET /depreciation` - Asset depreciation
- `GET /assigned` - Assets by user
- `GET /maintenance` - Maintenance schedules
- `GET /expiring-warranties` - Expiring warranties
- `GET /export` - Export data

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | asset_inventory_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |

## Models

### User
- Stores user information (admin, manager, user roles)
- Tracks department assignments
- Manages active status

### Asset
- Core inventory item (laptop, desktop, monitor, etc.)
- Tracks assignment, status, warranty
- Links to purchase and history

### Purchase
- Records purchase transactions
- Tracks vendor information
- Manages warranty details

### Contract
- Maintenance and support contracts
- Warranty and service agreements
- Lease information

### AssetHistory
- Audit trail for all asset changes
- Tracks who made changes and when
- Records previous and new values

## Database Schema

### Users Table
- id (UUID, PK)
- firstName, lastName, email
- password (bcrypted)
- role (admin/manager/user)
- department, isActive
- timestamps

### Assets Table
- id (UUID, PK)
- assetTag, assetName, assetType
- serialNumber, manufacturer, model
- purchaseDate, purchasePrice, warrantyExpiry
- status (active/inactive/repair/deprecated)
- assignedToId (FK to users)
- location, notes
- timestamps

### Purchases Table
- id (UUID, PK)
- assetId (FK to assets)
- vendorName, vendorContact
- purchaseDate, purchasePrice, quantity
- invoiceNumber, warranty
- timestamps

### Contracts Table
- id (UUID, PK)
- contractName, contractType
- vendor, vendorContact
- startDate, endDate, renewalDate
- value, status
- attachments (JSON)
- timestamps

### AssetHistory Table
- id (UUID, PK)
- assetId (FK to assets)
- userId (FK to users)
- action (created/updated/assigned/etc)
- previousValue, newValue (JSON)
- description
- createdAt

## Next Steps

1. **Implement Authentication**
   - Complete auth routes with user registration/login
   - Add password hashing with bcryptjs
   - Implement JWT token generation

2. **Implement CRUD Operations**
   - Complete asset management endpoints
   - Add purchase tracking
   - Implement contract management

3. **Add Validation**
   - Input validation using express-validator
   - Error handling middleware

4. **Implement Reports**
   - Asset inventory reports
   - Depreciation calculations
   - Warranty tracking
   - Export to CSV/PDF

5. **Add Testing**
   - Unit tests for models
   - Integration tests for routes
   - API testing

6. **Frontend Integration**
   - Build React frontend
   - Connect to API endpoints
   - Implement dashboard and forms

## Error Handling

The system includes:
- Global error handler middleware
- Validation error responses
- JWT authentication errors
- Database connection errors
- 404 route handler

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- CORS configuration
- Input validation (ready to implement)

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
Use Sequelize migrations for database schema changes (to be implemented)

## Troubleshooting

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists

**Port Already in Use**
- Change PORT in `.env`
- Or kill process using port 5000

**JWT Authentication Failed**
- Ensure JWT_SECRET is set in `.env`
- Check token format in Authorization header

## License

ISC
