# Authentication System Guide

Complete documentation for the JWT-based authentication system.

## Overview

The authentication system provides:
- User registration with email validation
- Password hashing with bcryptjs
- JWT token generation (7-day expiry)
- Token verification middleware
- Role-based access control (admin, staff, viewer)
- Protected routes with user context

---

## Endpoints

### POST /api/auth/register

Register a new user.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| name | String | Not empty | Yes |
| email | String | Valid email format | Yes |
| password | String | Minimum 6 characters | Yes |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

Email already exists (409 Conflict):
```json
{
  "success": false,
  "error": "Email already registered",
  "message": "This email is already associated with an account. Please login instead."
}
```

Validation errors (400 Bad Request):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

### POST /api/auth/login

Login with email and password.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| email | String | Yes |
| password | String | Yes |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

User not found (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "No user found with this email address."
}
```

Wrong password (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "The password you entered is incorrect."
}
```

---

### GET /api/auth/me

Get current authenticated user's information.

**Request (with Bearer token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User information retrieved",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "staff",
      "created_at": "2024-03-15T10:30:00Z"
    }
  }
}
```

**Error Responses:**

Missing token (401 Unauthorized):
```json
{
  "success": false,
  "error": "No token provided",
  "message": "Authorization token is missing. Please include Bearer token in headers."
}
```

Token expired (401 Unauthorized):
```json
{
  "success": false,
  "error": "Token expired",
  "message": "Your session has expired. Please login again."
}
```

Invalid token (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "The provided token is invalid or malformed."
}
```

---

## Middleware

### verifyToken

Verifies JWT token from Authorization header and attaches user to request.

**Usage:**
```javascript
const { verifyToken } = require('../middleware/auth');

router.get('/protected', verifyToken, (req, res) => {
  console.log(req.user); // { id, name, email, role }
});
```

**Token Format:**
```
Authorization: Bearer <token>
```

**Attached to req:**
```javascript
req.user = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "John Doe",
  email: "john@company.com",
  role: "staff"
}
```

---

### requireRole

Checks if user's role is in allowed roles list.

**Usage:**
```javascript
const { verifyToken, requireRole } = require('../middleware/auth');

// Only admin users can access
router.delete(
  '/users/:id',
  verifyToken,
  requireRole('admin'),
  (req, res) => {
    // Only admins reach here
  }
);

// Admin or staff can access
router.post(
  '/assets',
  verifyToken,
  requireRole('admin', 'staff'),
  (req, res) => {
    // Admins or staff reach here
  }
);
```

---

## JWT Token Details

### Payload Structure
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "John Doe",
  email: "john@company.com",
  role: "staff",
  iat: 1710489000,
  exp: 1711094000
}
```

### Configuration
- **Secret:** `process.env.JWT_SECRET` (set in .env)
- **Expiry:** 7 days
- **Algorithm:** HS256

### Expiry Details
- **Issued at (iat):** Current timestamp
- **Expires at (exp):** Current timestamp + 7 days
- **Expiry in seconds:** 604800

---

## User Roles

### Available Roles
1. **admin** - Full system access
2. **staff** - Most operations, cannot delete users
3. **viewer** - Read-only access

### Default Role
New registered users get **staff** role by default.

### Role Assignment
To assign admin role (must update database):
```bash
# Using psql
UPDATE users SET role = 'admin' WHERE email = 'admin@company.com';

# Or in your application
await User.update(
  { role: 'admin' },
  { where: { id: userId } }
);
```

---

## Example: Protected Routes

### Admin-only endpoint
```javascript
const { verifyToken, requireRole } = require('../middleware/auth');

router.delete(
  '/users/:id',
  verifyToken,
  requireRole('admin'),
  async (req, res) => {
    // Only admins can delete users
    const user = await User.findByPk(req.params.id);
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  }
);
```

### Admin or Staff endpoint
```javascript
router.post(
  '/assets',
  verifyToken,
  requireRole('admin', 'staff'),
  async (req, res) => {
    // Admins and staff can create assets
    const asset = await Asset.create(req.body);
    res.json({ success: true, data: { asset } });
  }
);
```

### Any authenticated user
```javascript
router.post(
  '/assets/:id/assign',
  verifyToken,
  async (req, res) => {
    // Any logged-in user can assign assets to themselves
    const asset = await Asset.findByPk(req.params.id);
    await asset.update({ assigned_to: req.user.id });
    res.json({ success: true, message: 'Asset assigned' });
  }
);
```

---

## Testing with cURL

### Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "password": "MyPassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@company.com",
    "password": "MyPassword123"
  }'
```

### Get current user (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Use token in subsequent requests
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

### 1. Register Request
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123"
}
```

### 2. Login Request
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "TestPassword123"
}
```
- Copy the returned token

### 3. Get Me Request
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer <paste-token-here>`

---

## Password Security

### Hashing
- **Algorithm:** bcryptjs
- **Salt rounds:** 10
- **Strength:** Very strong (even with 100k attempts, will take years to crack)

### Password Validation
- Minimum 6 characters required
- No maximum length
- No complexity requirements (can be enhanced)

### Best Practices
- Use HTTPS in production
- Set strong JWT_SECRET in .env
- Never log passwords
- Implement rate limiting for login/register
- Add password reset functionality

---

## Error Handling

### HTTP Status Codes
| Code | Scenario |
|------|----------|
| 201 | Registration successful |
| 200 | Login/Get user successful |
| 400 | Validation failed |
| 401 | Unauthorized (invalid credentials, expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | User not found |
| 409 | Email already registered |
| 500 | Server error |

### Error Response Format
All errors follow consistent format:
```json
{
  "success": false,
  "error": "Error type",
  "message": "User-friendly message"
}
```

---

## Integration with Routes

### Protect asset routes
```javascript
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/assets - Any authenticated user
router.get('/', verifyToken, async (req, res) => {
  const assets = await Asset.findAll({
    where: { assigned_to: req.user.id }
  });
  res.json({ success: true, data: { assets } });
});

// POST /api/assets - Only admin/staff
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'staff'),
  async (req, res) => {
    const asset = await Asset.create(req.body);
    res.json({ success: true, data: { asset } });
  }
);

// DELETE /api/assets/:id - Only admin
router.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  async (req, res) => {
    await Asset.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  }
);
```

---

## Environment Configuration

Required in `.env`:
```env
JWT_SECRET=your_super_secret_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
```

For production:
```env
JWT_SECRET=use_a_very_long_random_string_at_least_32_characters_long
NODE_ENV=production
```

Generate a good secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Common Issues

### "No token provided"
- Missing `Authorization` header
- Header should be: `Authorization: Bearer <token>`

### "Token expired"
- Token is older than 7 days
- User needs to login again

### "Invalid token"
- Token is malformed
- JWT_SECRET doesn't match

### "Email already registered"
- Try registering with different email
- Use login instead

### "Invalid credentials"
- Email or password is wrong
- Check email doesn't have extra spaces
- Passwords are case-sensitive

---

## Next Steps

1. **Test all endpoints** using cURL or Postman
2. **Protect asset routes** with verifyToken and requireRole
3. **Add rate limiting** for login attempts
4. **Implement password reset** functionality
5. **Add refresh token** for longer sessions
6. **Add logout** with token blacklist (optional)

---

## Files Modified

- `/routes/auth.js` - Complete authentication routes
- `/middleware/auth.js` - Token verification and role checks

---

## Related Documentation

- [MODELS.md](MODELS.md) - User model details
- [MODELS_SUMMARY.md](MODELS_SUMMARY.md) - Database overview
- [README.md](README.md) - API endpoint structure
