# 🔐 Environment Variables Setup Guide for Vercel

This guide shows you exactly how to add environment variables in Vercel.

---

## 📍 Step-by-Step Instructions

### Step 1: Access Your Project Settings

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click on your project** (or create a new one if you haven't deployed yet)
3. **Click on "Settings"** (top navigation bar)
4. **Click on "Environment Variables"** (left sidebar)

---

### Step 2: Add Each Environment Variable

For each variable below, follow these steps:

1. **Click "Add New"** button
2. **Enter the Key** (variable name)
3. **Enter the Value** (variable value)
4. **Select Environments** (check all: Production, Preview, Development)
5. **Click "Save"**

---

## 🔑 Required Environment Variables

### 1. MONGODB_URI

**Key:** `MONGODB_URI`

**Value:** Your MongoDB Atlas connection string

**How to get it:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `calorie-tracker` (or your preferred database name)

**Example Value:**
```
mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/calorie-tracker?retryWrites=true&w=majority
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. JWT_SECRET

**Key:** `JWT_SECRET`

**Value:** A secure random string (at least 32 characters)

**How to generate it:**

**Option A: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B: Using Online Generator**
- Go to [randomkeygen.com](https://randomkeygen.com)
- Copy a "CodeIgniter Encryption Keys" (256-bit)

**Example Value:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. REACT_APP_API_URL

**Key:** `REACT_APP_API_URL`

**Value:** `/api` (if deploying both frontend and backend to Vercel)

**OR**

**Value:** `https://your-backend-url.com/api` (if backend is deployed separately)

**Example Value (Same Domain):**
```
/api
```

**Example Value (Separate Backend):**
```
https://calorie-tracker-backend.railway.app/api
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 4. NODE_ENV

**Key:** `NODE_ENV`

**Value:** `production`

**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## 📸 Visual Guide

### In Vercel Dashboard:

```
Project Dashboard
    ↓
Settings (top nav)
    ↓
Environment Variables (left sidebar)
    ↓
[Add New] button
    ↓
Fill in:
    Key: MONGODB_URI
    Value: mongodb+srv://...
    Environments: ☑ Production ☑ Preview ☑ Development
    ↓
[Save]
```

---

## ✅ Complete List to Add

Add these 4 variables in order:

| # | Key | Value | Environments |
|---|-----|-------|--------------|
| 1 | `MONGODB_URI` | Your MongoDB Atlas connection string | All |
| 2 | `JWT_SECRET` | Generated secure random string | All |
| 3 | `REACT_APP_API_URL` | `/api` or your backend URL | All |
| 4 | `NODE_ENV` | `production` | All |

---

## 🎯 Quick Copy-Paste Format

### For MongoDB Atlas:
```
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calorie-tracker?retryWrites=true&w=majority
```

### For JWT Secret (generate first):
```bash
# Run this command to generate:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Then copy the output as the value
```

### For API URL:
```
REACT_APP_API_URL = /api
```

### For Node Environment:
```
NODE_ENV = production
```

---

## ⚠️ Important Notes

1. **No Spaces**: Don't add spaces around the `=` sign in Vercel. Just enter:
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://...`

2. **Case Sensitive**: Variable names are case-sensitive. Use exactly:
   - `MONGODB_URI` (all caps)
   - `JWT_SECRET` (all caps)
   - `REACT_APP_API_URL` (all caps, with underscores)
   - `NODE_ENV` (all caps)

3. **REACT_APP_ Prefix**: The `REACT_APP_API_URL` variable MUST start with `REACT_APP_` for React to access it.

4. **Environments**: Select all three (Production, Preview, Development) for each variable unless you have specific needs.

5. **After Adding**: You may need to redeploy for changes to take effect. Vercel will usually prompt you.

---

## 🔄 After Adding Variables

1. **Redeploy** your project:
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

2. **Or** make a small change and push to trigger a new deployment

---

## ✅ Verification

To verify your variables are set correctly:

1. Go to **Settings** → **Environment Variables**
2. You should see all 4 variables listed
3. Check that they're enabled for the correct environments

---

## 🐛 Common Mistakes

❌ **Wrong:** `MONGODB_URI = mongodb://...` (with spaces)
✅ **Correct:** Key: `MONGODB_URI`, Value: `mongodb://...`

❌ **Wrong:** `react_app_api_url` (lowercase)
✅ **Correct:** `REACT_APP_API_URL` (uppercase with underscores)

❌ **Wrong:** `JWT_SECRET` value is too short (less than 32 characters)
✅ **Correct:** Use at least 64 characters for security

❌ **Wrong:** Forgot to check "Production" environment
✅ **Correct:** Check all environments (Production, Preview, Development)

---

## 📞 Need Help?

If you're having trouble:
1. Check the variable names match exactly (case-sensitive)
2. Verify MongoDB connection string is correct
3. Make sure JWT_SECRET is a long random string
4. Redeploy after adding variables
5. Check Vercel function logs for errors

---

**You're all set!** Once all variables are added, your app should work correctly. 🎉

