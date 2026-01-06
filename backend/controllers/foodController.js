const Anthropic = require('@anthropic-ai/sdk');
const FoodAnalysis = require('../models/FoodAnalysis');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

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

        // Call Claude Vision API
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType,
                                data: base64Image,
                            },
                        },
                        {
                            type: "text",
                            text: `Analyze this food image and provide nutritional information. Return ONLY a valid JSON object with this exact structure (no additional text):
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": number (in grams),
  "micronutrients": {
    "vitaminA": number (in mcg),
    "vitaminC": number (in mg),
    "calcium": number (in mg),
    "iron": number (in mg)
  },
  "confidence": number (0-1)
}`
                        }
                    ],
                },
            ],
        });

        // Parse Claude's response
        const responseText = message.content[0].text;

        // Extract JSON from response (handle potential markdown code blocks)
        let nutritionData;
        try {
            // Try to find JSON in the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                nutritionData = JSON.parse(jsonMatch[0]);
            } else {
                nutritionData = JSON.parse(responseText);
            }
        } catch (parseError) {
            console.error('Failed to parse Claude response:', responseText);
            return res.status(500).json({
                message: 'Failed to parse AI response',
                rawResponse: responseText
            });
        }

        // Validate required fields
        if (!nutritionData.foodName || !nutritionData.calories) {
            return res.status(500).json({
                message: 'Incomplete nutritional data from AI',
                data: nutritionData
            });
        }

        // Save to database
        const foodAnalysis = new FoodAnalysis({
            user: req.user._id,
            foodName: nutritionData.foodName,
            calories: nutritionData.calories || 0,
            protein: nutritionData.protein || 0,
            carbs: nutritionData.carbs || 0,
            fat: nutritionData.fat || 0,
            servingSize: nutritionData.servingSize || 100,
            micronutrients: {
                vitaminA: nutritionData.micronutrients?.vitaminA || 0,
                vitaminC: nutritionData.micronutrients?.vitaminC || 0,
                calcium: nutritionData.micronutrients?.calcium || 0,
                iron: nutritionData.micronutrients?.iron || 0
            },
            confidence: nutritionData.confidence || 0.8,
            imageMetadata: {
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

        await foodAnalysis.save();

        res.json({
            success: true,
            message: 'Food analyzed successfully',
            data: foodAnalysis
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
 * Get user's food history
 */
exports.getFoodHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { limit = 20, skip = 0 } = req.query;

        const foodHistory = await FoodAnalysis.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await FoodAnalysis.countDocuments({ user: req.user._id });

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
 * Get daily nutritional totals
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

        // Aggregate today's totals
        const totals = await FoodAnalysis.aggregate([
            {
                $match: {
                    user: req.user._id,
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
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
 * Delete a food entry
 */
exports.deleteFoodEntry = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { id } = req.params;

        const foodEntry = await FoodAnalysis.findOne({
            _id: id,
            user: req.user._id
        });

        if (!foodEntry) {
            return res.status(404).json({ message: 'Food entry not found' });
        }

        await FoodAnalysis.deleteOne({ _id: id });

        res.json({
            success: true,
            message: 'Food entry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting food entry:', error);
        res.status(500).json({
            message: 'Error deleting food entry',
            error: error.message
        });
    }
};
