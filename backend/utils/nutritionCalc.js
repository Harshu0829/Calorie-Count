/**
 * nutritionCalc.js  (backend)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all calorie / macro calculations in Apex.
 * Mirrors frontend/src/utils/nutritionCalc.js — keep these in sync.
 *
 * Formula: Mifflin–St Jeor
 *   Male  : BMR = 10×weight + 6.25×height − 5×age + 5
 *   Female: BMR = 10×weight + 6.25×height − 5×age − 161
 *   Other : BMR = 10×weight + 6.25×height − 5×age − 78
 *
 * TDEE = BMR × activity multiplier
 * Goal adjustment: lose −500, maintain 0, gain +300 kcal/day
 * Macros derived from the ACTIVE calorie goal (not TDEE).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
    lose: -500,
    maintain: 0,
    gain: 300,
};

function validateProfile({ weight, height, age, gender }) {
    const checks = [
        [!weight || isNaN(weight) || weight <= 0, 'Weight must be a positive number (kg).'],
        [weight < 20 || weight > 500, 'Weight must be between 20 and 500 kg.'],
        [!height || isNaN(height) || height <= 0, 'Height must be a positive number (cm).'],
        [height < 50 || height > 280, 'Height must be between 50 and 280 cm.'],
        [!age || isNaN(age) || age <= 0, 'Age must be a positive number.'],
        [age < 10 || age > 120, 'Age must be between 10 and 120.'],
        [!gender || !['male', 'female', 'other'].includes(gender), 'Please select a valid gender (male/female/other).'],
    ];

    for (const [fail, message] of checks) {
        if (fail) return { valid: false, message };
    }
    return { valid: true };
}

function calculateBMR({ weight, height, age, gender }) {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);

    let genderConstant;
    if (gender === 'male') genderConstant = 5;
    else if (gender === 'female') genderConstant = -161;
    else genderConstant = -78; // average for 'other'

    return Math.round(10 * w + 6.25 * h - 5 * a + genderConstant);
}

function calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory }) {
    const bmr = calculateBMR({ weight, height, age, gender });
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;
    let tdee = Math.round(bmr * multiplier);

    if (medicalHistory === 'hypothyroidism') {
        tdee = Math.round(tdee * 0.9);
    }

    return tdee;
}

function calculateRecommendedCalorieTarget({ weight, height, age, gender, activityLevel, medicalHistory, goalType }) {
    const tdee = calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory });
    const adjustment = GOAL_ADJUSTMENTS[goalType] ?? 0;
    return Math.max(1200, tdee + adjustment);
}

function calculateMacros({ calorieGoal, weight, medicalHistory }) {
    const goal = Number(calorieGoal);
    const w = Number(weight);

    let protein;
    if (medicalHistory === 'kidney_issues') {
        protein = Math.round(w * 0.8);
    } else {
        protein = Math.round(w * 2);
        const maxProteinKcal = goal * 0.4;
        if (protein * 4 > maxProteinKcal) {
            protein = Math.floor(maxProteinKcal / 4);
        }
    }

    const proteinKcal = protein * 4;
    const fat = Math.round((goal * 0.25) / 9);
    const fatKcal = fat * 9;

    let carbs, finalFat;

    if (medicalHistory === 'diabetes') {
        carbs = Math.round((goal * 0.35) / 4);
        const remainingKcal = goal - proteinKcal - carbs * 4;
        finalFat = Math.max(0, Math.round(remainingKcal / 9));
    } else {
        carbs = Math.max(0, Math.round((goal - proteinKcal - fatKcal) / 4));
        finalFat = fat;
    }

    const macroKcal = proteinKcal + carbs * 4 + finalFat * 9;
    return {
        protein,
        carbs,
        fat: finalFat,
        macroKcal,
        delta: macroKcal - goal,
    };
}

function computeNutritionPlan(profile) {
    const {
        weight, height, age, gender,
        activityLevel = 'sedentary',
        medicalHistory = 'none',
        goalType = 'maintain',
        customCalorieGoal = null,
    } = profile;

    const validation = validateProfile({ weight, height, age, gender });
    if (!validation.valid) return { error: validation.message };

    const bmr = calculateBMR({ weight, height, age, gender });
    const maintenanceCalories = calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory });
    const recommendedCalorieTarget = calculateRecommendedCalorieTarget({
        weight, height, age, gender, activityLevel, medicalHistory, goalType,
    });

    const activeCalorieGoal = customCalorieGoal != null
        ? Math.max(1200, Number(customCalorieGoal))
        : recommendedCalorieTarget;

    const macros = calculateMacros({
        calorieGoal: activeCalorieGoal,
        weight,
        medicalHistory,
    });

    return {
        bmr,
        maintenanceCalories,
        recommendedCalorieTarget,
        activeCalorieGoal,
        dailyCalorieGoal: activeCalorieGoal,
        dailyProteinGoal: macros.protein,
        dailyCarbsGoal: macros.carbs,
        dailyFatGoal: macros.fat,
        macroKcal: macros.macroKcal,
        macroDelta: macros.delta,
    };
}

module.exports = {
    ACTIVITY_MULTIPLIERS,
    GOAL_ADJUSTMENTS,
    validateProfile,
    calculateBMR,
    calculateTDEE,
    calculateRecommendedCalorieTarget,
    calculateMacros,
    computeNutritionPlan,
};
