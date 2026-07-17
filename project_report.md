
# 🚀 APEX — AI-Powered Calorie & Nutrition Tracker
## Project Delivery Report · Version 1.0 · May 2026

---

> **Prepared by:** Development Team  
> **Prepared for:** Client Delivery  
> **Repository:** `Harshu0829/Calorie-Count`  
> **Application Name:** Apex  
> **Date:** 14 May 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Features & Functionality](#5-features--functionality)
6. [Application Pages & User Flow](#6-application-pages--user-flow)
7. [Backend API Reference](#7-backend-api-reference)
8. [Database Schema](#8-database-schema)
9. [AI & Intelligence Layer](#9-ai--intelligence-layer)
10. [Security Implementation](#10-security-implementation)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Environment Configuration](#12-environment-configuration)
13. [Project File Structure](#13-project-file-structure)
14. [Dependencies](#14-dependencies)
15. [Future Roadmap](#15-future-roadmap)
16. [Delivery Checklist](#16-delivery-checklist)

---

## 1. Executive Summary

**Apex** is a full-stack, AI-powered calorie and nutrition tracking web application built on the MERN stack (MongoDB, Express.js, React, Node.js). The application empowers users to monitor their daily food intake, track macronutrients (calories, protein, carbohydrates, fat), and receive AI-generated nutritional analysis from either food images or text descriptions.

The system integrates **Google Gemini 1.5 Flash** (a multimodal large language model) to identify food from photos and return accurate nutritional breakdowns in real time. Users can also manually search from a curated food database covering hundreds of Indian and international foods.

Key highlights:
- Full user authentication with JWT tokens and Google OAuth
- AI image analysis via camera capture or file upload
- Manual food logging with a searchable nutritional database
- Personalized daily macro goals computed from user biometrics
- Onboarding wizard collecting health profile and fitness goals
- Interactive dashboard with progress rings and history charts
- Password reset via email (Nodemailer / Gmail OAuth2)
- Deployed on **Vercel** (frontend) and **Render** (backend)

---

## 2. Project Overview

| Field | Detail |
|---|---|
| **Project Name** | Apex – Calorie & Nutrition Tracker |
| **Type** | Full-Stack Progressive Web Application |
| **Architecture** | MERN Stack (MongoDB · Express · React · Node.js) |
| **AI Model** | Google Gemini 1.5 Flash (Vision + Text) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render (Node.js server) |
| **Database** | MongoDB Atlas (Cloud) |
| **Authentication** | JWT (7-day tokens) + Google OAuth |
| **Version** | 1.0.0 (Backend) · 0.1.0 (Frontend) |
| **License** | ISC |

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| React Router DOM | 6.21.1 | Client-side routing |
| Axios | 1.6.2 | HTTP client for API calls |
| Framer Motion | 12.23.24 | Animations & transitions |
| Recharts | 3.4.1 | Charts & data visualization |
| React Icons | 5.5.0 | Icon library |
| React Scripts | 5.0.1 | Build toolchain (CRA) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥14 | JavaScript runtime |
| Express.js | 4.18.2 | REST API framework |
| Mongoose | 8.0.3 | MongoDB ODM |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| Multer | 1.4.5-lts.1 | File/image uploads |
| Sharp | 0.33.1 | Image processing |
| Nodemailer | 7.0.11 | Email service |
| express-rate-limit | 8.2.1 | API rate limiting |
| dotenv | 16.3.1 | Environment config |
| nodemon | 3.0.2 | Dev hot-reload |

### AI / External APIs
| Service | Purpose |
|---|---|
| Google Gemini 1.5 Flash (`@google/generative-ai ^0.24.1`) | Food image recognition & text-based nutrition lookup |
| OpenAI SDK (`openai ^6.10.0`) | Secondary AI fallback (installed, configurable) |
| Nodemailer + Gmail | Transactional email (password reset) |

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────┐
│                 CLIENT (Browser)                 │
│         React 19 SPA — hosted on Vercel          │
│                                                  │
│  Pages: Home · Login · Register · Dashboard      │
│         History · Profile · FoodUpload           │
│         FoodHistory · OnboardingWizard           │
│  Components: Navbar · Footer · CameraCapture     │
│              CircularProgress · Results           │
└───────────────────┬──────────────────────────────┘
                    │ HTTPS REST (Axios)
                    ▼
┌──────────────────────────────────────────────────┐
│              BACKEND (Node / Express)            │
│               hosted on Render                   │
│                                                  │
│  Routes:   /api/auth        Authentication       │
│            /api/foods       Food database        │
│            /api/meals       Meal CRUD            │
│            /api/manual-meals Manual entries      │
│            /api/food        AI food analysis     │
│            /api/health      Health check         │
│                                                  │
│  Middleware: JWT Auth · CORS · Rate Limiter      │
│  Utils:      aiService · emailService            │
│              foodDatabase · nutritionCalculator  │
└────────────┬─────────────────────┬───────────────┘
             │                     │
             ▼                     ▼
┌──────────────────┐   ┌───────────────────────────┐
│  MongoDB Atlas   │   │  Google Gemini 1.5 Flash  │
│  Collections:    │   │  (Multimodal AI API)      │
│  users           │   │  · Image → Nutrition JSON │
│  mealentries     │   │  · Text  → Nutrition JSON │
│  meals           │   └───────────────────────────┘
│  foods           │
└──────────────────┘
```

---

## 5. Features & Functionality

### 5.1 User Authentication
- **Register** with name, email, password, age, gender, height, weight, activity level, medical history
- **Login** with email + password (bcrypt verification, JWT issued)
- **Google OAuth** — sign in with Google account (no password required)
- **Forgot Password** — sends a time-limited reset link via email
- **Reset Password** — secure token-based reset (SHA-256 hashed, 1-hour expiry)
- **Protected Routes** — all authenticated pages redirect to `/login` if no valid token

### 5.2 Onboarding Wizard
- Multi-step guided setup after first registration
- Collects: fitness goal (lose / maintain / gain), target weight, activity level, medical history
- Auto-calculates personalized daily calorie and macro goals
- Prevents access to main app until onboarding is complete

### 5.3 AI Food Analysis
- **Camera Mode** — access device camera, capture photo, analyze with Gemini Vision
- **Upload Mode** — drag-and-drop or browse for a food image; analyzed by Gemini
- **Text Search** — type a food name and weight in grams; Gemini returns macros
- Returns: food name, calories, protein, carbs, fat, serving size, micronutrients (Vitamin A, C, Calcium, Iron), confidence score

### 5.4 Food Database (Manual Logging)
- Searchable database of hundreds of foods (Indian + international)
- Aliases for regional variants (roti, dal, rice, etc.)
- Per-100g nutritional values stored in MongoDB
- Users can specify portion size in grams

### 5.5 Dashboard
- Live daily progress rings (calories, protein, carbs, fat)
- Date picker to browse any day's meals
- Meal type sections: Breakfast · Lunch · Dinner · Snack
- Add, view, and delete meal entries
- Real-time summary: consumed vs. remaining macros

### 5.6 History
- View past meal logs by date
- Visual calorie trend charts (Recharts)
- Filter by date range

### 5.7 Food Upload History
- Dedicated log of all AI-analyzed food images
- Timestamps, nutritional data, and confidence scores

### 5.8 User Profile
- View and edit: name, age, height, weight, activity level
- Update daily macro goals
- Weight & height history (auto-logged on every update)
- Goal history tracking
- Delete individual history entries

### 5.9 Keep-Alive Mechanism
- Frontend pings `/api/health` on app load to wake the Render free-tier backend, preventing cold-start delays

---

## 6. Application Pages & User Flow

```
/ (Home)
  ├── /register         New user sign-up
  ├── /login            Email/password or Google
  ├── /forgot-password  Request password reset email
  └── /reset-password/:token  Set new password

  [Protected — requires JWT + completed onboarding]
  ├── /onboarding       First-time health profile setup
  ├── /dashboard        Daily macro tracker + meal log
  ├── /history          Calendar-based meal history + charts
  ├── /upload-food      AI food analysis (camera or image)
  ├── /food-history     Log of all AI-analyzed entries
  └── /profile          User settings + biometric history
```

**Route Guard Logic:**
1. No token → redirect to `/login`
2. Token valid, onboarding incomplete → redirect to `/onboarding`
3. Token valid, onboarding complete, visits `/onboarding` → redirect to `/dashboard`

---

## 7. Backend API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create new account |
| POST | `/login` | Public | Login, receive JWT |
| GET | `/me` | JWT | Get current user profile |
| PUT | `/profile` | JWT | Update profile & goals |
| POST | `/onboarding` | JWT | Complete onboarding |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password/:token` | Public | Set new password |
| POST | `/google` | Public | Google OAuth sign-in |

### Foods — `/api/foods`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all foods |
| GET | `/names` | Public | List all food names |
| GET | `/search?q=query` | Public | Search food database |
| POST | `/calculate` | Public | Calculate calories for food + quantity |

### Meals — `/api/meals`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Get all meals for user |
| GET | `/summary?date=YYYY-MM-DD` | JWT | Daily macro summary |
| POST | `/` | JWT | Log new meal |
| PUT | `/:id` | JWT | Edit meal entry |
| DELETE | `/:id` | JWT | Delete meal entry |

### Manual Meals — `/api/manual-meals`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Get all manual meal entries |
| POST | `/` | JWT | Add manual meal entry |
| DELETE | `/:id` | JWT | Delete entry |

### AI Food Analysis — `/api/food`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/analyze` | JWT | Analyze food image (multipart) |
| POST | `/analyze-text` | JWT | Analyze food by text + weight |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server + DB status check |

---

## 8. Database Schema

### User Collection

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed (min 6 chars) |
| `authProvider` | Enum | `local` / `google` / `facebook` / `mobile` |
| `profilePicture` | String | URL |
| `phoneNumber` | String | Optional |
| `age` | Number | 1–120 |
| `gender` | Enum | `male` / `female` / `other` |
| `height` | Number | cm |
| `weight` | Number | kg |
| `activityLevel` | Enum | sedentary → extremely_active |
| `dailyCalorieGoal` | Number | Default: 2000 kcal |
| `dailyProteinGoal` | Number | Default: 50 g |
| `dailyCarbsGoal` | Number | Default: 250 g |
| `dailyFatGoal` | Number | Default: 65 g |
| `weightHistory` | Array | `{ weight, date }` — logged on every update |
| `heightHistory` | Array | `{ height, date }` — logged on every update |
| `goalHistory` | Array | `{ calorie/protein/carbs/fat goals, date }` |
| `resetPasswordToken` | String | SHA-256 hashed token |
| `resetPasswordExpires` | Date | 1-hour expiry |
| `hasCompletedOnboarding` | Boolean | Default: false |
| `targetWeight` | Number | kg |
| `goalType` | Enum | `lose` / `maintain` / `gain` |
| `medicalHistory` | Enum | none / diabetes / hypertension / hypothyroidism / kidney_issues / other |

### MealEntry Collection *(primary log)*

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Ref: User |
| `mealType` | Enum | breakfast / lunch / dinner / snack |
| `foodName` | String | Required |
| `portion` | Number | grams, default 100 |
| `calories` | Number | kcal |
| `protein` | Number | g |
| `carbs` | Number | g |
| `fat` | Number | g |
| `micronutrients` | Object | vitaminA (mcg), vitaminC (mg), calcium (mg), iron (mg) |
| `entryType` | Enum | `manual` / `ai` / `search` |
| `foodState` | Enum | `raw` / `cooked` |
| `confidence` | Number | 0.0 – 1.0 (AI confidence score) |
| `imageMetadata` | Object | originalName, size, mimeType |
| `date` | Date | Entry date |

> **Index:** `{ user: 1, date: -1 }` for fast date-range queries

### Meal Collection *(structured logs)*

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Ref: User |
| `mealType` | Enum | breakfast / lunch / dinner / snack |
| `foods` | Array | Sub-documents: food ref, foodName, quantity, calories, protein, carbs, fat, confidence, imageUrl |
| `totalCalories` | Number | Auto-computed on save |
| `totalProtein` | Number | Auto-computed on save |
| `totalCarbs` | Number | Auto-computed on save |
| `totalFat` | Number | Auto-computed on save |
| `date` | Date | |
| `notes` | String | Optional |

### Food Collection *(database)*

| Field | Type | Notes |
|---|---|---|
| `name` | String | Canonical name (lowercase) |
| `displayName` | String | Pretty name |
| `calories` | Number | Per 100g |
| `protein` | Number | Per 100g |
| `carbs` | Number | Per 100g |
| `fat` | Number | Per 100g |
| `servingSize` | Number | Common serving in grams |
| `category` | String | e.g., grain, legume, dairy |

---

## 9. AI & Intelligence Layer

### Google Gemini 1.5 Flash Integration

**File:** `backend/utils/aiService.js`

The AI service uses **lazy initialization** — the Gemini client is created only when the first request arrives, ensuring environment variables are already loaded.

#### Text-Based Nutrition Analysis
```
Input:  foodName (string) + weightGrams (number) + foodState (raw|cooked)
Output: { foodName, calories, protein, carbs, fat, servingSize,
          micronutrients: { vitaminA, vitaminC, calcium, iron }, confidence }
```
- Prompts Gemini to return nutrition values **exactly for the given weight**, not per 100g
- Response is JSON (using `responseMimeType: "application/json"`)
- Fallback: regex JSON extraction if markdown-wrapped response

#### Image-Based Nutrition Analysis
```
Input:  base64Image (string) + mimeType (string)
Output: { foodName, calories, protein, carbs, fat, servingSize,
          estimatedWeight, micronutrients, confidence }
```
- Sends image inline as `inlineData` to Gemini Vision
- Gemini estimates weight and returns nutrition for that estimated weight

#### Food Database Fallback
When Gemini is unavailable, the system falls back to the local food database (`backend/utils/foodDatabase.js`) which contains 300+ foods with Indian and international entries, regional aliases, and corrected macros (e.g., roti, dal, rice variants).

---

## 10. Security Implementation

| Mechanism | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with salt rounds = 10 |
| **JWT Authentication** | 7-day expiry; signed with `JWT_SECRET` env var |
| **Rate Limiting (Auth)** | 10 requests / 15 minutes per IP |
| **Rate Limiting (Login)** | 5 attempts / 15 minutes per IP |
| **CORS Policy** | Whitelist: `localhost:3000`, `localhost:5173`, `*.vercel.app`, configurable `FRONTEND_URL` |
| **Password Reset Token** | `crypto.randomBytes(32)` → SHA-256 hashed in DB; 1-hour TTL |
| **Input Validation** | Mongoose schema validators (enum, min, max, required) |
| **File Upload Validation** | MIME type + extension check (jpeg/jpg/png/gif/webp); 10 MB limit |
| **Request Size Limit** | JSON body: 10 MB |
| **Auth Middleware** | JWT verified on every protected route before handler executes |

---

## 11. Deployment & Infrastructure

### Frontend — Vercel

| Setting | Value |
|---|---|
| Platform | Vercel |
| Build Command | `npm run build` |
| Output Directory | `frontend/build` |
| Framework | Create React App |
| Routing | SPA rewrite: all paths → `/index.html` |
| Environment Var | `REACT_APP_API_URL` = backend URL |

### Backend — Render

| Setting | Value |
|---|---|
| Platform | Render (Node.js web service) |
| Start Command | `node server.js` |
| Port | `process.env.PORT` (Render assigns dynamically) |
| Database | MongoDB Atlas (cloud) |
| Environment Vars | `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`, `EMAIL_USER`, `EMAIL_PASSWORD` |

### Database — MongoDB Atlas
- Cloud-hosted MongoDB
- Connection pooling: `maxPoolSize: 10`
- Indexed collections for fast queries

### Keep-Alive Strategy
The frontend sends a ping to `/api/health` on every app load. This wakes the Render free-tier instance from sleep, reducing cold-start wait time for users.

### Data Migration
On server start, `runMigration()` automatically migrates legacy `foodanalyses` and `manualmeals` collections into the unified `mealentries` collection, ensuring backward compatibility.

---

## 12. Environment Configuration

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/calorie-tracker
JWT_SECRET=<random_secret_string>
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Google Gemini AI
GEMINI_API_KEY=<your_gemini_api_key>

# Email Service (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=<gmail_app_password>
```

### Frontend `.env`

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 13. Project File Structure

```
calorie-tracker/
├── vercel.json                  # Vercel deployment config
├── package.json                 # Root scripts
├── README.md
│
├── backend/
│   ├── server.js                # Express app entry point
│   ├── package.json
│   ├── .env                     # Environment variables
│   ├── START_BACKEND.bat        # Windows dev launcher
│   │
│   ├── models/
│   │   ├── User.js              # User schema + password hashing
│   │   ├── Meal.js              # Structured meal schema
│   │   ├── MealEntry.js         # Unified meal entry schema
│   │   └── Food.js              # Food database schema
│   │
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints (register/login/OAuth/reset)
│   │   ├── foods.js             # Food DB endpoints
│   │   ├── meals.js             # Meal CRUD endpoints
│   │   ├── manualMeals.js       # Manual entry endpoints
│   │   └── foodRoutes.js        # AI analysis endpoints
│   │
│   ├── controllers/
│   │   └── foodController.js    # AI analysis logic
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   │
│   ├── utils/
│   │   ├── aiService.js         # Gemini 1.5 Flash integration
│   │   ├── emailService.js      # Nodemailer email service
│   │   ├── foodDatabase.js      # 300+ food entries (Indian + international)
│   │   ├── nutritionCalculator.ts  # Macro calculation helpers
│   │   └── macroTracker.ts      # Macro tracking utilities
│   │
│   └── scripts/
│       ├── seedFoods.js         # DB seeder for food collection
│       └── testMacroAccuracy.js # Accuracy validation script
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html           # App title: "Apex"
    │
    └── src/
        ├── App.js               # Router + ProtectedRoute + KeepAlive
        ├── App.css
        ├── index.js
        │
        ├── context/
        │   └── AuthContext.js   # Global auth state (React Context)
        │
        ├── services/            # API service layer (Axios wrappers)
        │
        ├── pages/
        │   ├── Home.js / .css          # Landing page
        │   ├── Login.js                # Email + Google login
        │   ├── Register.js             # Registration form
        │   ├── ForgotPassword.js       # Request reset email
        │   ├── ResetPassword.js        # Set new password
        │   ├── OnboardingWizard.js/.css  # First-time setup
        │   ├── Dashboard.js / .css     # Daily tracker + meal log
        │   ├── History.js / .css       # Calendar history + charts
        │   ├── FoodUpload.jsx / .css   # AI image analysis
        │   ├── FoodHistory.jsx / .css  # AI analysis history log
        │   └── Profile.js / .css       # User settings
        │
        └── components/
            ├── Navbar.js / .css
            ├── Footer.js / .css
            ├── BottomNavigation.js / .css
            ├── CameraCapture.js / .css  # Camera access + capture
            ├── ImageUpload.js / .css    # Drag-and-drop upload
            ├── CircularProgress.js / .css  # Macro rings
            ├── Results.js / .css        # AI result display
            └── OnboardingSteps.js       # Wizard step components
```

---

## 14. Dependencies

### Backend (`backend/package.json`)

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^8.2.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^7.0.11",
    "openai": "^6.10.0",
    "sharp": "^0.33.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "framer-motion": "^12.23.24",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^6.21.1",
    "react-scripts": "5.0.1",
    "recharts": "^3.4.1",
    "web-vitals": "^2.1.4"
  }
}
```

---

## 15. Future Roadmap

| Priority | Feature |
|---|---|
| 🔴 High | Barcode scanning for packaged food products |
| 🔴 High | Mobile app (React Native — Android & iOS) |
| 🟡 Medium | Meal planning & weekly schedule |
| 🟡 Medium | Recipe builder with aggregate nutrition |
| 🟡 Medium | Integration with fitness trackers (Apple Health, Google Fit) |
| 🟡 Medium | Progress charts & body metrics analytics |
| 🟢 Low | Social features: share meals, challenges, leaderboards |
| 🟢 Low | Barcode scanner for grocery items |
| 🟢 Low | Nutritionist consultation booking |
| 🟢 Low | Multi-language support (Hindi, regional Indian languages) |

---

## 16. Delivery Checklist

### Code & Repository
- [x] Full MERN stack codebase committed to GitHub (`Harshu0829/Calorie-Count`)
- [x] `.gitignore` configured (excludes `node_modules`, `.env`, build artifacts)
- [x] `README.md` with setup instructions
- [x] `LICENSE` (ISC) included
- [x] `Copyright.md` included

### Backend
- [x] Express REST API with 5 route modules
- [x] MongoDB schemas: User, Meal, MealEntry, Food
- [x] JWT authentication middleware
- [x] Rate limiting on auth endpoints
- [x] CORS configured for Vercel + localhost
- [x] Multer file upload (10 MB, image-only)
- [x] Google Gemini AI integration (text + vision)
- [x] Email service (Nodemailer + Gmail)
- [x] Password reset with secure token (SHA-256, 1hr TTL)
- [x] Google OAuth endpoint
- [x] Data migration script (legacy → unified schema)
- [x] Health check endpoint
- [x] Food database seeder script

### Frontend
- [x] React 19 SPA with React Router v6
- [x] Protected routes with onboarding enforcement
- [x] AuthContext for global state management
- [x] All 9 pages implemented
- [x] Camera capture component
- [x] Drag-and-drop image upload
- [x] Circular progress rings
- [x] Recharts history graphs
- [x] Framer Motion animations
- [x] Keep-alive backend ping
- [x] Vercel deployment config

### Deployment
- [x] Frontend deployed on Vercel
- [x] Backend deployed on Render
- [x] MongoDB Atlas cloud database
- [x] Environment variables configured on both platforms
- [x] Google site verification tag in `index.html`

---

*Report generated: 14 May 2026 | Apex v1.0 | Prepared for client delivery*
