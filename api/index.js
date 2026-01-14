const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes using absolute paths for Vercel bundling
const authRoutes = require('../backend/routes/auth');
const foodRoutes = require('../backend/routes/foods');
const mealRoutes = require('../backend/routes/meals');
const manualMealRoutes = require('../backend/routes/manualMeals');
const analyzeRoutes = require('../backend/routes/analyze');
const foodAnalysisRoutes = require('../backend/routes/foodRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorie-tracker';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/manual-meals', manualMealRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/food', foodAnalysisRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Calorie Tracker API',
        status: 'running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: process.env.NODE_ENV
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(process.cwd(), 'frontend/build');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: `API endpoint ${req.path} not found` });
        }
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// Export for serverless
module.exports = app;

// Start if running directly
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
