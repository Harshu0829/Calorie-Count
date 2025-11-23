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

        // Calculate total base weight to determine scaling factor
        let totalBaseWeight = 0;
        for (const foodInfo of detectedFoods) {
            totalBaseWeight += estimateWeight(foodInfo.name);
        }

        // Determine scaling factor if user provided weight
        let scalingFactor = 1.0;
        if (req.body.weight && !isNaN(req.body.weight) && totalBaseWeight > 0) {
            scalingFactor = parseFloat(req.body.weight) / totalBaseWeight;
        }

        // Calculate calories for each detected food
        const results = [];
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalVitaminA = 0;
        let totalVitaminC = 0;
        let totalCalcium = 0;
        let totalIron = 0;

        for (const foodInfo of detectedFoods) {
            const foodName = foodInfo.name;
            const baseWeight = estimateWeight(foodName);
            const weight = baseWeight * scalingFactor;
            const calorieInfo = calculateCalories(foodName, weight);

            results.push({
                ...calorieInfo,
                confidence: foodInfo.confidence
            });

            totalCalories += calorieInfo.calories;
            totalProtein += calorieInfo.protein;
            totalCarbs += calorieInfo.carbs;
            totalFat += calorieInfo.fat;

            if (calorieInfo.micronutrients) {
                totalVitaminA += calorieInfo.micronutrients.vitaminA;
                totalVitaminC += calorieInfo.micronutrients.vitaminC;
                totalCalcium += calorieInfo.micronutrients.calcium;
                totalIron += calorieInfo.micronutrients.iron;
            }
        }

        res.json({
            detected_foods: results,
            totals: {
                calories: Math.round(totalCalories * 10) / 10,
                protein: Math.round(totalProtein * 10) / 10,
                carbs: Math.round(totalCarbs * 10) / 10,
                fat: Math.round(totalFat * 10) / 10,
                micronutrients: {
                    vitaminA: Math.round(totalVitaminA * 10) / 10,
                    vitaminC: Math.round(totalVitaminC * 10) / 10,
                    calcium: Math.round(totalCalcium * 10) / 10,
                    iron: Math.round(totalIron * 10) / 10
                }
            }
        });
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ message: error.message || 'Error analyzing image' });
    }
});

module.exports = router;

