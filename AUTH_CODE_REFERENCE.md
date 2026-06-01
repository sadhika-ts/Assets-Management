# Authentication Code Reference

Quick reference for authentication code snippets and implementation details.

---

## JWT Token Generation

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

---

## Password Hashing

```javascript
const bcrypt = require('bcryptjs');

// When registering
const password_hash = bcrypt.hashSync(password, 10);

// When logging in
const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
```

---

## Register Endpoint

```javascript
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await models.User.findOne({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered',
          message: 'This email is already associated with an account.'
        });
      }

      // Hash password
      const password_hash = bcrypt.hashSync(password, 10);

      // Create user
      const user = await models.User.create({
        name,
        email,
        password_hash,
        role: 'staff'
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }
);
```

---

## Login Endpoint

```javascript
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await models.User.findOne({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'No user found with this email address.'
        });
      }

      // Verify password
      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'The password you entered is incorrect.'
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }
);
```

---

## Get Me Endpoint (Protected)

```javascript
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'The authenticated user could not be found.'
      });
    }

    res.json({
      success: true,
      message: 'User information retrieved',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
      message: error.message
    });
  }
});
```

---

## verifyToken Middleware

```javascript
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
      message: 'Authorization token is missing. Please include Bearer token in headers.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please login again.'
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided token is invalid or malformed.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Failed to authenticate token',
        message: err.message
      });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
};
```

---

## requireRole Middleware

```javascript
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};
```

---

## Protected Route Examples

### Admin Only

```javascript
const { verifyToken, requireRole } = require('../middleware/auth');

router.delete(
  '/users/:id',
  verifyToken,
  requireRole('admin'),
  async (req, res) => {
    // Only admins can reach here
    const user = await User.findByPk(req.params.id);
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  }
);
```

### Admin or Staff

```javascript
router.post(
  '/assets',
  verifyToken,
  requireRole('admin', 'staff'),
  async (req, res) => {
    // Admins and staff can reach here
    const asset = await Asset.create(req.body);
    res.json({ success: true, data: { asset } });
  }
);
```

### Any Authenticated User

```javascript
router.post(
  '/assets/:id/assign',
  verifyToken,
  async (req, res) => {
    // Any logged-in user can reach here
    const asset = await Asset.findByPk(req.params.id);
    await asset.update({ assigned_to: req.user.id });
    res.json({ success: true, message: 'Asset assigned' });
  }
);
```

---

## Using req.user in Routes

```javascript
// After verifyToken middleware, req.user is available

router.get('/profile', verifyToken, (req, res) => {
  console.log(req.user.id);    // UUID
  console.log(req.user.name);  // "John Doe"
  console.log(req.user.email); // "john@company.com"
  console.log(req.user.role);  // "admin", "staff", or "viewer"
});
```

---

## Error Response Format

All authentication errors follow this format:

```json
{
  "success": false,
  "error": "Error type (short)",
  "message": "Detailed explanation for user"
}
```

Examples:

```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "No user found with this email address."
}
```

```json
{
  "success": false,
  "error": "Token expired",
  "message": "Your session has expired. Please login again."
}
```

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied. Required role(s): admin. Your role: staff"
}
```

---

## cURL Examples

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "SecurePassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "SecurePassword123"
  }'
```

### Get Me (with token)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## JWT Payload Structure

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  name: "John Doe",                            // User's name
  email: "john@company.com",                   // User's email
  role: "staff",                               // admin|staff|viewer
  iat: 1710489000,                             // Issued at (seconds)
  exp: 1711094000                              // Expires at (seconds)
}
```

Expiry calculation:
- **iat (issued at):** Current Unix timestamp
- **exp (expires at):** iat + 604800 seconds (7 days)

---

## Configuration in .env

```env
# JWT Configuration
JWT_SECRET=your_super_secret_key_min_32_chars_long
JWT_EXPIRE=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_inventory_db
DB_USER=postgres
DB_PASSWORD=your_db_password

# Server
PORT=5000
NODE_ENV=development
```

---

## Common Patterns

### Check if user is admin

```javascript
router.post('/admin-only', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
    // Admin-only logic
  } else {
    res.status(403).json({ error: 'Admin only' });
  }
});
```

### Check if user owns resource

```javascript
router.put('/assets/:id', verifyToken, async (req, res) => {
  const asset = await Asset.findByPk(req.params.id);
  
  if (asset.assigned_to !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Cannot modify others\' assets' });
  }
  
  await asset.update(req.body);
  res.json({ success: true });
});
```

### Log user action

```javascript
router.post('/assets/:id/assign', verifyToken, async (req, res) => {
  const asset = await Asset.findByPk(req.params.id);
  
  await AuditLog.create({
    asset_id: asset.id,
    user_id: req.user.id,
    action: 'Asset Assigned',
    old_value: JSON.stringify({ assigned_to: asset.assigned_to }),
    new_value: JSON.stringify({ assigned_to: req.body.assigned_to })
  });
  
  await asset.update({ assigned_to: req.body.assigned_to });
  res.json({ success: true });
});
```

---

## Environment Variable Validation

```javascript
// In server startup
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET not set in .env');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET is less than 32 characters');
}
```

---

## Token Debugging at jwt.io

1. Get token from login response
2. Copy full token
3. Go to https://jwt.io
4. Paste in "Encoded" section
5. View decoded payload
6. Verify: id, name, email, role, iat, exp
7. Check expiry date

---

## Production Checklist

```javascript
// Generate strong secret
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + secret);

// Store in .env:
// JWT_SECRET=<output-from-above>
```

---

## Testing Utilities

### Decode token to check claims

```javascript
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded);
// { id, name, email, role, iat, exp }
```

### Calculate token expiry

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const expireDate = new Date(decoded.exp * 1000);
console.log('Token expires at:', expireDate);
```

---

## File Locations

| File | Purpose |
|------|---------|
| `/routes/auth.js` | Register, login, get me endpoints |
| `/middleware/auth.js` | verifyToken, requireRole |
| `/.env` | JWT_SECRET configuration |
| `/models/User.js` | User model |

---

**Complete reference for authentication implementation! 🚀**
