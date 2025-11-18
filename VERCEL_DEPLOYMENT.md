# 🚀 Vercel Deployment Guide

This guide will help you deploy your Calorie Tracker application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free account works)
2. **MongoDB Atlas**: You'll need a cloud MongoDB database (free tier available)
3. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository

---

## 🎯 Deployment Strategy

For a MERN stack application, we recommend deploying:
- **Frontend**: Deploy to Vercel (excellent for React apps)
- **Backend**: Deploy to Vercel as Serverless Functions OR use Railway/Render

This guide covers both options.

---

## 📦 Option 1: Deploy Frontend Only to Vercel (Recommended for Beginners)

### Step 1: Prepare Your Backend

1. **Deploy backend separately** to:
   - [Railway](https://railway.app) (recommended - free tier available)
   - [Render](https://render.com) (free tier available)
   - [Heroku](https://heroku.com) (paid plans)
   - Or keep it running locally for development

2. **Get your backend URL** (e.g., `https://your-backend.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional, but recommended):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend folder**:
   ```bash
   cd frontend
   ```

3. **Deploy via Vercel Dashboard** (Easiest method):
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Set **Root Directory** to `frontend`
   - Add environment variable:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: `https://your-backend-url.com/api` (your deployed backend URL)
   - Click **Deploy**

4. **OR Deploy via CLI**:
   ```bash
   cd frontend
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `REACT_APP_API_URL=https://your-backend-url.com/api`

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:
- `REACT_APP_API_URL` = `https://your-backend-url.com/api`

---

## 📦 Option 2: Deploy Both Frontend & Backend to Vercel

### Step 1: Update Backend for Serverless

The backend needs to be compatible with Vercel's serverless functions. The current setup should work, but ensure:

1. **MongoDB Atlas** is set up (required for cloud deployment)
2. **Environment variables** are configured in Vercel

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**: [vercel.com/new](https://vercel.com/new)

2. **Import your Git repository**

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as root (`.`)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install && cd ../backend && npm install`

4. **Add Environment Variables**:
   
   **For Frontend:**
   - `REACT_APP_API_URL` = `/api` (if backend is on same domain) OR your backend URL
   
   **For Backend:**
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A secure random string (generate one)
   - `NODE_ENV` = `production`
   - `PORT` = (Vercel will set this automatically)

5. **Click Deploy**

### Step 3: Update API Configuration

If deploying both to Vercel, update `frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  // ... rest of config
});
```

---

## 🔧 Environment Variables Setup

### Required Environment Variables

#### For Frontend:
- `REACT_APP_API_URL` - Your backend API URL

#### For Backend:
- `MONGODB_URI` - MongoDB connection string (use MongoDB Atlas)
- `JWT_SECRET` - Secret key for JWT tokens (generate a secure random string)
- `NODE_ENV` - Set to `production`

### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: Variable name (e.g., `REACT_APP_API_URL`)
   - **Value**: Variable value
   - **Environment**: Select where it applies (Production, Preview, Development)
4. Click **Save**

### Generate JWT Secret:

You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🗄️ MongoDB Atlas Setup (Required for Production)

1. **Sign up**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a free cluster**:
   - Choose a cloud provider (AWS, Google Cloud, Azure)
   - Select a region close to you
   - Choose the free tier (M0)

3. **Create Database User**:
   - Go to **Database Access**
   - Click **Add New Database User**
   - Choose **Password** authentication
   - Create username and password (save these!)

4. **Whitelist IP Address**:
   - Go to **Network Access**
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (for Vercel deployment)
   - Or add Vercel's IP ranges

5. **Get Connection String**:
   - Go to **Clusters** → Click **Connect**
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `calorie-tracker` or your database name

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calorie-tracker?retryWrites=true&w=majority
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend is accessible at your Vercel URL
- [ ] Backend API is responding (check `/api` endpoint)
- [ ] MongoDB connection is working
- [ ] User registration works
- [ ] User login works
- [ ] Image upload/analysis works
- [ ] Dashboard loads correctly

---

## 🔍 Troubleshooting

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` environment variable is set correctly
- Ensure backend is deployed and accessible
- Check browser console for CORS errors

### Backend errors
- Verify MongoDB connection string is correct
- Check all environment variables are set
- Review Vercel function logs in dashboard

### Build fails
- Check that all dependencies are in `package.json`
- Ensure build commands are correct
- Check Vercel build logs for specific errors

### CORS errors
- Backend should have CORS enabled (already configured)
- If deploying separately, ensure backend allows your frontend domain

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎉 You're Done!

Once deployed, your app will be live at `https://your-project.vercel.app`

**Note**: For the best performance and cost-effectiveness:
- Use Vercel for frontend (excellent free tier)
- Use Railway or Render for backend (better for long-running connections)
- Use MongoDB Atlas for database (free tier available)

Happy deploying! 🚀

