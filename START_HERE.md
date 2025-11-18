# 🚀 START HERE - Step-by-Step Instructions

## 📋 Checklist - Follow These Steps in Order

### ✅ STEP 1: Check Prerequisites

Make sure you have installed:
- [ ] **Node.js** - Download from https://nodejs.org/ (v14 or higher)
- [ ] **MongoDB** - Download from https://www.mongodb.com/try/download/community (OR use MongoDB Atlas cloud)

To check if Node.js is installed:
```bash
node --version
npm --version
```

---

### ✅ STEP 2: Set Up MongoDB Database

**Choose ONE option:**

#### Option A: Local MongoDB (Recommended)
1. **Start MongoDB service:**
   - **Windows**: Open Command Prompt as **Administrator**, then run:
     ```bash
     net start MongoDB
     ```
   - **macOS/Linux**: Run:
     ```bash
     sudo systemctl start mongod
     ```

2. **Verify it's running:**
   - Open a new terminal and run: `mongosh`
   - If you see MongoDB shell, it's working!

#### Option B: MongoDB Atlas (Cloud - Free)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (you'll use it in Step 4)

---

### ✅ STEP 3: Install Backend Dependencies

1. **Open a terminal/command prompt**

2. **Navigate to backend folder:**
   ```bash
   cd calorie-tracker/backend
   ```

3. **Install packages:**
   ```bash
   npm install
   ```
   ⏱️ Wait 1-2 minutes for installation to complete

---

### ✅ STEP 4: Configure Backend Environment

1. **Check if `.env` file exists** in `calorie-tracker/backend/` folder

2. **If it doesn't exist, create it** with this content:

   **For Local MongoDB:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/calorie-tracker
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

   **For MongoDB Atlas (replace with your connection string):**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

3. **Save the file**

---

### ✅ STEP 5: Seed Food Database (Optional but Recommended)

1. **Make sure MongoDB is running** (from Step 2)

2. **In the backend folder**, run:
   ```bash
   node scripts/seedFoods.js
   ```

3. **You should see:**
   - "Connected to MongoDB"
   - "Seeded X foods"

---

### ✅ STEP 6: Start Backend Server

1. **Make sure you're in `calorie-tracker/backend` folder**

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   Server running on port 5000
   MongoDB Connected
   ```

4. **✅ Keep this terminal open!** The backend is now running.

5. **Test it:** Open browser and go to http://localhost:5000
   - Should see: `{"message":"Calorie Tracker API","status":"running"}`

---

### ✅ STEP 7: Install Frontend Dependencies

1. **Open a NEW terminal/command prompt** (keep backend running!)

2. **Navigate to frontend folder:**
   ```bash
   cd calorie-tracker/frontend
   ```

3. **Install packages:**
   ```bash
   npm install
   ```
   ⏱️ Wait 2-3 minutes for installation to complete

---

### ✅ STEP 8: Start Frontend Server

1. **Make sure you're in `calorie-tracker/frontend` folder**

2. **Start React app:**
   ```bash
   npm start
   ```

3. **Your browser should automatically open** to http://localhost:3000

4. **✅ If it doesn't open automatically, manually go to:** http://localhost:3000

---

### ✅ STEP 9: Test the Application

1. **You should see the Calorie Tracker homepage** 🎉

2. **Try the features:**
   - Click "📷 Camera" tab → Start Camera → Take photo → Analyze
   - Click "📁 Upload Image" tab → Upload image → Analyze
   - Click "Sign Up" to create an account
   - After login, check the Dashboard

3. **Test camera:**
   - Click "Start Camera"
   - Allow camera permissions
   - Point at food
   - Click "Capture & Analyze"

4. **Test image upload:**
   - Drag & drop a food image
   - Click "Analyze Image"

---

## 🔧 Common Issues & Solutions

### ❌ "Cannot find module" error
**Solution:** Run `npm install` in that folder

### ❌ "MongoDB connection error"
**Solution:** 
- Make sure MongoDB is running (Step 2)
- Check `.env` file has correct MONGODB_URI

### ❌ "Port 5000 already in use"
**Solution:** Change PORT in `.env` file to 5001

### ❌ "Port 3000 already in use"
**Solution:** React will ask if you want to use another port - say yes!

### ❌ Camera not working
**Solution:**
- Allow camera permissions in browser
- Make sure no other app is using the camera

### ❌ API calls failing
**Solution:**
- Make sure backend is running (Step 6)
- Check http://localhost:5000 works in browser
- Make sure both servers are running

---

## 📝 Quick Commands Reference

### Backend Terminal:
```bash
cd calorie-tracker/backend
npm install          # First time only
npm run dev          # Start backend
```

### Frontend Terminal:
```bash
cd calorie-tracker/frontend
npm install          # First time only
npm start            # Start frontend
```

---

## 🎯 What's Next?

After setup is complete:

1. ✅ Create your account (Sign Up)
2. ✅ Try analyzing food images
3. ✅ Save meals and track calories
4. ✅ Check your dashboard daily
5. ✅ Track your progress!

---

## 📚 Need More Help?

- See **SETUP_GUIDE.md** for detailed instructions
- See **QUICK_START.md** for quick reference
- Check console/terminal for error messages

---

**You're all set! Happy calorie tracking! 🍎📊**

