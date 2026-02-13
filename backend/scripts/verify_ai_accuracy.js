const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();
const aiService = require('../utils/aiService');

async function verifyAccuracy() {
    console.log('--- Verifying AI Macro Accuracy for Food States ---');

    const foodsToTest = [
        { name: 'Chicken Breast', weight: 100 },
        { name: 'Rice', weight: 100 },
        { name: 'Pasta', weight: 100 }
    ];

    for (const food of foodsToTest) {
        console.log(`\nTesting: ${food.name} (${food.weight}g)`);

        try {
            console.log('Requesting RAW data...');
            const rawData = await aiService.getNutritionalInfoFromText(food.name, food.weight, 'raw');
            console.log(`RAW calories: ${rawData.calories} kcal`);

            console.log('Requesting COOKED data...');
            const cookedData = await aiService.getNutritionalInfoFromText(food.name, food.weight, 'cooked');
            console.log(`COOKED calories: ${cookedData.calories} kcal`);

            const diff = Math.abs(rawData.calories - cookedData.calories);
            if (diff > 5) {
                console.log(`✅ Success: AI recognized difference! Diff: ${diff.toFixed(1)} kcal`);
            } else {
                console.warn(`⚠️ Warning: AI returned similar calories for both states (Diff: ${diff.toFixed(1)} kcal). Accuracy might be low.`);
            }
        } catch (error) {
            console.error(`Error testing ${food.name}:`, error.message);
        }
    }
}

verifyAccuracy();
