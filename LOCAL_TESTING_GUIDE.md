# 🧪 Local Testing Guide - Mock API Mode

Your frontend is now running with a **Mock API** for local development and testing.

## ✅ What is Mock API Mode?

Since PostgreSQL is not installed locally, the frontend automatically uses a mock API that simulates backend responses. This allows you to:

- ✅ Test the entire UI/UX
- ✅ Test form validation
- ✅ Test navigation
- ✅ Test role-based UI protection
- ✅ Test all 8 fixes

## 🎯 How to Test Locally

### Step 1: Access the Application

**URL:** http://localhost:5173

You should see the **Login page** with:
- Email input field
- Password input field
- Login button
- Validation error messages

### Step 2: Test with Mock Credentials

The mock API has 3 pre-configured users:

#### Admin User
```
Email:    admin@company.com
Password: password123
```
- Can see all features
- Can create, edit, delete assets
- Can see admin-only buttons

#### Staff User
```
Email:    john.doe@company.com
Password: password123
```
- Can create and edit assets
- Cannot delete assets
- Limited permissions

#### Viewer User
```
Email:    viewer@company.com
Password: password123
```
- Can only view data
- All action buttons are hidden/disabled
- Read-only access

### Step 3: Test Form Validation (Before Login)

Try these to test validation:

1. **Empty Email**
   - Leave email blank, click Login
   - Error: "Email is required"

2. **Invalid Email Format**
   - Enter: `admin` (without @)
   - Error: "Invalid email format"

3. **Short Password**
   - Enter: `admin@company.com` / `123`
   - Error: "Password must be at least 6 characters"

4. **Correct Credentials**
   - Email: `admin@company.com`
   - Password: `password123`
   - ✅ Should redirect to Dashboard

### Step 4: Test After Login

#### If you logged in as Admin:

**Dashboard Page**
- ✅ Check 6 stat cards display
- ✅ Check charts render
- ✅ Check recent assets table
- ✅ Verify no console errors

**Assets Page**
- ✅ "Add Asset" button is visible
- ✅ Table shows mock assets (3 items)
- ✅ Search works
- ✅ Edit button is visible
- ✅ Delete button is visible

**Form Validation**
- ✅ Required fields show validation
- ✅ Email field validates format
- ✅ Number fields reject letters
- ✅ Error messages appear in red

**UI Features**
- ✅ Toast notifications on success
- ✅ Toast notifications on error
- ✅ Loading spinner appears
- ✅ Sidebar collapses on mobile (resize browser < 768px)

#### If you logged in as Viewer:

**Assets Page**
- ✅ "Add Asset" button is HIDDEN
- ✅ Edit button is HIDDEN
- ✅ Delete button is HIDDEN
- ✅ Can only view data

### Step 5: Test Mobile Responsiveness

**On Desktop**
1. Resize browser to < 768px width
2. Sidebar should collapse
3. Only icons should be visible
4. Toggle button should work

**Mobile Features**
- ✅ Form fields stack vertically
- ✅ Buttons are touch-friendly
- ✅ No horizontal scrolling

### Step 6: Test Navigation

- ✅ Click Dashboard link → Dashboard page
- ✅ Click Assets link → Assets page
- ✅ Click Purchases link → Purchases page
- ✅ Click Contracts link → Contracts page
- ✅ Click Reports link → Reports page
- ✅ Visit `/unknown-route` → 404 page should appear

### Step 7: Test Logout

- ✅ Click Logout button in sidebar
- ✅ Token should be cleared
- ✅ User should redirect to login page
- ✅ Cannot access dashboard without token

## 📋 Complete Testing Checklist

### Login & Authentication
- [ ] Login with admin credentials works
- [ ] Form validation shows errors
- [ ] Toast notification on login success
- [ ] Token stored in localStorage
- [ ] User info stored in localStorage
- [ ] Logout clears token
- [ ] Cannot access dashboard without login

### Form Validation
- [ ] Empty fields show errors
- [ ] Email format validation works
- [ ] Password length validation (min 6)
- [ ] Error messages are clear
- [ ] Errors disappear when fixed

### UI Features
- [ ] Toast notifications appear (top-right)
- [ ] Loading spinners show during requests
- [ ] Buttons change state (loading/disabled)
- [ ] Sidebar collapses on mobile
- [ ] 404 page shows for unknown routes

### Role-Based Access
**As Admin:**
- [ ] Add button visible
- [ ] Edit button visible
- [ ] Delete button visible

**As Staff:**
- [ ] Add button visible
- [ ] Edit button visible
- [ ] Delete button hidden

**As Viewer:**
- [ ] All action buttons hidden
- [ ] Cannot perform any actions

### Navigation
- [ ] All links work
- [ ] Page transitions smooth
- [ ] Back button works
- [ ] Sidebar active state updates

### Dashboard (Mock Data)
- [ ] 6 stat cards display
- [ ] Charts render
- [ ] Recent assets table shows
- [ ] No console errors

## 🔧 Environment Variables

The mock API is automatically activated when:
1. `VITE_API_URL` is not set, OR
2. `VITE_USE_MOCK_API=true` is set

Current setup uses mock API for local development.

## ⚙️ Switching to Real API

To use the real backend (after deploying to Railway):

**Update `client/.env`:**
```env
VITE_API_URL=https://your-railway-backend.railway.app/api
```

Then restart the Vite server.

## 🧪 Mock Data Included

### Users
- Admin: admin@company.com / password123
- Staff: john.doe@company.com / password123
- Viewer: viewer@company.com / password123

### Mock Assets
- Dell Laptop (IT)
- Dell Monitor (IT)
- Office Chair (Non-IT)

### Mock Dashboard Data
- Total Assets: 150
- Active Assets: 140
- Total Value: $450,000
- Expiring Contracts: 3

## 📝 Important Notes

### What Works
✅ All UI components  
✅ Form validation  
✅ Navigation  
✅ Role-based UI  
✅ Toast notifications  
✅ Loading spinners  
✅ Mobile responsiveness  
✅ All 8 fixes  

### What's Limited (Mock API)
⚠️ Only 3 users available  
⚠️ Only 3 mock assets  
⚠️ No real database operations  
⚠️ No backend validations  
⚠️ No email/password strength checks  

### For Real Backend
After deploying to Railway:
1. Set `VITE_API_URL` to Railway URL
2. Restart frontend
3. Use real database with actual users
4. Full CRUD operations
5. Complete validation

## 🚀 Next: Deploy to Production

Once you've tested locally:

1. **Push to GitHub:** `git push origin main`
2. **Deploy Backend:** railway.app (connects to PostgreSQL)
3. **Deploy Frontend:** vercel.com (uses real API)
4. **Test:** Use TESTING_CHECKLIST.md

## 💡 Troubleshooting

### "Login Failed" Error?
- Check browser console (F12)
- Ensure you used correct password: `password123`
- Verify email is one of the 3 mock users

### Form validation not working?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Sidebar not collapsing?
- Resize browser window to < 768px
- Hard refresh the page
- Check that Tailwind CSS loaded

### Toast notifications not showing?
- Check if `react-hot-toast` is installed
- Verify `<Toaster />` is in App.jsx
- Check browser console for errors

## 📚 Related Guides

- **DEPLOY_INSTRUCTIONS.md** - Deploy to production
- **TESTING_CHECKLIST.md** - Full testing guide
- **PROJECT_COMPLETE.md** - Project summary
- **README_COMPLETE.md** - Full documentation

---

**Happy Testing! 🎉**

Your frontend is fully functional with the mock API. Test all features, then deploy to production for the real database experience.

**Current Status:**
- Frontend: ✅ RUNNING (http://localhost:5173)
- Mock API: ✅ ENABLED
- Ready to Deploy: ✅ YES
