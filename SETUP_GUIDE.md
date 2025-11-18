# Step-by-Step Setup Guide

Follow these steps in order to get your Calorie Tracker MERN app running!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ MongoDB installed OR MongoDB Atlas account (free tier available) - [Download here](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ A code editor (VS Code recommended)

---

## STEP 1: Set Up MongoDB Database

You have two options:

### Option A: Local MongoDB (Recommended for development)

1. **Install MongoDB Community Server** (if not already installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation wizard

2. **Start MongoDB service**
   - **Windows**: Open Command Prompt as Administrator and run:
     ```bash
     net start MongoDB
     ```
   - **macOS/Linux**: Run:
     ```bash
     sudo systemctl start mongod
     # or
     sudo service mongod start
     ```

3. **Verify MongoDB is running**
   - Open a new terminal and run:
     ```bash
     mongosh
     ```
   - If you see the MongoDB shell prompt, it's working!

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. You'll use this in STEP 3

---

## STEP 2: Install Backend Dependencies

1. **Open a terminal/command prompt**
2. **Navigate to the backend folder**:
   ```bash
   cd calorie-tracker/backend
   ```

3. **Install all Node.js packages**:
   ```bash
   npm install
   ```
   
   This will take a minute. Wait for it to finish!

---

## STEP 3: Configure Backend Environment

1. **Create a `.env` file** in the `calorie-tracker/backend` folder

2. **Copy this content** into the `.env` file:

   **For Local MongoDB:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/calorie-tracker
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

   **For MongoDB Atlas (Cloud):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```
   
   **Important:** Replace `username:password` and `cluster` with your actual Atlas credentials!

3. **Save the file**

---

## STEP 4: Seed the Food Database (Optional but Recommended)

This populates your database with food items:

1. **Make sure MongoDB is running** (from STEP 1)
2. **In the backend folder**, run:
   ```bash
   node scripts/seedFoods.js
   ```
3. **You should see**: "Connected to MongoDB", "Seeded X foods"

---

## STEP 5: Start the Backend Server

1. **Make sure you're in the `calorie-tracker/backend` folder**

2. **Start the server**:
   ```bash
   npm run dev
   ```
   
   Or for production mode:
   ```bash
   npm start
   ```

3. **You should see**:
   ```
   Server running on port 5000
   MongoDB Connected
   ```

4. **✅ Backend is now running!** Keep this terminal open.

5. **Test it**: Open your browser and go to `http://localhost:5000`
   - You should see: `{"message":"Calorie Tracker API","status":"running"}`

---

## STEP 6: Install Frontend Dependencies

1. **Open a NEW terminal/command prompt** (keep the backend running!)
2. **Navigate to the frontend folder**:
   ```bash
   cd calorie-tracker/frontend
   ```

3. **Install all Node.js packages**:
   ```bash
   npm install
   ```
   
   This might take 2-3 minutes. Wait for it!

---

## STEP 7: Configure Frontend (Optional)

1. **Create a `.env` file** in the `calorie-tracker/frontend` folder (if needed)

2. **Only needed if your backend is NOT on port 5000**:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   
   (This is the default, so you can skip this step!)

---

## STEP 8: Start the Frontend Server

1. **Make sure you're in the `calorie-tracker/frontend` folder**

2. **Start the React app**:
   ```bash
   npm start
   ```

3. **Your browser should automatically open** to `http://localhost:3000`

4. **If it doesn't open automatically**, manually go to: `http://localhost:3000`

5. **✅ Frontend is now running!**

---

## STEP 9: Test the Application

1. **You should see the Calorie Tracker homepage**

2. **Try the camera feature**:
   - Click "📷 Camera" tab
   - Click "Start Camera"
   - Allow camera permissions
   - Take a photo of food
   - Click "Analyze This Image"

3. **Try the upload feature**:
   - Click "📁 Upload Image" tab
   - Drag & drop or select a food image
   - Click "Analyze Image"

4. **Create an account**:
   - Click "Sign Up"
   - Fill in the form
   - Click "Sign Up"
   - You'll be redirected to Dashboard

5. **View your dashboard**:
   - See daily calorie summary
   - View saved meals

---

## Troubleshooting

### Backend won't start

**Problem**: `Error: Cannot find module 'express'`
- **Solution**: Run `npm install` in the backend folder

**Problem**: `MongoDB connection error`
- **Solution**: Make sure MongoDB is running (STEP 1)
- **Check**: Your `.env` file has the correct MONGODB_URI

**Problem**: `Port 5000 already in use`
- **Solution**: Change PORT in `.env` file to another number (e.g., 5001)

### Frontend won't start

**Problem**: `Error: Cannot find module 'react'`
- **Solution**: Run `npm install` in the frontend folder

**Problem**: `Module not found: Can't resolve 'axios'`
- **Solution**: Run `npm install` in the frontend folder

### API calls fail

**Problem**: "Network Error" or "Failed to fetch"
- **Solution**: Make sure backend is running on port 5000
- **Check**: Open `http://localhost:5000` in browser - should show API message

### Camera not working

**Problem**: "Error accessing camera"
- **Solution**: 
  - Allow camera permissions in browser
  - Use HTTPS (or localhost - already secure)
  - Check if camera is being used by another app

---

## Quick Command Reference

### Backend Terminal:
```bash
cd calorie-tracker/backend
npm install          # First time only
npm run dev          # Start backend (development)
npm start            # Start backend (production)
```

### Frontend Terminal:
```bash
cd calorie-tracker/frontend
npm install          # First time only
npm start            # Start frontend
```

---

## Next Steps After Setup

1. ✅ Create your account
2. ✅ Try analyzing some food images
3. ✅ Save meals and track calories
4. ✅ Check your dashboard daily

---

## Need Help?

- Check the console for error messages
- Make sure both servers are running
- Verify MongoDB is running
- Check `.env` files are configured correctly

---

**Happy calorie tracking! 🍎**

