const MealEntry = require('../models/MealEntry');
const aiService = require('../utils/aiService');

/**
 * Analyze food image using Claude Vision API
 */
exports.analyzeFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Convert image buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Call AI Service for image analysis
        const nutritionData = await aiService.analyzeFoodImage(base64Image, mimeType);

        // Validate required fields
        if (!nutritionData.foodName || !nutritionData.calories) {
            return res.status(500).json({
                message: 'Incomplete nutritional data from AI',
                data: nutritionData
            });
        }

        // Save to unified MealEntry model
        const mealEntry = new MealEntry({
            user: req.user._id,
            foodName: nutritionData.foodName,
            calories: nutritionData.calories || 0,
            protein: nutritionData.protein || 0,
            carbs: nutritionData.carbs || 0,
            fat: nutritionData.fat || 0,
            portion: nutritionData.servingSize || 100,
            micronutrients: {
                vitaminA: nutritionData.micronutrients?.vitaminA || 0,
                vitaminC: nutritionData.micronutrients?.vitaminC || 0,
                calcium: nutritionData.micronutrients?.calcium || 0,
                iron: nutritionData.micronutrients?.iron || 0
            },
            confidence: nutritionData.confidence || 0.8,
            entryType: 'ai',
            imageMetadata: {
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

        await mealEntry.save();

        res.json({
            success: true,
            message: 'Food analyzed successfully',
            data: mealEntry
        });

    } catch (error) {
        console.error('Error analyzing food:', error);
        res.status(500).json({
            message: 'Error analyzing food image',
            error: error.message
        });
    }
};

/**
 * Get user's food history (filtered for AI entries)
 */
exports.getFoodHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { limit = 20, skip = 0 } = req.query;

        // We could return ALL entries here, but current UI expects AI analysis history.
        // For consolidation, we'll keep it to AI entries to match existing Page expectation.
        const foodHistory = await MealEntry.find({ user: req.user._id, entryType: 'ai' })
            .sort({ date: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await MealEntry.countDocuments({ user: req.user._id, entryType: 'ai' });

        res.json({
            success: true,
            data: foodHistory,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });

    } catch (error) {
        console.error('Error fetching food history:', error);
        res.status(500).json({
            message: 'Error fetching food history',
            error: error.message
        });
    }
};

/**
 * Get daily nutritional totals across ALL entry types
 */
exports.getDailyTotals = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Aggregate ALL entries for today (Manual + AI + Search)
        const totals = await MealEntry.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' },
                    totalProtein: { $sum: '$protein' },
                    totalCarbs: { $sum: '$carbs' },
                    totalFat: { $sum: '$fat' },
                    totalVitaminA: { $sum: '$micronutrients.vitaminA' },
                    totalVitaminC: { $sum: '$micronutrients.vitaminC' },
                    totalCalcium: { $sum: '$micronutrients.calcium' },
                    totalIron: { $sum: '$micronutrients.iron' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = totals[0] || {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalVitaminA: 0,
            totalVitaminC: 0,
            totalCalcium: 0,
            totalIron: 0,
            count: 0
        };

        res.json({
            success: true,
            date: startOfDay.toISOString().split('T')[0],
            totals: {
                calories: Math.round(result.totalCalories * 10) / 10,
                protein: Math.round(result.totalProtein * 10) / 10,
                carbs: Math.round(result.totalCarbs * 10) / 10,
                fat: Math.round(result.totalFat * 10) / 10,
                micronutrients: {
                    vitaminA: Math.round(result.totalVitaminA * 10) / 10,
                    vitaminC: Math.round(result.totalVitaminC * 10) / 10,
                    calcium: Math.round(result.totalCalcium * 10) / 10,
                    iron: Math.round(result.totalIron * 10) / 10
                }
            },
            itemCount: result.count
        });

    } catch (error) {
        console.error('Error calculating daily totals:', error);
        res.status(500).json({
            message: 'Error calculating daily totals',
            error: error.message
        });
    }
};

/**
 * Delete a meal entry
 */
exports.deleteFoodEntry = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { id } = req.params;

        const entry = await MealEntry.findOne({
            _id: id,
            user: req.user._id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await MealEntry.deleteOne({ _id: id });

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({
            message: 'Error deleting entry',
            error: error.message
        });
    }
};
