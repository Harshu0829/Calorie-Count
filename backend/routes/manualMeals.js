const express = require('express');
const MealEntry = require('../models/MealEntry');
const { Food } = require('../models/Food');
const { calculateFoodNutrition } = require('../utils/foodDatabase');
const auth = require('../middleware/auth');

const router = express.Router();

// All manual meal routes require auth
router.use(auth);

// Helper to calculate nutrition if not provided
const getNutritionData = async (description, portion, providedNutrition = {}, foodState = 'cooked') => {
    if (providedNutrition.calories !== undefined) {
        return providedNutrition;
    }

    // Try to find matching food
    const foodName = description?.toLowerCase();
    if (foodName) {
        const foodDoc = await Food.findOne({ name: foodName });
        if (foodDoc) {
            const multiplier = portion / 100;
            return {
                calories: +(foodDoc.calories * multiplier).toFixed(1),
                protein: +(foodDoc.protein * multiplier).toFixed(1),
                carbs: +(foodDoc.carbs * multiplier).toFixed(1),
                fat: +(foodDoc.fat * multiplier).toFixed(1),
                micronutrients: foodDoc.micronutrients || { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 }
            };
        }

        const calculated = await calculateFoodNutrition(foodName, portion, foodState);
        return {
            calories: calculated.calories,
            protein: calculated.protein,
            carbs: calculated.carbs,
            fat: calculated.fat,
            micronutrients: calculated.micronutrients || { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 }
        };
    }

    return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 }
    };
};

router.post('/', async (req, res) => {
    try {
        const { mealType, description, portion, nutrition, date, foodState } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const portionValue = portion || 100;
        const stateValue = foodState || 'cooked';
        const nutritionData = await getNutritionData(description, portionValue, nutrition, stateValue);

        const mealEntry = new MealEntry({
            user: req.user._id,
            mealType: mealType || 'snack',
            foodName: description,
            portion: portionValue,
            foodState: stateValue,
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
            micronutrients: nutritionData.micronutrients,
            entryType: 'manual',
            date: date ? new Date(date) : new Date()
        });

        await mealEntry.save();

        res.status(201).json({ manualMeal: mealEntry });
    } catch (error) {
        console.error('Error creating manual meal:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get manual meals with optional date filter
router.get('/', async (req, res) => {
    try {
        const { date, mealType } = req.query;
        const query = { user: req.user._id, entryType: 'manual' };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (mealType) {
            query.mealType = mealType;
        }

        const manualMeals = await MealEntry.find(query).sort({ date: -1 });

        // Map foodName to description for legacy frontend compatibility
        const legacyManualMeals = manualMeals.map(entry => {
            const obj = entry.toObject ? entry.toObject() : entry;
            obj.description = entry.foodName;
            return obj;
        });

        res.json({ manualMeals: legacyManualMeals });
    } catch (error) {
        console.error('Error fetching manual meals:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update manual meal
router.put('/:id', async (req, res) => {
    try {
        const mealEntry = await MealEntry.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!mealEntry) {
            return res.status(404).json({ message: 'Meal entry not found' });
        }

        const { mealType, description, portion, nutrition, date, foodState } = req.body;

        if (mealType) mealEntry.mealType = mealType;
        if (description) mealEntry.foodName = description;
        if (portion !== undefined) mealEntry.portion = portion;
        if (foodState) mealEntry.foodState = foodState;
        if (date) mealEntry.date = new Date(date);

        if (nutrition) {
            mealEntry.calories = nutrition.calories;
            mealEntry.protein = nutrition.protein;
            mealEntry.carbs = nutrition.carbs;
            mealEntry.fat = nutrition.fat;
        } else if (description || portion !== undefined || foodState) {
            const nutritionData = await getNutritionData(
                mealEntry.foodName,
                mealEntry.portion,
                nutrition,
                mealEntry.foodState
            );
            mealEntry.calories = nutritionData.calories;
            mealEntry.protein = nutritionData.protein;
            mealEntry.carbs = nutritionData.carbs;
            mealEntry.fat = nutritionData.fat;
            if (nutritionData.micronutrients) {
                mealEntry.micronutrients = nutritionData.micronutrients;
            }
        }

        await mealEntry.save();
        res.json({ manualMeal: mealEntry });
    } catch (error) {
        console.error('Error updating meal entry:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete manual meal
router.delete('/:id', async (req, res) => {
    try {
        const mealEntry = await MealEntry.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!mealEntry) {
            return res.status(404).json({ message: 'Meal entry not found' });
        }

        res.json({ message: 'Meal entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal entry:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
