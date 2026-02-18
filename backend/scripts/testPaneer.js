require('dotenv').config();
const { calculateFoodNutrition } = require('../utils/foodDatabase');

async function test() {
    const result = await calculateFoodNutrition('Paneer', 253, 'cooked');
    console.log(JSON.stringify(result, null, 2));
}

test();
