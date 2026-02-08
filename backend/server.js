const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow all or specific origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorie-tracker';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => console.log('MongoDB Connected'))
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
const analyzeRoutes = require('./routes/analyze');
const foodAnalysisRoutes = require('./routes/foodRoutes');

// Routes - Mount everything under /api
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/manual-meals', manualMealRoutes);
app.use('/api/analyze', analyzeRoutes);
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

