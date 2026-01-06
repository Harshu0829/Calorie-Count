const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const FoodCache = require('../models/FoodCache');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} else {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for OpenAI
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed!'));
        }
    }
});

// Helper: Convert buffer to base64 data URL
function bufferToDataUrl(file) {
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
}

// Helper: Parse OpenAI response to structured nutrition data
function parseNutritionResponse(text) {
    try {
        // Try to extract JSON if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback: Parse text format
        const caloriesMatch = text.match(/calories?:?\s*(\d+)/i);
        const proteinMatch = text.match(/protein:?\s*(\d+)/i);
        const carbsMatch = text.match(/carb(?:ohydrate)?s?:?\s*(\d+)/i);
        const fatMatch = text.match(/fat:?\s*(\d+)/i);
        const foodNameMatch = text.match(/food:?\s*([^\n]+)/i) || text.match(/identified:?\s*([^\n]+)/i);

        return {
            foodName: foodNameMatch ? foodNameMatch[1].trim() : 'Unknown Food',
            calories: parseInt(caloriesMatch?.[1] || 0),
            protein: parseInt(proteinMatch?.[1] || 0),
            carbs: parseInt(carbsMatch?.[1] || 0),
            fat: parseInt(fatMatch?.[1] || 0),
            confidence: 0.8 // Default confidence for text parsing
        };
    } catch (err) {
        console.error('Error parsing nutrition response:', err);
        return null;
    }
}

// Analyze image endpoint with caching
router.post('/image', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

        // Check if OpenAI is initialized
        if (!openai) {
            return res.status(500).json({
                message: 'OpenAI API is not configured. Please add OPENAI_API_KEY to environment variables.'
            });
        }

        // Convert image to base64
        const imageDataUrl = bufferToDataUrl(req.file);

        // Call OpenAI Vision API
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a nutrition analysis AI. Analyze food images and return nutritional information in this exact JSON format:
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "servingSize": number (grams),
  "confidence": number (0-1)
}
Be accurate and only analyze what you can clearly identify.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this food image and provide complete nutritional breakdown. Return only the JSON object.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageDataUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const aiResponse = response.choices[0].message.content;
        console.log('OpenAI Response:', aiResponse);

        // Parse the response
        const nutritionData = parseNutritionResponse(aiResponse);

        if (!nutritionData) {
            return res.status(500).json({ message: 'Could not parse nutrition data from image' });
        }

        // Check/Update cache for frequent foods
        const minFrequency = parseInt(process.env.CACHE_MIN_FREQUENCY) || 3;
        const minConfidence = parseFloat(process.env.CACHE_MIN_CONFIDENCE) || 0.7;

        if (nutritionData.confidence >= minConfidence) {
            try {
                const normalizedName = nutritionData.foodName.toLowerCase().trim();
                let cached = await FoodCache.findOne({ normalizedName });

                if (cached) {
                    // Update existing cache
                    await cached.incrementCount();
                    console.log(`Cache updated for "${nutritionData.foodName}" (count: ${cached.analysisCount + 1})`);
                } else {
                    // Create new cache entry (will be promoted after minFrequency analyses)
                    cached = new FoodCache({
                        foodName: normalizedName,
                        normalizedName: normalizedName,
                        nutrition: {
                            calories: nutritionData.calories,
                            protein: nutritionData.protein,
                            carbs: nutritionData.carbs,
                            fat: nutritionData.fat,
                            servingSize: nutritionData.servingSize || 100
                        },
                        averageConfidence: nutritionData.confidence,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    });
                    await cached.save();
                    console.log(`New cache entry created for "${nutritionData.foodName}"`);
                }
            } catch (cacheErr) {
                console.error('Cache error (non-critical):', cacheErr.message);
                // Continue even if caching fails
            }
        }

        // Return response
        res.json({
            detected_foods: [{
                name: nutritionData.foodName,
                calories: nutritionData.calories,
                protein: nutritionData.protein,
                carbs: nutritionData.carbs,
                fat: nutritionData.fat,
                weight: nutritionData.servingSize || 100,
                confidence: nutritionData.confidence
            }],
            totals: {
                calories: nutritionData.calories,
                protein: nutritionData.protein,
                carbs: nutritionData.carbs,
                fat: nutritionData.fat
            },
            metadata: {
                model: 'gpt-4o',
                tokensUsed: response.usage?.total_tokens || 0,
                cached: false // Could enhance this to check if similar food was in cache
            }
        });

    } catch (error) {
        console.error('Error analyzing image:', error);

        if (error.status) {
            return res.status(error.status).json({
                message: 'OpenAI API error',
                details: error.message
            });
        }

        res.status(500).json({
            message: error.message || 'Error analyzing image'
        });
    }
});

// Get cached foods (for debugging/admin)
router.get('/cache', auth, async (req, res) => {
    try {
        const cachedFoods = await FoodCache.find()
            .sort({ analysisCount: -1 })
            .limit(50);

        res.json({
            count: cachedFoods.length,
            foods: cachedFoods
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
