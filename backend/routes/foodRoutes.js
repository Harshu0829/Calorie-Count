const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
    analyzeFood,
    getFoodHistory,
    getDailyTotals,
    deleteFoodEntry
} = require('../controllers/foodController');
const protect = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// All routes require authentication
router.use(protect);

const rateLimit = require('express-rate-limit');

// Rate limiter for AI analysis (expensive)
const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 analysis requests per hour
    message: { message: 'Too many food analysis requests, please try again after an hour' }
});

// POST /api/food/analyze - Upload and analyze food image
router.post('/analyze', analyzeLimiter, upload.single('image'), analyzeFood);

// GET /api/food/history - Get user's food analysis history
router.get('/history', getFoodHistory);

// GET /api/food/daily-totals - Get today's nutritional totals
router.get('/daily-totals', getDailyTotals);

// DELETE /api/food/:id - Delete a food entry
router.delete('/:id', deleteFoodEntry);

module.exports = router;
