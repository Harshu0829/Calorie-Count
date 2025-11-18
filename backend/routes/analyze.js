const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { detectFoodInImage, estimateWeight, calculateCalories } = require('../utils/foodDatabase');

const router = express.Router();

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

// Analyze uploaded image
router.post('/image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        
        // Process image with sharp
        const imageBuffer = req.file.buffer;
        
        // Validate image
        try {
            const metadata = await sharp(imageBuffer).metadata();
            if (!metadata.width || !metadata.height) {
                return res.status(400).json({ message: 'Invalid image format' });
            }
        } catch (error) {
            return res.status(400).json({ message: 'Invalid image format' });
        }
        
        // Detect foods in image
        const detectedFoods = detectFoodInImage(imageBuffer);
        
        // Calculate calories for each detected food
        const results = [];
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        
        for (const foodInfo of detectedFoods) {
            const foodName = foodInfo.name;
            const weight = estimateWeight(foodName);
            const calorieInfo = calculateCalories(foodName, weight);
            
            results.push({
                ...calorieInfo,
                confidence: foodInfo.confidence
            });
            
            totalCalories += calorieInfo.calories;
            totalProtein += calorieInfo.protein;
            totalCarbs += calorieInfo.carbs;
            totalFat += calorieInfo.fat;
        }
        
        res.json({
            detected_foods: results,
            totals: {
                calories: Math.round(totalCalories * 10) / 10,
                protein: Math.round(totalProtein * 10) / 10,
                carbs: Math.round(totalCarbs * 10) / 10,
                fat: Math.round(totalFat * 10) / 10
            }
        });
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ message: error.message || 'Error analyzing image' });
    }
});

module.exports = router;

