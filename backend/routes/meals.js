const express = require('express');
const Meal = require('../models/Meal');
const ManualMeal = require('../models/ManualMeal');
const { Food } = require('../models/Food');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get weekly statistics (Current week starting from Sunday)
router.get('/weekly-stats', async (req, res) => {
    try {
        const now = new Date();

        // Find the most recent Sunday
        const startDate = new Date(now);
        const dayOfWeek = startDate.getDay(); // 0 (Sun) to 6 (Sat)
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);

        // End date is next Saturday
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const [meals, manualMeals] = await Promise.all([
            Meal.find({
                user: req.user._id,
                date: { $gte: startDate, $lte: endDate }
            }),
            ManualMeal.find({
                user: req.user._id,
                date: { $gte: startDate, $lte: endDate }
            })
        ]);

        // Helper to get YYYY-MM-DD in local time
        const getLocalDateStr = (d) => {
            const date = new Date(d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Initialize 7 days starting from Sunday
        const stats = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = getLocalDateStr(d);
            stats[dateStr] = 0;
        }

        // Aggregate calories from tracked meals
        meals.forEach(meal => {
            const dateStr = getLocalDateStr(meal.date);
            if (stats[dateStr] !== undefined) {
                stats[dateStr] += meal.totalCalories || 0;
            }
        });

        // Aggregate calories from manual meals
        manualMeals.forEach(meal => {
            const dateStr = getLocalDateStr(meal.date);
            if (stats[dateStr] !== undefined) {
                stats[dateStr] += meal.calories || 0;
            }
        });

        // Ensure stats are sorted by date
        const weeklyStats = Object.keys(stats).sort().map(date => ({
            date,
            calories: Math.round(stats[date])
        }));

        res.json({ weeklyStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all meals for user
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

        const meals = await Meal.find(query)
            .populate('foods.food', 'name displayName calories protein carbs fat')
            .sort({ date: -1, createdAt: -1 });

        res.json({ meals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get daily summary
router.get('/summary', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        const meals = await Meal.find({
            user: req.user._id,
            date: { $gte: targetDate, $lte: endDate }
        });

        const summary = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: meals.length
        };

        meals.forEach(meal => {
            summary.totalCalories += meal.totalCalories;
            summary.totalProtein += meal.totalProtein;
            summary.totalCarbs += meal.totalCarbs;
            summary.totalFat += meal.totalFat;
        });

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a meal
router.post('/', async (req, res) => {
    try {
        const { mealType, foods, date, notes } = req.body;

        if (!foods || !Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ message: 'Foods array is required' });
        }

        const mealFoods = [];

        for (const foodItem of foods) {
            let foodDoc = null;

            // Try to find food in database
            if (foodItem.foodId) {
                foodDoc = await Food.findById(foodItem.foodId);
            }

            if (!foodDoc && foodItem.foodName) {
                foodDoc = await Food.findOne({
                    name: foodItem.foodName.toLowerCase()
                });
            }

            mealFoods.push({
                food: foodDoc?._id || null,
                foodName: foodItem.foodName || foodDoc?.displayName || 'Unknown',
                quantity: foodItem.quantity || 100,
                calories: foodItem.calories || 0,
                protein: foodItem.protein || 0,
                carbs: foodItem.carbs || 0,
                fat: foodItem.fat || 0,
                confidence: foodItem.confidence || null,
                imageUrl: foodItem.imageUrl || null
            });
        }

        const meal = new Meal({
            user: req.user._id,
            mealType: mealType || 'snack',
            foods: mealFoods,
            date: date ? new Date(date) : new Date(),
            notes: notes || ''
        });

        await meal.save();
        await meal.populate('foods.food', 'name displayName calories protein carbs fat');

        res.status(201).json({ meal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a meal
router.put('/:id', async (req, res) => {
    try {
        const meal = await Meal.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        const { mealType, foods, date, notes } = req.body;

        if (mealType) meal.mealType = mealType;
        if (foods) {
            // Similar processing as create
            const mealFoods = [];
            for (const foodItem of foods) {
                let foodDoc = null;
                if (foodItem.foodId) {
                    foodDoc = await Food.findById(foodItem.foodId);
                }
                mealFoods.push({
                    food: foodDoc?._id || null,
                    foodName: foodItem.foodName || foodDoc?.displayName || 'Unknown',
                    quantity: foodItem.quantity || 100,
                    calories: foodItem.calories || 0,
                    protein: foodItem.protein || 0,
                    carbs: foodItem.carbs || 0,
                    fat: foodItem.fat || 0,
                    confidence: foodItem.confidence || null,
                    imageUrl: foodItem.imageUrl || null
                });
            }
            meal.foods = mealFoods;
        }
        if (date) meal.date = new Date(date);
        if (notes !== undefined) meal.notes = notes;

        await meal.save();
        await meal.populate('foods.food', 'name displayName calories protein carbs fat');

        res.json({ meal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a meal
router.delete('/:id', async (req, res) => {
    try {
        const meal = await Meal.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        res.json({ message: 'Meal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

