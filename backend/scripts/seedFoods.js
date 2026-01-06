const mongoose = require('mongoose');
const { Food } = require('../models/Food');
const { FOOD_DATABASE } = require('../utils/foodDatabase');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorie-tracker';

async function seedFoods() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing foods
        await Food.deleteMany({});
        console.log('Cleared existing foods');

        // Insert foods from database
        const foods = Object.entries(FOOD_DATABASE).map(([name, data]) => ({
            name,
            displayName: name.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            category: data.category || 'other',
            servingSize: 100
        }));

        await Food.insertMany(foods);
        console.log(`Seeded ${foods.length} foods`);

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding foods:', error);
        process.exit(1);
    }
}

seedFoods();

