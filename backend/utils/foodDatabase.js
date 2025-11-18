// Food database with calories per 100g
const FOOD_DATABASE = {
    apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruit' },
    banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruit' },
    orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: 'fruit' },
    chicken_breast: { calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein' },
    rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'grain' },
    bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, category: 'grain' },
    egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'protein' },
    milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1, category: 'dairy' },
    yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'dairy' },
    salmon: { calories: 208, protein: 20, carbs: 0, fat: 12, category: 'protein' },
    broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetable' },
    pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1, category: 'grain' },
    potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'vegetable' },
    carrot: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'vegetable' },
    tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetable' },
    spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetable' },
    chicken_thigh: { calories: 209, protein: 26, carbs: 0, fat: 10, category: 'protein' },
    beef: { calories: 250, protein: 26, carbs: 0, fat: 17, category: 'protein' },
    pork: { calories: 242, protein: 27, carbs: 0, fat: 14, category: 'protein' },
    fish: { calories: 206, protein: 22, carbs: 0, fat: 12, category: 'protein' },
};

// Base weights for estimation (in grams)
const BASE_WEIGHTS = {
    apple: 182,
    banana: 118,
    orange: 154,
    chicken_breast: 100,
    rice: 100,
    bread: 25,
    egg: 50,
    milk: 100,
    yogurt: 100,
    salmon: 100,
    broccoli: 100,
    pasta: 100,
    potato: 173,
    carrot: 61,
    tomato: 123,
    spinach: 100,
    chicken_thigh: 100,
    beef: 100,
    pork: 100,
    fish: 100,
};

// Simple food detection (in production, use ML model)
function detectFoodInImage(imageBuffer) {
    // Placeholder: In real implementation, use food recognition ML model
    // For now, we'll return a simple detection based on random selection
    const foodsToCheck = ['apple', 'banana', 'chicken_breast', 'rice', 'bread', 'egg'];
    const detectedFoods = [];
    
    // Mock detection for demo purposes
    foodsToCheck.forEach(food => {
        const confidence = Math.random() * 0.6 + 0.3; // Random between 0.3 and 0.9
        if (confidence > 0.5) {
            detectedFoods.push({
                name: food,
                confidence: Math.round(confidence * 100) / 100
            });
        }
    });
    
    // If no foods detected, return a default item
    if (detectedFoods.length === 0) {
        detectedFoods.push({
            name: 'apple',
            confidence: 0.7
        });
    }
    
    return detectedFoods.slice(0, 3); // Return top 3
}

function estimateWeight(foodName) {
    return BASE_WEIGHTS[foodName.toLowerCase()] || 100;
}

function calculateCalories(foodName, weightGrams) {
    const foodNameLower = foodName.toLowerCase();
    
    // Try to find exact match first
    let foodData = null;
    for (const [key, value] of Object.entries(FOOD_DATABASE)) {
        if (foodNameLower.includes(key) || key.includes(foodNameLower)) {
            foodData = value;
            break;
        }
    }
    
    if (!foodData) {
        // Default values if food not found
        foodData = { calories: 100, protein: 5, carbs: 15, fat: 3 };
    }
    
    // Calculate per serving
    const multiplier = weightGrams / 100.0;
    
    return {
        food: foodName,
        weight_grams: Math.round(weightGrams * 10) / 10,
        calories: Math.round(foodData.calories * multiplier * 10) / 10,
        protein: Math.round(foodData.protein * multiplier * 10) / 10,
        carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
        fat: Math.round(foodData.fat * multiplier * 10) / 10,
        category: foodData.category || 'other'
    };
}

function getFoodDatabase() {
    return FOOD_DATABASE;
}

function getAllFoodNames() {
    return Object.keys(FOOD_DATABASE);
}

module.exports = {
    FOOD_DATABASE,
    BASE_WEIGHTS,
    detectFoodInImage,
    estimateWeight,
    calculateCalories,
    getFoodDatabase,
    getAllFoodNames
};

