const express = require('express');
const MealEntry = require('../models/MealEntry');
const Meal = require('../models/Meal'); // Keep for legacy if needed, but we'll prioritize MealEntry
const { Food } = require('../models/Food');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get weekly statistics across ALL entry types
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

        // Query unified MealEntry model
        const entries = await MealEntry.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        // Also query legacy Meal model just in case (optional, depends on migration status)
        const legacyMeals = await Meal.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

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

        // Aggregate calories from unified MealEntry
        entries.forEach(entry => {
            const dateStr = getLocalDateStr(entry.date);
            if (stats[dateStr] !== undefined) {
                stats[dateStr] += entry.calories || 0;
            }
        });

        // Aggregate calories from legacy Meal model
        legacyMeals.forEach(meal => {
            const dateStr = getLocalDateStr(meal.date);
            if (stats[dateStr] !== undefined) {
                stats[dateStr] += meal.totalCalories || 0;
            }
        });

        // Ensure stats are sorted by date
        const weeklyStats = Object.keys(stats).sort().map(date => ({
            date,
            calories: Math.round(stats[date])
        }));

        res.json({ weeklyStats });
    } catch (error) {
        console.error('Error in weekly-stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all meals for user (Aggregated)
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

        // Fetch from unified MealEntry
        const entries = await MealEntry.find(query).sort({ date: -1, createdAt: -1 });

        // Fetch from legacy Meal model
        const legacyMeals = await Meal.find(query)
            .populate('foods.food', 'name displayName calories protein carbs fat')
            .sort({ date: -1, createdAt: -1 });

        // Merge results (optional but good for transition)
        // In a real consolidation, we'd eventually stop using legacyMeals
        // Standardize entries for the frontend
        const standardizedEntries = entries.map(entry => {
            const obj = entry.toObject ? entry.toObject() : entry;
            // Ensure both 'calories' and 'totalCalories' are available
            obj.totalCalories = entry.calories || 0;
            obj.totalProtein = entry.protein || 0;
            obj.totalCarbs = entry.carbs || 0;
            obj.totalFat = entry.fat || 0;
            // Ensure mealType and date are present
            obj.mealType = entry.mealType || 'snack';
            obj.date = entry.date || entry.createdAt;
            return obj;
        });

        const standardizedLegacy = legacyMeals.map(meal => {
            const obj = meal.toObject ? meal.toObject() : meal;
            // Ensure legacy meals also follow the pattern
            obj.totalCalories = meal.totalCalories || 0;
            obj.totalProtein = meal.totalProtein || 0;
            obj.totalCarbs = meal.totalCarbs || 0;
            obj.totalFat = meal.totalFat || 0;
            obj.mealType = meal.mealType || 'snack';
            obj.date = meal.date || meal.createdAt;
            return obj;
        });

        res.json({
            meals: standardizedLegacy,
            entries: standardizedEntries,
            combined: [...standardizedEntries, ...standardizedLegacy].sort((a, b) => new Date(b.date) - new Date(a.date))
        });
    } catch (error) {
        console.error('Error in meals GET:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get daily summary (Aggregated)
router.get('/summary', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        // Aggregate from ALL entry types
        const [entries, legacyMeals] = await Promise.all([
            MealEntry.find({
                user: req.user._id,
                date: { $gte: targetDate, $lte: endDate }
            }),
            Meal.find({
                user: req.user._id,
                date: { $gte: targetDate, $lte: endDate }
            })
        ]);

        const summary = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: entries.length + legacyMeals.length
        };

        entries.forEach(entry => {
            summary.totalCalories += entry.calories || 0;
            summary.totalProtein += entry.protein || 0;
            summary.totalCarbs += entry.carbs || 0;
            summary.totalFat += entry.fat || 0;
        });

        legacyMeals.forEach(meal => {
            summary.totalCalories += meal.totalCalories || 0;
            summary.totalProtein += meal.totalProtein || 0;
            summary.totalCarbs += meal.totalCarbs || 0;
            summary.totalFat += meal.totalFat || 0;
        });

        // Round totals
        summary.totalCalories = Math.round(summary.totalCalories);
        summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
        summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
        summary.totalFat = Math.round(summary.totalFat * 10) / 10;

        res.json({ summary });
    } catch (error) {
        console.error('Error in summary:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a meal (Standard entry)
router.post('/', async (req, res) => {
    try {
        const { mealType, foods, date, notes } = req.body;

        if (!foods || !Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ message: 'Foods array is required' });
        }

        // For now, let's keep creating the legacy Meal for the "search and add" flow
        // but also ensure we could move this to MealEntry later.
        const mealFoods = [];

        for (const foodItem of foods) {
            let foodDoc = null;
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
                confidence: foodItem.confidence || 1,
                imageUrl: foodItem.imageUrl || null
            });

            // Transition: Also save as a MealEntry for easier aggregation
            const entry = new MealEntry({
                user: req.user._id,
                mealType: mealType || 'snack',
                foodName: foodItem.foodName || foodDoc?.displayName || 'Unknown',
                portion: foodItem.quantity || 100,
                calories: foodItem.calories || 0,
                protein: foodItem.protein || 0,
                carbs: foodItem.carbs || 0,
                fat: foodItem.fat || 0,
                entryType: 'search',
                date: date ? new Date(date) : new Date()
            });
            await entry.save();
        }

        // We still save to Meal for legacy frontend views
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
        console.error('Error in meal POST:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a meal
router.delete('/:id', async (req, res) => {
    try {
        // Try deleting from legacy Meal
        const meal = await Meal.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        // Also try deleting from MealEntry (if it exists)
        // This is a bit tricky since they have different IDs, but we can match by user/date/content if needed.
        // For now, let's just delete the meal.

        if (!meal) {
            // Check if it's a MealEntry instead
            const entry = await MealEntry.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });
            if (!entry) {
                return res.status(404).json({ message: 'Meal not found' });
            }
        }

        res.json({ message: 'Meal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

