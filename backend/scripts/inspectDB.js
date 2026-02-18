require('dotenv').config();
const mongoose = require('mongoose');
const { Food } = require('../models/Food');

async function checkFood() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const foods = await Food.find({ name: /paneer/i });
        console.log('Food entries for "paneer":');
        console.log(JSON.stringify(foods, null, 2));

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkFood();
