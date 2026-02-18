require('dotenv').config();
const { calculateFoodNutrition } = require('../utils/foodDatabase');

async function runTests() {
    console.log('--- Starting Nutrition Accuracy Tests ---\n');

    // Test 1: Generic term in complex name (Should NOT match generic term)
    console.log('Test 1: "Rice Cake" (100g)');
    const riceCake = await calculateFoodNutrition('Rice Cake', 100);
    console.log(`Matched: ${riceCake.food}, Source: ${riceCake.dataSource}, Calories: ${riceCake.calories}`);
    if (riceCake.dataSource === 'local' && riceCake.food === 'rice') {
        console.error('❌ FAIL: "Rice Cake" matched generic "rice" in local DB.');
    } else {
        console.log('✅ PASS: "Rice Cake" did not match generic "rice".');
    }
    console.log('');

    // Test 2: Indian food item added (Should match local)
    console.log('Test 2: "Idli" (100g)');
    const idli = await calculateFoodNutrition('Idli', 100);
    console.log(`Matched: ${idli.food}, Source: ${idli.dataSource}, Calories: ${idli.calories}`);
    if (idli.dataSource === 'local' && idli.food === 'idli') {
        console.log('✅ PASS: "Idli" matched local DB.');
    } else {
        console.error('❌ FAIL: "Idli" not found in local DB.');
    }
    console.log('');

    // Test 3: Exact match with case variation
    console.log('Test 3: "White Rice" (100g)');
    const whiteRice = await calculateFoodNutrition('White Rice', 100);
    console.log(`Matched: ${whiteRice.food}, Source: ${whiteRice.dataSource}, Calories: ${whiteRice.calories}`);
    if (whiteRice.dataSource === 'local' && whiteRice.food === 'White Rice') {
        console.log('✅ PASS: "White Rice" matched exactly despite case.');
    } else {
        console.error('❌ FAIL: "White Rice" did not match local DB accurately.');
    }
    console.log('');

    // Test 4: Portion scaling (AI - needs API key)
    if (process.env.GEMINI_API_KEY) {
        console.log('Test 4: "Chicken Sandwich" (200g) - Checking scaling');
        try {
            const sandwich = await calculateFoodNutrition('Chicken Sandwich', 200);
            console.log(`Matched: ${sandwich.food}, Source: ${sandwich.dataSource}, Calories: ${sandwich.calories}, Protein: ${sandwich.protein}`);
            console.log('AI Confidence:', sandwich.confidence);
            if (sandwich.calories > 300) {
                console.log('✅ PASS: AI likely returned portion-specific values (~200g sandwich usually > 300 cal).');
            } else {
                console.log('⚠️ WARNING: AI values might be low for 200g. Check AI logs if possible.');
            }
        } catch (e) {
            console.error('❌ ERROR: AI Service failed.', e.message);
        }
    } else {
        console.log('Skipping AI test (No GEMINI_API_KEY found in .env)');
    }

    console.log('\n--- Accuracy Tests Complete ---');
}

runTests();
