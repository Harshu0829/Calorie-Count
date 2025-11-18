# Calorie Tracker - MERN Stack Application

A full-stack calorie tracking application built with MongoDB, Express.js, React, and Node.js. Features AI-powered food recognition with real-time camera calorie counting and image upload functionality.

## Features

- 📷 **On-Camera Calorie Counting**: Real-time food recognition using your device's camera
- 📁 **Image Upload**: Upload food images for calorie analysis
- 🎯 **AI-Powered Recognition**: Automatic food detection and calorie calculation
- 📊 **Nutritional Information**: Detailed breakdown of calories, protein, carbs, and fat
- 👤 **User Authentication**: Secure user registration and login
- 📝 **Meal Tracking**: Save and track your meals with daily summaries
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

- **Frontend**: React, React Router, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Image Processing**: Sharp, Multer

## Project Structure

```
calorie-tracker/
├── backend/
│   ├── models/          # MongoDB models (User, Food, Meal)
│   ├── routes/          # API routes (auth, foods, meals, analyze)
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Utility functions (food database)
│   ├── scripts/         # Database seeding scripts
│   ├── server.js        # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (AuthContext)
│   │   ├── services/    # API service
│   │   └── App.js       # Main App component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd calorie-tracker/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calorie-tracker
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. Seed the food database (optional):
```bash
node scripts/seedFoods.js
```

6. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd calorie-tracker/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/names` - Get list of food names
- `POST /api/foods/calculate` - Calculate calories for a food
- `GET /api/foods/search?q=query` - Search foods

### Meals (Protected)
- `GET /api/meals` - Get all meals for user
- `GET /api/meals/summary?date=YYYY-MM-DD` - Get daily summary
- `POST /api/meals` - Create a meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

### Analysis
- `POST /api/analyze/image` - Analyze uploaded image and return calorie count

## Usage

### Register/Login
1. Click "Sign Up" to create a new account
2. Fill in your details (name, email, password, etc.)
3. Or login if you already have an account

### Camera Mode
1. Navigate to the home page
2. Click the "📷 Camera" tab
3. Click "Start Camera" to access your device's camera
4. Point the camera at your food
5. Click "Capture & Analyze" to take a photo
6. Click "Analyze This Image" to get calorie information
7. Save the meal if logged in

### Upload Mode
1. Click the "📁 Upload Image" tab
2. Drag and drop a food image, or click to browse
3. Click "Analyze Image" to get calorie information
4. Save the meal if logged in

### Dashboard
1. After logging in, go to the Dashboard
2. View your daily calorie summary
3. See all meals for the selected date
4. Track your progress

## Database Schema

### User Model
- name, email, password (hashed)
- age, gender, height, weight
- activityLevel
- dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal

### Food Model
- name, displayName
- calories, protein, carbs, fat (per 100g)
- servingSize, category

### Meal Model
- user (reference)
- mealType (breakfast, lunch, dinner, snack)
- foods (array with nutrition info)
- date
- notes

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Future Enhancements

- Integration with ML models for more accurate food recognition
- Barcode scanning for packaged foods
- Meal planning and recipes
- Progress charts and analytics
- Social features (sharing meals, challenges)
- Mobile app (React Native)
- Integration with fitness trackers

## Notes

- For production use, integrate a trained food recognition ML model for better accuracy
- The current implementation uses heuristics for food detection
- Consider using MongoDB Atlas for cloud database hosting
- Deploy frontend to Vercel/Netlify and backend to Heroku/Railway

## License

ISC
