# How to Start the Backend Server

## Quick Start (Easiest Method)

### Windows:
1. **Double-click** `START_BACKEND.bat` in the `backend` folder
   - OR right-click → "Run as Administrator"

### macOS/Linux:
```bash
cd calorie-tracker/backend
npm run dev
```

---

## Manual Method (Step-by-Step)

### Step 1: Start MongoDB
**Windows:**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### Step 2: Navigate to Backend Folder
```bash
cd calorie-tracker/backend
```

### Step 3: Start the Server
```bash
npm run dev
```

---

## What You'll See

When the backend starts successfully, you'll see:
```
Server running on port 5000
MongoDB Connected
```

**✅ Backend is ready!**

---

## Troubleshooting

### MongoDB Not Running
**Error:** `MongoDB connection error`

**Solution:**
- Make sure MongoDB is started (Step 1 above)
- Check if MongoDB service is running: `net start MongoDB` (Windows)

### Port Already in Use
**Error:** `Port 5000 already in use`

**Solution:**
- Change `PORT` in `.env` file to another number (e.g., `PORT=5001`)
- Or stop the process using port 5000

### Dependencies Not Installed
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd calorie-tracker/backend
npm install
```

---

## Quick Commands Reference

```bash
# Start backend (development mode with auto-restart)
npm run dev

# Start backend (production mode)
npm start

# Install dependencies (if needed)
npm install

# Seed food database (optional, if database is empty)
node scripts/seedFoods.js
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.






