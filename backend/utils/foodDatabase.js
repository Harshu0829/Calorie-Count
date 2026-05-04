// Food database with calories per 100g
const aiService = require('./aiService');

const FOOD_DATABASE = {
    apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruit', micronutrients: { vitaminA: 54, vitaminC: 4.6, calcium: 6, iron: 0.1 } },
    banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruit', micronutrients: { vitaminA: 64, vitaminC: 8.7, calcium: 5, iron: 0.3 } },
    orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: 'fruit', micronutrients: { vitaminA: 225, vitaminC: 53.2, calcium: 40, iron: 0.1 } },
    chicken_breast: { calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein', micronutrients: { vitaminA: 21, vitaminC: 0, calcium: 15, iron: 1 } },
    rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 0.2 } },
    bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 260, iron: 3.6 } },
    egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'protein', micronutrients: { vitaminA: 520, vitaminC: 0, calcium: 50, iron: 1.2 } },
    milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1, category: 'dairy', micronutrients: { vitaminA: 46, vitaminC: 0, calcium: 125, iron: 0.03 } },
    yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'dairy', micronutrients: { vitaminA: 27, vitaminC: 0.8, calcium: 110, iron: 0.1 } },
    salmon: { calories: 208, protein: 20, carbs: 0, fat: 12, category: 'protein', micronutrients: { vitaminA: 40, vitaminC: 0, calcium: 9, iron: 0.3 } },
    broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetable', micronutrients: { vitaminA: 623, vitaminC: 89.2, calcium: 47, iron: 0.7 } },
    pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 6, iron: 0.5 } },
    potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'vegetable', micronutrients: { vitaminA: 2, vitaminC: 19.7, calcium: 12, iron: 0.8 } },
    carrot: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'vegetable', micronutrients: { vitaminA: 16706, vitaminC: 5.9, calcium: 33, iron: 0.3 } },
    tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetable', micronutrients: { vitaminA: 833, vitaminC: 13.7, calcium: 10, iron: 0.3 } },
    strawberry: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, category: 'fruit', micronutrients: { vitaminA: 12, vitaminC: 58.8, calcium: 16, iron: 0.4 } },
    paneer: { calories: 265, protein: 18.3, carbs: 3.6, fat: 20.8, category: 'dairy', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 480, iron: 0 } },
    dal_tadka: { calories: 117, protein: 6.8, carbs: 19, fat: 1.5, category: 'protein', micronutrients: { vitaminA: 100, vitaminC: 2, calcium: 30, iron: 1.5 } },
    roti: { calories: 297, protein: 10, carbs: 61, fat: 3.7, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 15, iron: 1.2 } },
    chapati: { calories: 297, protein: 10, carbs: 61, fat: 3.7, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 15, iron: 1.2 } },
    chicken_curry: { calories: 240, protein: 25, carbs: 8, fat: 12, category: 'protein', micronutrients: { vitaminA: 150, vitaminC: 5, calcium: 25, iron: 1.8 } },
    spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetable', micronutrients: { vitaminA: 9377, vitaminC: 28.1, calcium: 99, iron: 2.7 } },
    soya_chunks: { calories: 345, protein: 52, carbs: 33, fat: 0.5, category: 'protein', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 350, iron: 20 } },
    boiled_soya_chunks: { calories: 135, protein: 17.5, carbs: 11.5, fat: 1.2, category: 'protein', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 120, iron: 7 } },
    chicken_thigh: { calories: 209, protein: 26, carbs: 0, fat: 10, category: 'protein', micronutrients: { vitaminA: 18, vitaminC: 0, calcium: 12, iron: 0.9 } },
    beef: { calories: 250, protein: 26, carbs: 0, fat: 17, category: 'protein', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 18, iron: 2.6 } },
    pork: { calories: 242, protein: 27, carbs: 0, fat: 14, category: 'protein', micronutrients: { vitaminA: 2, vitaminC: 0.6, calcium: 19, iron: 0.9 } },
    fish: { calories: 206, protein: 22, carbs: 0, fat: 12, category: 'protein', micronutrients: { vitaminA: 50, vitaminC: 0, calcium: 15, iron: 0.5 } },
    idli: { calories: 58, protein: 2, carbs: 12, fat: 0.1, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 0.5 } },
    dosa: { calories: 168, protein: 3.9, carbs: 29, fat: 3.7, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 15, iron: 1.0 } },
    sambar: { calories: 110, protein: 5, carbs: 18, fat: 2, category: 'vegetable', micronutrients: { vitaminA: 200, vitaminC: 5, calcium: 40, iron: 1.2 } },
    chole: { calories: 166, protein: 9, carbs: 27, fat: 2.5, category: 'protein', micronutrients: { vitaminA: 50, vitaminC: 4, calcium: 50, iron: 3.0 } },
    paratha: { calories: 260, protein: 5, carbs: 40, fat: 8, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 20, iron: 1.5 } },
    white_rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 0.2 } },
    curd_rice: { calories: 190, protein: 5, carbs: 30, fat: 5, category: 'dairy', micronutrients: { vitaminA: 50, vitaminC: 0, calcium: 120, iron: 0.2 } },
    // Popular Indian foods
    naan: { calories: 290, protein: 8.7, carbs: 50, fat: 5.7, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 20, iron: 2.0 } },
    biryani: { calories: 175, protein: 7.5, carbs: 22, fat: 6.5, category: 'grain', micronutrients: { vitaminA: 80, vitaminC: 3, calcium: 20, iron: 1.0 } },
    chicken_biryani: { calories: 175, protein: 7.5, carbs: 22, fat: 6.5, category: 'grain', micronutrients: { vitaminA: 80, vitaminC: 3, calcium: 20, iron: 1.0 } },
    butter_chicken: { calories: 148, protein: 14, carbs: 6, fat: 8, category: 'protein', micronutrients: { vitaminA: 200, vitaminC: 3, calcium: 30, iron: 1.5 } },
    palak_paneer: { calories: 130, protein: 7, carbs: 5, fat: 9.5, category: 'protein', micronutrients: { vitaminA: 4000, vitaminC: 15, calcium: 200, iron: 2.0 } },
    rajma: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, category: 'protein', micronutrients: { vitaminA: 0, vitaminC: 1, calcium: 40, iron: 2.5 } },
    pizza: { calories: 266, protein: 11.4, carbs: 33, fat: 10.4, category: 'grain', micronutrients: { vitaminA: 150, vitaminC: 2, calcium: 180, iron: 2.0 } },
    oatmeal: { calories: 68, protein: 2.5, carbs: 12, fat: 1.4, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 9, iron: 1.5 } },
    oats: { calories: 68, protein: 2.5, carbs: 12, fat: 1.4, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 9, iron: 1.5 } },
    poha: { calories: 110, protein: 2, carbs: 25, fat: 0.2, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 1.0 } },
    upma: { calories: 136, protein: 3, carbs: 22, fat: 4, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 15, iron: 0.8 } },
    pav_bhaji: { calories: 152, protein: 4, carbs: 25, fat: 4, category: 'grain', micronutrients: { vitaminA: 200, vitaminC: 8, calcium: 20, iron: 1.0 } },
    vada_pav: { calories: 280, protein: 7, carbs: 45, fat: 8, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 5, calcium: 15, iron: 1.0 } },
    bhel_puri: { calories: 196, protein: 5, carbs: 35, fat: 4, category: 'grain', micronutrients: { vitaminA: 50, vitaminC: 3, calcium: 10, iron: 1.0 } },
    dhokla: { calories: 156, protein: 6, carbs: 24, fat: 4, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 15, iron: 1.2 } },
    khichdi: { calories: 120, protein: 4, carbs: 20, fat: 2, category: 'grain', micronutrients: { vitaminA: 10, vitaminC: 0, calcium: 15, iron: 1.0 } },
    dal: { calories: 117, protein: 6.8, carbs: 19, fat: 1.5, category: 'protein', micronutrients: { vitaminA: 100, vitaminC: 2, calcium: 30, iron: 1.5 } },
    mutton: { calories: 289, protein: 25, carbs: 0, fat: 21, category: 'protein', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 12, iron: 2.5 } },
    mutton_curry: { calories: 189, protein: 18, carbs: 5, fat: 11, category: 'protein', micronutrients: { vitaminA: 50, vitaminC: 3, calcium: 15, iron: 2.0 } },
    ghee: { calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy', micronutrients: { vitaminA: 840, vitaminC: 0, calcium: 0, iron: 0 } },
    curd: { calories: 63, protein: 3.3, carbs: 4, fat: 3.7, category: 'dairy', micronutrients: { vitaminA: 27, vitaminC: 0, calcium: 120, iron: 0.1 } },
    dahi: { calories: 63, protein: 3.3, carbs: 4, fat: 3.7, category: 'dairy', micronutrients: { vitaminA: 27, vitaminC: 0, calcium: 120, iron: 0.1 } },
    lassi: { calories: 80, protein: 3, carbs: 14, fat: 1.3, category: 'dairy', micronutrients: { vitaminA: 30, vitaminC: 1, calcium: 100, iron: 0.1 } },
    chai: { calories: 50, protein: 1, carbs: 8, fat: 1.5, category: 'beverage', micronutrients: { vitaminA: 10, vitaminC: 0, calcium: 30, iron: 0.2 } },
    tea: { calories: 50, protein: 1, carbs: 8, fat: 1.5, category: 'beverage', micronutrients: { vitaminA: 10, vitaminC: 0, calcium: 30, iron: 0.2 } },
    jalebi: { calories: 450, protein: 1, carbs: 80, fat: 14, category: 'other', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 0.5 } },
    gulab_jamun: { calories: 319, protein: 5, carbs: 50, fat: 11, category: 'other', micronutrients: { vitaminA: 20, vitaminC: 0, calcium: 30, iron: 0.5 } },
    halwa: { calories: 351, protein: 4, carbs: 50, fat: 15, category: 'other', micronutrients: { vitaminA: 200, vitaminC: 0, calcium: 20, iron: 1.0 } },
    kheer: { calories: 100, protein: 3, carbs: 15, fat: 3.1, category: 'dairy', micronutrients: { vitaminA: 30, vitaminC: 0, calcium: 80, iron: 0.2 } },
    burger: { calories: 295, protein: 17, carbs: 24, fat: 14, category: 'other', micronutrients: { vitaminA: 50, vitaminC: 2, calcium: 100, iron: 2.5 } },
    sandwich: { calories: 250, protein: 10, carbs: 30, fat: 10, category: 'grain', micronutrients: { vitaminA: 40, vitaminC: 3, calcium: 80, iron: 1.5 } },
    maggi: { calories: 205, protein: 4.6, carbs: 29, fat: 8.2, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 1.0 } },
    noodles: { calories: 205, protein: 4.6, carbs: 29, fat: 8.2, category: 'grain', micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 10, iron: 1.0 } },
    fried_rice: { calories: 163, protein: 4, carbs: 24, fat: 6, category: 'grain', micronutrients: { vitaminA: 50, vitaminC: 2, calcium: 15, iron: 0.8 } },
    pulao: { calories: 145, protein: 3, carbs: 22, fat: 5, category: 'grain', micronutrients: { vitaminA: 40, vitaminC: 2, calcium: 12, iron: 0.7 } },
    sweet_potato: { calories: 87, protein: 1.6, carbs: 20, fat: 0.1, category: 'vegetable', micronutrients: { vitaminA: 14187, vitaminC: 2.4, calcium: 30, iron: 0.6 } },
    paneer_tikka: { calories: 210, protein: 15, carbs: 6, fat: 14, category: 'protein', micronutrients: { vitaminA: 100, vitaminC: 5, calcium: 300, iron: 0.5 } },
    tandoori_chicken: { calories: 148, protein: 22, carbs: 3, fat: 5, category: 'protein', micronutrients: { vitaminA: 80, vitaminC: 2, calcium: 15, iron: 1.5 } },
    aloo_gobi: { calories: 80, protein: 2, carbs: 10, fat: 3.5, category: 'vegetable', micronutrients: { vitaminA: 100, vitaminC: 30, calcium: 20, iron: 0.5 } },
    matar_paneer: { calories: 140, protein: 7, carbs: 8, fat: 9, category: 'protein', micronutrients: { vitaminA: 100, vitaminC: 5, calcium: 200, iron: 1.0 } },
    aloo_paratha: { calories: 300, protein: 5.5, carbs: 42, fat: 12, category: 'grain', micronutrients: { vitaminA: 10, vitaminC: 5, calcium: 20, iron: 1.5 } },
    samosa: { calories: 262, protein: 5, carbs: 28, fat: 14.5, category: 'other', micronutrients: { vitaminA: 20, vitaminC: 5, calcium: 15, iron: 1.0 } },
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
    strawberry: 150,
    paneer: 100,
    dal_tadka: 200,
    roti: 40,
    chicken_curry: 250,
    spinach: 100,
    soya_chunks: 100,
    boiled_soya_chunks: 100,
    chicken_thigh: 100,
    beef: 100,
    pork: 100,
    fish: 100,
};

// Simple food detection (in production, use ML model)
function detectFoodInImage(imageBuffer) {
    // Placeholder: In real implementation, use food recognition ML model
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

/**
 * Calculate nutrition. Tries local database first, then AI.
 */
async function calculateFoodNutrition(foodName, weightGrams, foodState = 'cooked') {
    const foodNameLower = foodName.toLowerCase().replace(/\s+/g, '_');

    // Try to find exact or fuzzy match in local database first
    let foodData = null;
    let searchKey = foodNameLower;

    // Handle common aliases
    const ALIASES = {
        'soya': 'soya_chunks', 'chapathi': 'chapati', 'roti': 'roti', 'chapati': 'chapati',
        'dal': 'dal_tadka', 'daal': 'dal_tadka', 'toor_dal': 'dal_tadka', 'arhar_dal': 'dal_tadka',
        'chana': 'chole', 'chickpea': 'chole', 'chickpeas': 'chole',
        'kidney_beans': 'rajma', 'rajmah': 'rajma',
        'yoghurt': 'yogurt', 'dahi': 'dahi', 'curd': 'curd',
        'chawal': 'rice', 'basmati': 'rice', 'white_rice': 'rice',
        'anda': 'egg', 'eggs': 'egg',
        'murgh': 'chicken_curry', 'chicken': 'chicken_breast',
        'oats': 'oatmeal', 'porridge': 'oatmeal',
        'instant_noodles': 'maggi', 'maggie': 'maggi',
        'tea': 'chai', 'indian_tea': 'chai',
        'paneer_butter_masala': 'butter_chicken',
        'palak_panir': 'palak_paneer', 'saag_paneer': 'palak_paneer',
        'gobi_aloo': 'aloo_gobi',
    };
    if (ALIASES[searchKey]) searchKey = ALIASES[searchKey];

    // 1. Try exact match with state prefix
    const statePrefix = foodState === 'raw' ? 'raw_' : 'boiled_';
    const exactMatch = FOOD_DATABASE[statePrefix + searchKey] || FOOD_DATABASE[searchKey];

    if (exactMatch) {
        foodData = exactMatch;
    }

    // 2. Limited Fuzzy match - Only if search name is very short and matches a key exactly
    if (!foodData) {
        // Avoid greedy matching: "rice" shouldn't match "rice cake" if "rice cake" isn't in DB.
        // Instead, if the user entered "White Rice", and "white_rice" is in DB, it should match.
        const possibleKeys = Object.keys(FOOD_DATABASE);

        // Try to find a key that is contained in the searchKey as a whole word, 
        // or searchKey matches a key almost exactly.
        for (const key of possibleKeys) {
            const normalizedKey = key.replace(/_/g, ' ');
            const normalizedSearch = foodName.toLowerCase().trim();

            if (normalizedSearch === normalizedKey) {
                foodData = FOOD_DATABASE[key];
                break;
            }
        }
    }

    // 3. Special handling for generic terms to prevent wrong matches
    const genericTerms = ['rice', 'bread', 'apple', 'milk', 'egg'];
    if (!foodData && genericTerms.includes(searchKey)) {
        // If it's JUST the generic term, we can use the DB
        foodData = FOOD_DATABASE[searchKey];
    }

    // If it's a complex name like "Chicken Burger" and not found exactly, 
    // DON'T fall back to "Chicken" in DB. Let AI handle it.

    // If found in local database, calculate and return
    if (foodData) {
        const multiplier = weightGrams / 100.0;
        const micronutrients = foodData.micronutrients || { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 };

        return {
            food: foodName,
            weight_grams: Math.round(weightGrams * 10) / 10,
            calories: Math.round(foodData.calories * multiplier * 10) / 10,
            protein: Math.round(foodData.protein * multiplier * 10) / 10,
            carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
            fat: Math.round(foodData.fat * multiplier * 10) / 10,
            category: foodData.category || 'other',
            micronutrients: {
                vitaminA: Math.round(micronutrients.vitaminA * multiplier * 10) / 10,
                vitaminC: Math.round(micronutrients.vitaminC * multiplier * 10) / 10,
                calcium: Math.round(micronutrients.calcium * multiplier * 10) / 10,
                iron: Math.round(micronutrients.iron * multiplier * 10) / 10
            },
            dataSource: 'local'
        };
    }

    // If not found, use AI service
    try {
        console.log(`Food "${foodName}" not found in local DB. Calling AI with state "${foodState}"...`);
        const aiData = await aiService.getNutritionalInfoFromText(foodName, weightGrams, foodState);

        // Sanity Check: If AI returns exact same calories as weight, and it's not a calorie-dense food
        // or if calories are inconsistent with macros, it might be a hallucination.
        const calculatedCal = (aiData.protein * 4) + (aiData.carbs * 4) + (aiData.fat * 9);
        const diff = Math.abs((aiData.calories || 0) - calculatedCal);

        let calories = aiData.calories || 0;
        if (diff > 50 && calculatedCal > 0) {
            console.log(`Fixing inconsistent AI calories: ${calories} -> ${calculatedCal}`);
            calories = Math.round(calculatedCal);
        }

        return {
            food: aiData.foodName || foodName,
            weight_grams: weightGrams,
            foodState: foodState,
            calories: calories,
            protein: aiData.protein || 0,
            carbs: aiData.carbs || 0,
            fat: aiData.fat || 0,
            category: 'other',
            micronutrients: aiData.micronutrients || { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 },
            dataSource: 'ai',
            confidence: aiData.confidence || 0.7
        };
    } catch (error) {
        console.error('AI estimation failed, falling back to defaults:', error);
        // Final fallback: use reasonable average food values per 100g
        const fallbackMultiplier = weightGrams / 100.0;
        return {
            food: foodName,
            weight_grams: weightGrams,
            calories: Math.round(200 * fallbackMultiplier),
            protein: Math.round(8 * fallbackMultiplier * 10) / 10,
            carbs: Math.round(25 * fallbackMultiplier * 10) / 10,
            fat: Math.round(6 * fallbackMultiplier * 10) / 10,
            category: 'other',
            micronutrients: { vitaminA: 0, vitaminC: 0, calcium: 20, iron: 1.0 },
            dataSource: 'fallback'
        };
    }
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
    calculateFoodNutrition,
    getFoodDatabase,
    getAllFoodNames
};

