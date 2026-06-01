# React Frontend - Quick Start Guide

Get the frontend running in 5 minutes.

---

## Installation

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

Content:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## Login

**Demo Account:**
- Email: `admin@company.com`
- Password: `password123`

Other accounts:
- `john.doe@company.com` (Staff)
- `viewer@company.com` (Viewer)

---

## What You Get

✅ **Authentication**
- Login page with JWT
- Auto token attachment to API calls
- Auto logout on 401 errors
- Token stored in localStorage

✅ **Layout**
- Fixed sidebar with navigation
- Top navigation bar with user info
- Main content area
- Role-based navigation items

✅ **Navigation**
- Dashboard → `/dashboard`
- Assets → `/assets` (ready to build)
- Purchases → `/purchases` (ready to build)
- Contracts → `/contracts` (ready to build)
- Reports → `/reports` (ready to build)
- Users → `/users` (admin only, ready to build)

✅ **Dashboard**
- Real API data from `/api/reports/dashboard`
- Asset count metrics
- Expiring contracts list
- Recent assets list

---

## File Structure

```
client/src/
├── api/axios.js              ← Configured API client
├── context/AuthContext.jsx    ← Auth state management
├── components/
│   ├── PrivateRoute.jsx       ← Route protection
│   ├── Sidebar.jsx            ← Navigation
│   └── Topbar.jsx             ← Header
├── layouts/AppLayout.jsx      ← Main layout wrapper
├── pages/
│   ├── Login.jsx              ← Login page
│   └── Dashboard.jsx          ← Dashboard page
└── App.jsx                    ← Routes configuration
```

---

## Using the Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,                // { id, name, email, role }
    isAuthenticated,     // boolean
    login,               // async (email, password) => { success, error }
    logout,              // () => void
    hasRole,             // (role | [roles]) => boolean
    canCreate,           // () => boolean
    canEdit,             // () => boolean
    canDelete            // () => boolean
  } = useAuth();

  return <div>{user.name}</div>;
}
```

---

## Making API Calls

```jsx
import api from '../api/axios';

// GET
const response = await api.get('/assets');
const assets = response.data.data.assets;

// POST
const response = await api.post('/assets', {
  asset_tag: 'LAP-001',
  category: 'IT',
  sub_type: 'Laptop'
});

// PUT
await api.put(`/assets/${id}`, { status: 'inactive' });

// DELETE
await api.delete(`/assets/${id}`);
```

**Token is automatically attached!**

---

## Creating a New Page

### 1. Create Component
```jsx
// src/pages/Assets.jsx
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';

export const Assets = () => {
  return (
    <AppLayout title="Assets">
      <div>
        <h1>Asset List</h1>
        {/* Content here */}
      </div>
    </AppLayout>
  );
};
```

### 2. Add Route
```jsx
// src/App.jsx
import { Assets } from './pages/Assets';

<Route
  path="/assets"
  element={
    <PrivateRoute>
      <Assets />
    </PrivateRoute>
  }
/>
```

### 3. Add Sidebar Link
```jsx
// src/components/Sidebar.jsx
const navItems = [
  { path: '/assets', label: 'Assets', icon: '💻' }
  // Auto-highlights when active!
];
```

---

## Styling with Tailwind

**All styling is done with Tailwind classes - no CSS files needed!**

### Common Classes

```jsx
// Colors
text-gray-800          // Dark text
bg-blue-600            // Blue background
border-gray-200        // Light border

// Layout
flex, grid, block
w-full, w-64           // Width
p-6, px-4, py-2        // Padding
mb-4, mt-2             // Margin
gap-6                  // Gap between items

// Typography
text-lg, text-xl       // Font size
font-bold, font-medium // Font weight

// Interactive
hover:bg-blue-700      // Hover state
focus:ring-2           // Focus state
transition-colors      // Smooth transitions
rounded-lg             // Border radius
shadow-sm              // Subtle shadow
```

### Example Card

```jsx
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
  <h3 className="text-lg font-bold text-gray-800 mb-4">Title</h3>
  <p className="text-gray-600">Content goes here</p>
</div>
```

---

## Role Permissions

**Admin (admin@company.com)**
- ✅ View all
- ✅ Create
- ✅ Edit
- ✅ Delete
- ✅ See Users link

**Staff (john.doe@company.com)**
- ✅ View all
- ✅ Create
- ✅ Edit
- ❌ Delete

**Viewer (viewer@company.com)**
- ✅ View all
- ❌ Create
- ❌ Edit
- ❌ Delete

---

## Dashboard Data

The dashboard fetches from `/api/reports/dashboard`:

```json
{
  "total_assets": 5,
  "it_assets": 3,
  "non_it_assets": 2,
  "active": 4,
  "inactive": 1,
  "disposed": 0,
  "expiring_contracts": [...],
  "recent_assets": [...]
}
```

---

## Debugging

### Check Token
```javascript
// In browser console
localStorage.getItem('token')
localStorage.getItem('user')
```

### Check Auth State
```javascript
// In component
const { user, isAuthenticated } = useAuth();
console.log(user, isAuthenticated);
```

### API Request Headers
```javascript
// Network tab in DevTools
// Check Authorization header in request
```

---

## Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` folder.

Deploy to:
- **Netlify:** Drop `dist/` folder
- **Vercel:** Connect Git repo
- **Docker:** Use Node image
- **Nginx:** Configure SPA routing

---

## Common Tasks

### Protect Page by Role
```jsx
const { hasRole } = useAuth();
if (!hasRole('admin')) return <Navigate to="/" />;
```

### Show/Hide Elements
```jsx
const { canDelete } = useAuth();
{canDelete() && <button>Delete</button>}
```

### Logout
```jsx
const { logout } = useAuth();
<button onClick={logout}>Logout</button>
```

### Call API with Auth
```jsx
const data = await api.get('/assets');
// Token auto-attached!
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Check `REACT_APP_API_URL` matches backend |
| Token lost on refresh | Check localStorage in DevTools |
| Not logged in after login | Check response includes `token` field |
| Routes not working | Use `<Navigate to="/path" />` not `window.location` |
| Sidebar not highlighting | Make sure path matches exactly |

---

## Next Steps

1. ✅ Frontend running
2. 🔄 Create Assets page
3. 🔄 Create Purchases page
4. 🔄 Create Contracts page
5. 🔄 Create Reports page
6. 🔄 Create Users page (admin only)

---

**Status:** ✅ Ready to Use  
**Backend Required:** Yes (running on :5000)  
**Demo Accounts:** Included
