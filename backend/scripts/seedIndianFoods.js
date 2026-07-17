const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Food } = require('../models/Food');

async function seedDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const jsonPath = path.join(__dirname, '../data/indianFoodDatabase.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const foodItems = JSON.parse(rawData);

        console.log(`Read ${foodItems.length} items from JSON.`);

        // Category mapping to match Mongoose schema enum
        const categoryMapping = {
            'staples': 'grain',
            'dal': 'protein',
            'dairy': 'dairy',
            'protein': 'protein',
            'vegetable': 'vegetable',
            'fruit': 'fruit',
            'snack': 'snack',
            'sweet': 'dessert',
            'beverage': 'beverage'
        };

        let successCount = 0;
        let updateCount = 0;

        for (const item of foodItems) {
            const mappedCategory = categoryMapping[item.category] || 'other';
            
            // Clean up the item for Mongoose
            // Remove the $oid wrapper if present, or let Mongoose handle IDs
            const foodData = {
                name: item.name,
                displayName: item.displayName,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                servingSize: item.servingSize,
                category: mappedCategory
            };

            // Upsert based on the unique 'name' field
            const result = await Food.findOneAndUpdate(
                { name: foodData.name },
                foodData,
                { upsert: true, new: true, runValidators: true }
            );

            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                successCount++;
            } else {
                updateCount++;
            }
        }

        console.log(`Seeding complete!`);
        console.log(`New items added: ${successCount}`);
        console.log(`Existing items updated: ${updateCount}`);

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedDatabase();
