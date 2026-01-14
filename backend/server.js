const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorie-tracker';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

// Database connection check middleware
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database connection not established. Please check environment variables.',
            status: 'error'
        });
    }
    next();
};

// Create a router for all API routes
const apiRouter = express.Router();
apiRouter.use(checkDbConnection);

// Mount routes to apiRouter
apiRouter.use('/auth', authRoutes);
apiRouter.use('/foods', foodRoutes);
apiRouter.use('/meals', mealRoutes);
apiRouter.use('/manual-meals', manualMealRoutes);
apiRouter.use('/analyze', analyzeRoutes);
apiRouter.use('/food', foodAnalysisRoutes);

// Main API routes
app.use('/api', apiRouter);

// Fallback: Also handle routes without /api prefix (for some serverless environments)
app.use('/', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    // Only pass to apiRouter if it doesn't look like a static file request
    if (!req.path.includes('.')) {
        return apiRouter(req, res, next);
    }
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        message: 'Calorie Tracker API',
        status: 'running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Calorie Tracker API',
        status: 'running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve static assets in production/local dev
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) => {
        // Don't handle API routes in the catch-all for static files
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: `API endpoint ${req.path} not found` });
        }

        const indexPath = path.resolve(__dirname, '../frontend', 'build', 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                // If index.html is missing, return a clean error
                res.status(404).json({
                    message: "Frontend build not found. Please ensure the project is built.",
                    status: "error",
                    error: err.message
                });
            }
        });
    });
}

// Export app for serverless functions, or start server if running directly
if (require.main === module) {
    // Running directly (development)
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} else {
    // Exported as module (for serverless)
    module.exports = app;
}

