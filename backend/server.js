const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables');
    process.exit(1);
}
const runMigration = async () => {
    try {
        const db = mongoose.connection.db;
        const MealEntry = require('./models/MealEntry');

        // 1. Migrate FoodAnalysis -> MealEntry
        const foodAnalysisColl = db.collection('foodanalyses');
        const legacyAI = await foodAnalysisColl.find({}).toArray();

        if (legacyAI.length > 0) {
            console.log(`Migrating ${legacyAI.length} AI analysis entries...`);
            for (const entry of legacyAI) {
                const exists = await MealEntry.findOne({
                    user: entry.user,
                    date: entry.date,
                    foodName: entry.foodName,
                    calories: entry.calories
                });

                if (!exists) {
                    await MealEntry.create({
                        user: entry.user,
                        mealType: 'snack',
                        foodName: entry.foodName,
                        portion: entry.servingSize || 100,
                        calories: entry.calories || 0,
                        protein: entry.protein || 0,
                        carbs: entry.carbs || 0,
                        fat: entry.fat || 0,
                        micronutrients: entry.micronutrients || {},
                        entryType: 'ai',
                        confidence: entry.confidence || 0.8,
                        date: entry.date
                    });
                }
            }
            console.log('AI migration complete.');
        }

        // 2. Migrate ManualMeal -> MealEntry
        const manualMealColl = db.collection('manualmeals');
        const legacyManual = await manualMealColl.find({}).toArray();

        if (legacyManual.length > 0) {
            console.log(`Migrating ${legacyManual.length} manual meal entries...`);
            for (const entry of legacyManual) {
                const exists = await MealEntry.findOne({
                    user: entry.user,
                    date: entry.date,
                    foodName: entry.description,
                    calories: entry.calories
                });

                if (!exists) {
                    await MealEntry.create({
                        user: entry.user,
                        mealType: entry.mealType || 'snack',
                        foodName: entry.description,
                        portion: entry.portion || 100,
                        calories: entry.calories || 0,
                        protein: entry.protein || 0,
                        carbs: entry.carbs || 0,
                        fat: entry.fat || 0,
                        entryType: 'manual',
                        date: entry.date
                    });
                }
            }
            console.log('Manual migration complete.');
        }
    } catch (err) {
        console.error('Migration error:', err);
    }
};

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
})
    .then(() => {
        console.log('MongoDB Connected');
        runMigration();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const mealRoutes = require('./routes/meals');
const manualMealRoutes = require('./routes/manualMeals');
const foodAnalysisRoutes = require('./routes/foodRoutes');

// Routes - Mount everything under /api
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/manual-meals', manualMealRoutes);
app.use('/api/food', foodAnalysisRoutes);

// Health check endpoints (placed after routes for clarity)
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Calorie Tracker API',
        status: 'running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: process.env.NODE_ENV
    });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../frontend/build');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        // If it's an API route that wasn't caught, return 404
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: `API endpoint ${req.path} not found` });
        }
        // Otherwise serve index.html
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// Export app for serverless
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} else {
    module.exports = app;
}

