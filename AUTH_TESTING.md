# Authentication Testing Guide

Complete guide to testing the authentication system.

---

## Quick Start

### 1. Start the server
```bash
npm run dev
```

### 2. Test registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 3. Test login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 4. Test protected endpoint (replace TOKEN with token from login)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Complete Test Scenarios

### Test 1: User Registration

**Scenario:** Register a new user with valid credentials

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid...",
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**✓ Save the token for next tests**

---

### Test 2: Registration Validation Errors

**Scenario A:** Missing name
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

**Scenario B:** Invalid email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "not-an-email",
    "password": "Password123"
  }'
```

**Expected Response (400):**
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

**Scenario C:** Password too short
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

---

### Test 3: Duplicate Email Registration

**Scenario:** Try to register with already-used email

```bash
# First registration (succeeds)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@company.com",
    "password": "Password123"
  }'

# Second registration with same email (fails)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith 2",
    "email": "bob@company.com",
    "password": "DifferentPass123"
  }'
```

**Expected Response (409):**
```json
{
  "success": false,
  "error": "Email already registered",
  "message": "This email is already associated with an account. Please login instead."
}
```

---

### Test 4: User Login

**Scenario:** Login with correct credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@company.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid...",
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**✓ Save this token**

---

### Test 5: Login - User Not Found

**Scenario:** Login with non-existent email

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@company.com",
    "password": "Password123"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "No user found with this email address."
}
```

---

### Test 6: Login - Wrong Password

**Scenario:** Login with correct email but wrong password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@company.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "The password you entered is incorrect."
}
```

---

### Test 7: Get Current User (Protected)

**Scenario:** Get authenticated user info using valid token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User information retrieved",
  "data": {
    "user": {
      "id": "uuid...",
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "role": "staff",
      "created_at": "2024-03-15T10:30:00Z"
    }
  }
}
```

---

### Test 8: Missing Token

**Scenario:** Try to access protected route without token

```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "No token provided",
  "message": "Authorization token is missing. Please include Bearer token in headers."
}
```

---

### Test 9: Invalid Token

**Scenario:** Use malformed or fake token

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "The provided token is invalid or malformed."
}
```

---

### Test 10: Token Format Variations

**Valid Formats:**
```bash
# Space-separated Bearer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Multiple spaces (still works)
Authorization: Bearer    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Invalid Formats:**
```bash
# Missing Bearer
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lowercase bearer (should still work)
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing with Postman

### 1. Create Environment Variables

In Postman, create an environment with:
```
base_url = http://localhost:5000/api
token = (will be set automatically)
```

### 2. Register Request

```
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "Postman User",
  "email": "postman@example.com",
  "password": "PostmanTest123"
}
```

**In Tests tab, add:**
```javascript
if (pm.response.code === 201) {
    pm.environment.set("token", pm.response.json().data.token);
}
```

### 3. Login Request

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "postman@example.com",
  "password": "PostmanTest123"
}
```

**In Tests tab, add:**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("token", pm.response.json().data.token);
}
```

### 4. Get Me Request

```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

---

## Testing with Thunder Client (VS Code)

### 1. Install Extension
- Open VS Code Extensions
- Search "Thunder Client"
- Install it

### 2. Create Requests

**Register:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Thunder User",
  "email": "thunder@example.com",
  "password": "Thunder123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "thunder@example.com",
  "password": "Thunder123"
}
```

**Get Me:**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token-from-login>
```

---

## Testing with Sample Users

Use the pre-seeded users in the database:

```bash
# Admin user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'

# Staff user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "password123"
  }'

# Viewer user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@company.com",
    "password": "password123"
  }'
```

---

## Test Checklist

### Registration
- [ ] Valid registration creates user and returns token
- [ ] Token is JWT format (3 parts separated by dots)
- [ ] Missing name validation fails
- [ ] Invalid email validation fails
- [ ] Short password validation fails
- [ ] Duplicate email returns 409 conflict
- [ ] Default role is 'staff'

### Login
- [ ] Valid credentials return user and token
- [ ] Non-existent email returns clear error
- [ ] Wrong password returns clear error
- [ ] Token is valid JWT
- [ ] Token payload includes id, name, email, role

### Protected Routes
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Valid token allows access
- [ ] User object is attached to request
- [ ] User object has id, name, email, role

### Token Claims
- [ ] Decode token and verify payload
- [ ] Expiry is 7 days from creation
- [ ] Algorithm is HS256

---

## Bash Script for Automated Testing

Create `test_auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api/auth"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="TestPass123"
NAME="Test User"

echo "🧪 Testing Authentication System"
echo "=================================="

# Test 1: Register
echo -e "\n1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed - No token received"
  exit 1
fi

echo "✅ Registration successful"
echo "Token: ${TOKEN:0:50}..."

# Test 2: Login
echo -e "\n2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "✅ Login successful"

# Test 3: Get Me
echo -e "\n3️⃣  Testing Protected Route (Get Me)..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"
echo "✅ Protected route accessible"

# Test 4: Wrong Password
echo -e "\n4️⃣  Testing Wrong Password..."
WRONG_PASS=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"WrongPassword\"
  }")

if echo "$WRONG_PASS" | grep -q "Invalid credentials"; then
  echo "✅ Wrong password correctly rejected"
else
  echo "❌ Wrong password test failed"
fi

# Test 5: Missing Token
echo -e "\n5️⃣  Testing Missing Token..."
NO_TOKEN=$(curl -s -X GET "$BASE_URL/me")

if echo "$NO_TOKEN" | grep -q "No token provided"; then
  echo "✅ Missing token correctly rejected"
else
  echo "❌ Missing token test failed"
fi

echo -e "\n=================================="
echo "✅ All tests completed!"
```

Run it:
```bash
chmod +x test_auth.sh
./test_auth.sh
```

---

## Debugging Tips

### View JWT Token Contents

Decode token at [jwt.io](https://jwt.io):
1. Copy token from login response
2. Paste in jwt.io
3. View payload and verify claims

### Check Token Expiry

```bash
node -e "console.log(new Date(1710575400000))"
```

### Monitor Request/Response

Using curl with verbose:
```bash
curl -v -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'
```

### Check Database

```bash
# Connect to PostgreSQL
psql -U postgres -d asset_inventory_db

# View users
SELECT id, name, email, role, created_at FROM users;

# View specific user
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## Performance Testing

Test token generation speed:

```bash
time curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'
```

Expected: < 100ms

---

## Common Test Failures & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "No token provided" | Missing Authorization header | Add `Authorization: Bearer TOKEN` |
| "Invalid token" | Malformed token | Verify token format (3 parts) |
| "Email already registered" | Trying to register duplicate | Use different email |
| "Invalid credentials" | Wrong password | Verify password matches |
| "Token expired" | Token older than 7 days | Login again to get new token |

---

## Next Steps

1. **Test all endpoints** using provided examples
2. **Verify token expiry** is 7 days
3. **Test with role-based routes** (when implemented)
4. **Load test** with multiple concurrent requests
5. **Test in production** environment with real HTTPS

---

## Related Files

- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Full authentication documentation
- [routes/auth.js](routes/auth.js) - Authentication endpoints
- [middleware/auth.js](middleware/auth.js) - Token verification middleware
