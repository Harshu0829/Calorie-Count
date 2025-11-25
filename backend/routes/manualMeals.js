const express = require('express');
const ManualMeal = require('../models/ManualMeal');
const Food = require('../models/Food');
const { calculateCalories } = require('../utils/foodDatabase');
const auth = require('../middleware/auth');

const router = express.Router();

// All manual meal routes require auth
router.use(auth);

// Helper to calculate nutrition if not provided
const getNutritionData = async (description, portion, providedNutrition = {}) => {
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
                fat: +(foodDoc.fat * multiplier).toFixed(1)
            };
        }

        const calculated = calculateCalories(foodName, portion);
        return {
            calories: calculated.calories,
            protein: calculated.protein,
            carbs: calculated.carbs,
            fat: calculated.fat
        };
    }

    return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };
};

// Create manual meal
router.post('/', async (req, res) => {
    try {
        const { mealType, description, portion, nutrition, date } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const portionValue = portion || 100;
        const nutritionData = await getNutritionData(description, portionValue, nutrition);

        const manualMeal = new ManualMeal({
            user: req.user._id,
            mealType: mealType || 'snack',
            description,
            portion: portionValue,
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
            date: date ? new Date(date) : new Date()
        });

        await manualMeal.save();

        res.status(201).json({ manualMeal });
    } catch (error) {
        console.error('Error creating manual meal:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get manual meals with optional date filter
router.get('/', async (req, res) => {
    try {
        const { date, mealType } = req.query;
        const query = { user: req.user._id };

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

        const manualMeals = await ManualMeal.find(query).sort({ date: -1 });
        res.json({ manualMeals });
    } catch (error) {
        console.error('Error fetching manual meals:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update manual meal
router.put('/:id', async (req, res) => {
    try {
        const manualMeal = await ManualMeal.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!manualMeal) {
            return res.status(404).json({ message: 'Manual meal not found' });
        }

        const { mealType, description, portion, nutrition, date } = req.body;

        if (mealType) manualMeal.mealType = mealType;
        if (description) manualMeal.description = description;
        if (portion !== undefined) manualMeal.portion = portion;
        if (date) manualMeal.date = new Date(date);

        if (nutrition) {
            manualMeal.calories = nutrition.calories;
            manualMeal.protein = nutrition.protein;
            manualMeal.carbs = nutrition.carbs;
            manualMeal.fat = nutrition.fat;
        } else if (description || portion !== undefined) {
            const nutritionData = await getNutritionData(
                manualMeal.description,
                manualMeal.portion,
                nutrition
            );
            manualMeal.calories = nutritionData.calories;
            manualMeal.protein = nutritionData.protein;
            manualMeal.carbs = nutritionData.carbs;
            manualMeal.fat = nutritionData.fat;
        }

        await manualMeal.save();
        res.json({ manualMeal });
    } catch (error) {
        console.error('Error updating manual meal:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete manual meal
router.delete('/:id', async (req, res) => {
    try {
        const manualMeal = await ManualMeal.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!manualMeal) {
            return res.status(404).json({ message: 'Manual meal not found' });
        }

        res.json({ message: 'Manual meal deleted successfully' });
    } catch (error) {
        console.error('Error deleting manual meal:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;



