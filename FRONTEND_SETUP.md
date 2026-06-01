# React + Tailwind CSS Frontend Setup

Complete setup guide for the IT Asset Inventory Management frontend.

---

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance with interceptors
│   ├── components/
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Topbar.jsx            # Top navigation bar
│   │   └── PrivateRoute.jsx       # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── layouts/
│   │   └── AppLayout.jsx          # Main app layout
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   └── Dashboard.jsx          # Dashboard page
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles (Tailwind)
│   └── .env.example               # Environment variables template
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:5173`

---

## File Descriptions

### 1. api/axios.js

Axios instance with automatic JWT handling:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Request interceptor - attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Features:**
- Automatically attaches JWT token to all requests
- Stores token in `Authorization` header
- Redirects to login on 401 Unauthorized
- Clears localStorage on auth failure

---

### 2. context/AuthContext.jsx

Provides authentication state and helpers:

```javascript
const { 
  user,                 // Current user object
  isAuthenticated,      // Boolean - is user logged in
  login(email, pwd),    // Function - login user
  logout(),             // Function - logout user
  hasRole(roles),       // Function - check user role
  canCreate(),          // Function - can create assets
  canEdit(),            // Function - can edit assets
  canDelete()           // Function - can delete assets
} = useAuth();
```

**Usage:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, canDelete, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome {user.name}</p>
      {canDelete() && <button onClick={logout}>Delete</button>}
    </div>
  );
}
```

---

### 3. components/PrivateRoute.jsx

Protects routes that require authentication:

```jsx
import { PrivateRoute } from './components/PrivateRoute';

<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

**Features:**
- Checks if user is authenticated
- Redirects to `/login` if not authenticated
- Preserves requested location for post-login redirect

---

### 4. components/Sidebar.jsx

Navigation sidebar with user info:

**Features:**
- Dynamic navigation links
- Active route highlighting
- User name and email display
- Role badge (Admin/Staff/Viewer)
- Color-coded roles
- Logout button
- Admin-only "Users" link

**Role Badge Colors:**
- Admin: Red
- Staff: Blue
- Viewer: Gray

---

### 5. components/Topbar.jsx

Top navigation bar with user profile:

**Shows:**
- Page title
- Current user name and email
- User avatar (first letter of name)

---

### 6. layouts/AppLayout.jsx

Main layout wrapper for app pages:

```jsx
<AppLayout title="Assets">
  <div>Page content here</div>
</AppLayout>
```

**Includes:**
- Fixed sidebar (256px wide)
- Topbar with title
- Main content area with padding
- Light gray background

---

### 7. pages/Login.jsx

Authentication page:

**Features:**
- Email and password form
- Pre-filled demo credentials
- Error message display
- Loading state during login
- Demo credentials section
- Responsive design
- Gradient background

**Demo Accounts:**
```
Admin:  admin@company.com / password123
Staff:  john.doe@company.com / password123
Viewer: viewer@company.com / password123
```

---

### 8. pages/Dashboard.jsx

Dashboard with metrics and recent items:

**Shows:**
- Total assets count
- IT assets count
- Active assets count
- Expiring contracts (30-day window)
- Recent assets (last 5)
- Expiring contracts list
- Loading and error states

---

## Styling

### Tailwind CSS Setup

The project uses **Tailwind CSS only** - no external UI libraries.

**Key Colors:**
- Primary: Blue (600, 700)
- Success: Green (600)
- Warning: Orange (600)
- Danger: Red
- Neutral: Gray

**Spacing:**
- Sidebar width: 256px (w-64)
- Main content padding: 32px (p-8)
- Card padding: 24px (p-6)

**Components:**
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200`
- Buttons: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- Inputs: `px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- Badges: `px-3 py-1 rounded-full text-xs font-semibold`

---

## Authentication Flow

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. Frontend calls `POST /api/auth/login`
4. Backend returns `{ token, user }`
5. Frontend stores in localStorage
6. AuthContext updates state
7. Redirects to `/dashboard`

### Automatic Token Attachment

Every API request automatically:
1. Gets token from localStorage
2. Adds to `Authorization: Bearer <token>` header
3. If 401 response, clears storage and redirects to login

### Logout Flow

1. User clicks Logout button
2. `logout()` clears localStorage
3. Updates AuthContext state
4. User sees login page on reload
5. PrivateRoute redirects unauthenticated users

---

## Using the Axios Instance

### Simple GET Request

```jsx
import api from '../api/axios';

const response = await api.get('/reports/dashboard');
const data = response.data.data;
```

### POST Request

```jsx
const response = await api.post('/assets', {
  asset_tag: 'LAP-001',
  category: 'IT',
  sub_type: 'Laptop'
});
```

### With Error Handling

```jsx
try {
  const response = await api.get('/assets');
  console.log(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // User will be auto-redirected by interceptor
  } else {
    console.error(error.response?.data?.message);
  }
}
```

---

## Role-Based Access

### Check User Role

```jsx
const { hasRole, user } = useAuth();

if (hasRole('admin')) {
  // Show admin-only content
}

if (hasRole(['admin', 'staff'])) {
  // Show admin or staff content
}
```

### Check Permissions

```jsx
const { canCreate, canEdit, canDelete } = useAuth();

{canCreate() && <button>Create Asset</button>}
{canEdit() && <button>Edit Asset</button>}
{canDelete() && <button>Delete Asset</button>}
```

### User Data

```jsx
const { user } = useAuth();

console.log(user.id);    // UUID
console.log(user.name);  // Full name
console.log(user.email); // Email address
console.log(user.role);  // 'admin' | 'staff' | 'viewer'
```

---

## Component Integration

### Using AppLayout in a Page

```jsx
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';

export const Assets = () => {
  const { canCreate } = useAuth();

  return (
    <AppLayout title="Assets">
      <div className="grid grid-cols-4 gap-6">
        {canCreate() && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Create Asset
          </button>
        )}
      </div>
    </AppLayout>
  );
};
```

---

## Adding New Pages

### 1. Create Page Component

```jsx
// src/pages/Assets.jsx
import { AppLayout } from '../layouts/AppLayout';

export const Assets = () => {
  return (
    <AppLayout title="Assets">
      <div>Assets page content</div>
    </AppLayout>
  );
};
```

### 2. Add Route in App.jsx

```jsx
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

### 3. Add Sidebar Link (auto-highlights)

Edit `src/components/Sidebar.jsx`:
```jsx
const navItems = [
  // ... existing items
  { path: '/assets', label: 'Assets', icon: '💻' }
];
```

---

## Styling Examples

### Card Component

```jsx
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
  <h3 className="text-lg font-bold text-gray-800 mb-4">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Button Variants

```jsx
{/* Primary Button */}
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Primary
</button>

{/* Secondary Button */}
<button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
  Secondary
</button>

{/* Danger Button */}
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
  Delete
</button>
```

### Status Badge

```jsx
<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
  status === 'active'
    ? 'bg-green-100 text-green-800'
    : status === 'inactive'
    ? 'bg-gray-100 text-gray-800'
    : 'bg-red-100 text-red-800'
}`}>
  {status}
</span>
```

### Form Group

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Label
  </label>
  <input
    type="text"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
```

---

## Environment Variables

### Development (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Production (.env.production)

```env
REACT_APP_API_URL=https://api.example.com/api
```

**Note:** All env vars must start with `REACT_APP_` to be accessible in the code.

---

## Building for Production

```bash
npm run build
```

Creates optimized build in `dist/` folder.

**Deploy to:**
- Netlify: Drop `dist/` folder
- Vercel: Connect Git repo
- Docker: Use `node:18` image
- Nginx: Serve `dist/` with SPA config

---

## Common Tasks

### Add a New API Endpoint Call

```jsx
import api from '../api/axios';

const [assets, setAssets] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data.data.assets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchAssets();
}, []);
```

### Protect a Page by Role

```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminPanel = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout title="Admin Panel">
      {/* Admin content */}
    </AppLayout>
  );
};
```

### Create a Modal/Dialog

```jsx
const [isOpen, setIsOpen] = useState(false);

{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Modal Title</h2>
      <p className="text-gray-600 mb-6">Modal content here</p>
      <button
        onClick={() => setIsOpen(false)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  </div>
)}
```

---

## Troubleshooting

### CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Ensure backend has CORS enabled and `REACT_APP_API_URL` matches backend URL.

### Token Not Persisting

**Problem:** Token lost after page reload

**Solution:** Check that `localStorage.getItem('token')` returns the token. Verify in browser DevTools → Application → Local Storage.

### Auto-Logout Not Working

**Problem:** User stays logged in after token expires

**Solution:** The 401 interceptor handles this. Make sure backend returns 401 on expired tokens.

### Sidebar Not Highlighting

**Problem:** Active link not highlighted

**Solution:** The `location.pathname` must exactly match the `path`. Use trailing slashes consistently.

---

## Performance Tips

1. **Lazy load pages:**
   ```jsx
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   ```

2. **Memoize components:**
   ```jsx
   export const Sidebar = React.memo(() => {...});
   ```

3. **Use useCallback for event handlers:**
   ```jsx
   const handleClick = useCallback(() => {...}, [dependency]);
   ```

4. **Separate API calls:**
   ```jsx
   // Don't fetch everything at once
   useEffect(() => { fetchAssets(); }, []);
   useEffect(() => { fetchPurchases(); }, []);
   ```

---

## Next Steps

1. ✅ Setup complete
2. Start dev server: `npm run dev`
3. Visit `http://localhost:5173`
4. Login with demo credentials
5. Create additional pages for Assets, Purchases, etc.
6. Connect to backend endpoints using axios instance

---

**Status:** ✅ Complete  
**Version:** 1.0  
**Last Updated:** 2026-05-29
