# Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### 1. MongoDB Setup
```bash
# Option A: Start local MongoDB
net start MongoDB          # Windows
sudo systemctl start mongod  # Linux/Mac

# Option B: Use MongoDB Atlas (free cloud)
# Sign up at https://www.mongodb.com/cloud/atlas
# Copy connection string to .env file
```

### 2. Backend Setup
```bash
cd calorie-tracker/backend
npm install
# Create .env file (see .env.example)
node scripts/seedFoods.js  # Optional: populate food database
npm run dev                # Start backend (port 5000)
```

### 3. Frontend Setup
```bash
cd calorie-tracker/frontend
npm install
npm start                  # Start frontend (port 3000)
```

### 4. Open Browser
Go to: http://localhost:3000

---

## Required .env File

Create `calorie-tracker/backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calorie-tracker
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

For MongoDB Atlas, replace MONGODB_URI with your Atlas connection string.

---

## Verify Everything Works

1. Backend: http://localhost:5000 → Should show API message
2. Frontend: http://localhost:3000 → Should show app
3. Test: Try analyzing a food image!

---

**Need detailed instructions? See SETUP_GUIDE.md**

