const express = require('express');
const { Food } = require('../models/Food');
const { getAllFoodNames, getFoodDatabase, calculateFoodNutrition } = require('../utils/foodDatabase');

const router = express.Router();

// Get all foods from database
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find().sort({ name: 1 });

        // If no foods in database, return static database
        if (foods.length === 0) {
            const staticFoods = Object.entries(getFoodDatabase()).map(([name, data]) => ({
                name,
                displayName: name.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                ...data
            }));
            return res.json({ foods: staticFoods });
        }

        res.json({ foods });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get food names list
router.get('/names', (req, res) => {
    try {
        const names = getAllFoodNames();
        res.json({ foods: names });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Calculate calories for specific food
router.post('/calculate', async (req, res) => {
    try {
        const { food_name, weight_grams } = req.body;

        if (!food_name || !weight_grams) {
            return res.status(400).json({ message: 'food_name and weight_grams are required' });
        }

        const result = await calculateFoodNutrition(food_name, parseFloat(weight_grams));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search foods
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const foods = await Food.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { displayName: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        res.json({ foods });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
