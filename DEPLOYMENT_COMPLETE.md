# 🚀 Complete Deployment Guide - Railway + Vercel/Netlify

## Table of Contents
1. [Backend Deployment (Railway)](#backend-deployment)
2. [Database Setup (Railway PostgreSQL)](#database-setup)
3. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [CORS Configuration](#cors-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account (https://railway.app)
- GitHub account (optional but recommended for auto-deploy)
- Git installed locally

### Step 1: Prepare Backend for Railway

**Update `package.json` start script:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:migrate": "node scripts/syncDb.js",
    "db:seed": "node scripts/seedDb.js"
  }
}
```

**Create `railway.json` (already provided):**

This file tells Railway how to build and run your app.

**Create `Procfile` (already provided):**

Alternative to railway.json for Railway deployment.

### Step 2: Deploy to Railway

#### Option A: Using Railway CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create a new project
railway init

# 4. Deploy
railway up
```

#### Option B: Using GitHub (Recommended)

```bash
# 1. Push your code to GitHub
git push origin main

# 2. Go to railway.app
# 3. Click "New Project" → "Deploy from GitHub"
# 4. Select your repository
# 5. Railway will auto-deploy on each push
```

### Step 3: Set Environment Variables in Railway

In Railway dashboard:
1. Go to your project
2. Click on the service
3. Go to "Variables" tab
4. Add these environment variables:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NODE_ENV=production
PORT=5000
```

Railway will automatically provide `DATABASE_URL` if you add a PostgreSQL plugin.

---

## Database Setup (Railway PostgreSQL)

### Step 1: Add PostgreSQL to Railway

In Railway Dashboard:
1. Go to your project
2. Click "Add Service"
3. Select "Database" → "PostgreSQL"
4. Railway creates a PostgreSQL instance automatically

### Step 2: Get Database Credentials

Railway automatically adds `DATABASE_URL` to your environment variables.

**Format:**
```
postgresql://username:password@host:port/database_name
```

### Step 3: Run Migrations on Railway

After deploying, run migrations:

```bash
# Option 1: Using Railway CLI
railway run npm run db:migrate && npm run db:seed

# Option 2: One-time command in Railway console
# Go to Railway dashboard → Your service → "Logs" tab
# And run through SSH if available
```

Or add to `Procfile`:
```
web: node server.js
release: npm run db:migrate && npm run db:seed
```

### Step 4: Verify Database Connection

```bash
# Check if database is running
railway run node -e "
  const { sequelize } = require('./config/db');
  sequelize.authenticate()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Error:', err))
"
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- Your frontend repository on GitHub

### Step 1: Build Frontend

```bash
cd client
npm run build
```

This creates an optimized `dist/` folder.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Follow prompts and set environment variables
```

#### Option B: Using Vercel Dashboard (Recommended)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Click "New Project"
# 4. Import your GitHub repository
# 5. Select project root as: ./client
# 6. Add environment variables (see below)
# 7. Click Deploy
```

### Step 3: Configure Environment Variables in Vercel

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:

```
VITE_API_URL=https://your-railway-backend-url.railway.app/api
```

Get your Railway backend URL:
- Go to Railway dashboard
- Select your backend service
- Copy the "Public URL"

### Step 4: Configure Build Settings in Vercel

1. Go to Settings → Build & Development Settings
2. Set:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 5: Verify Deployment

1. Vercel will auto-deploy on each GitHub push
2. Check status in Vercel dashboard
3. Click the domain link to visit your app

---

## Frontend Deployment (Netlify)

### Prerequisites
- Netlify account (https://netlify.com)
- Your frontend repository on GitHub

### Step 1: Deploy to Netlify

#### Option A: Using Netlify CLI

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Follow prompts
```

#### Option B: Using Netlify Dashboard (Recommended)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to netlify.com
# 3. Click "Add new site" → "Import an existing project"
# 4. Select your GitHub repository
# 5. Configure build settings (see below)
# 6. Add environment variables
# 7. Click "Deploy site"
```

### Step 2: Configure Build Settings in Netlify

1. Go to Site Settings → Build & Deploy
2. Set:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
   - **Node Version:** `18.x` (or higher)

Or edit `netlify.toml` (already provided):

```toml
[build]
  command = "npm run build"
  publish = "client/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 3: Set Environment Variables in Netlify

1. Go to Site Settings → Build & Deploy → Environment
2. Add:
   - **VITE_API_URL:** `https://your-railway-backend-url.railway.app/api`

### Step 4: Enable Auto-Deploy

Netlify automatically deploys on GitHub push. Check status in:
1. Netlify Dashboard → Deploys tab
2. Click a deployment to see build logs

---

## Environment Variables Summary

### Backend (Railway)

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/db` |
| `JWT_SECRET` | Secret for signing tokens | `super_secret_32_char_min_key` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Frontend URL | `https://your-frontend-url.vercel.app` |

### Frontend (Vercel/Netlify)

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.railway.app/api` |

---

## CORS Configuration

### Update Backend `server.js`

```javascript
const cors = require('cors');

// Get frontend URL from environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Set in Railway Environment Variables

```
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

---

## Complete Deployment Workflow

### 1. Backend (First)

```bash
# Step 1: Create Railway account & project
# Step 2: Connect GitHub repo or use CLI

# Step 3: Set environment variables
# - DATABASE_URL (auto from PostgreSQL)
# - JWT_SECRET
# - NODE_ENV=production
# - FRONTEND_URL=your-frontend-url

# Step 4: Deploy
railway up
# or push to main on GitHub

# Step 5: Run migrations
railway run npm run db:migrate && npm run db:seed

# Step 6: Get the backend URL
# - Go to Railway dashboard
# - Copy public URL (e.g., https://proj-prod-abc123.railway.app)
```

### 2. Frontend (Second)

```bash
# Step 1: Update .env.production
VITE_API_URL=https://proj-prod-abc123.railway.app/api

# Step 2: Commit and push
git add .env.production
git commit -m "Update API URL for production"
git push origin main

# Step 3: Deploy to Vercel/Netlify
# - Push triggers auto-deploy
# - Set VITE_API_URL in dashboard
# - Vercel/Netlify builds and deploys

# Step 4: Verify deployment
# - Visit your-app.vercel.app
# - Login and test features
```

### 3. Link Backend & Frontend

**In Backend (Railway):**
```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

**In Frontend (Vercel):**
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Troubleshooting

### Database Connection Error

```
Error: getaddrinfo ENOTFOUND postgres
```

**Solution:**
1. Check DATABASE_URL is set in Railway
2. Restart the service
3. Check PostgreSQL plugin is enabled

```bash
# Verify connection
railway run node -e "
  const db = require('./config/db');
  db.authenticate().then(() => console.log('✅ Connected'))
    .catch(e => console.error('❌', e.message))
"
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Update CORS in backend
2. Set FRONTEND_URL in Railway
3. Rebuild backend service

```javascript
// server.js
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
```

### 404 Errors on Frontend

```
Cannot GET /assets (or any route)
```

**Solution:**
For Vercel/Netlify, add redirect rule to serve index.html for all routes.

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify (netlify.toml):**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### API URL Not Loading

**Problem:** Frontend shows blank or network errors.

**Solution:**
1. Check VITE_API_URL in frontend build
2. Verify backend URL is correct
3. Check CORS is enabled on backend

```bash
# Check frontend build
vercel env ls

# Rebuild if needed
npm run build
```

### Migrations Not Running

**Problem:** Database tables not created.

**Solution:**

```bash
# Run manually
railway run npm run db:migrate && npm run db:seed

# Or add to Procfile
release: npm run db:migrate && npm run db:seed
```

---

## Monitoring & Logs

### Railway Logs

```bash
# View logs
railway logs

# Real-time logs
railway logs --follow
```

### Vercel Logs

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments" tab
4. Click a deployment to see logs

### Netlify Logs

1. Go to Netlify Dashboard
2. Select site
3. Go to "Deploys" tab
4. Click a deploy to see build logs

---

## Summary Checklist

### Before Deployment

- [ ] All environment variables are set
- [ ] Database migrations are tested locally
- [ ] CORS is configured
- [ ] `.env.production` points to correct API URL
- [ ] Backend is deployed first
- [ ] Frontend uses correct API URL

### Deployment Steps

- [ ] Deploy backend to Railway
- [ ] Set environment variables in Railway
- [ ] Run migrations on Railway
- [ ] Get backend public URL
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set VITE_API_URL in frontend
- [ ] Test login and basic features
- [ ] Check browser console for errors
- [ ] Monitor logs for any issues

### After Deployment

- [ ] Test login functionality
- [ ] Test CRUD operations (create, read, update, delete)
- [ ] Check network requests in DevTools
- [ ] Monitor Railway and Vercel logs for errors
- [ ] Set up monitoring/alerts if possible

---

## Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

---

**Your app is now deployed and accessible worldwide! 🚀**

