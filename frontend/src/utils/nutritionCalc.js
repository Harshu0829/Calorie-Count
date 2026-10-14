/**
 * nutritionCalc.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all calorie / macro calculations in Apex.
 *
 * Formula used: Mifflin–St Jeor
 *   Male  : BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5
 *   Female: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161
 *   Other : average of male / female constants  (+5 + -161) / 2 = -78
 *
 * TDEE = BMR × activity multiplier
 *
 * Goal adjustment:
 *   lose     → TDEE − 500 kcal/day  (~0.5 kg/week deficit)
 *   gain     → TDEE + 300 kcal/day
 *   maintain → TDEE
 *
 * Macro allocation (applied to the ACTIVE calorie goal):
 *   Protein: 2 g/kg body weight (clamped so protein kcal ≤ 40 % of goal)
 *   Fat    : 25 % of goal kcal
 *   Carbs  : remainder
 *
 * Medical adjustments (evidence-informed, not medical advice):
 *   hypothyroidism : TDEE reduced by 10 % before goal adjustment
 *   diabetes       : carbs capped at 35 % of goal kcal
 *   kidney_issues  : protein reduced to 0.8 g/kg
 *
 * Rounding policy: all gram targets rounded to nearest integer.
 *   Macro kcal total may differ from goal by ≤ 15 kcal due to rounding.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Activity multipliers (Harris–Benedict PAL values) */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

/** Goal calorie adjustments in kcal/day */
export const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

/**
 * Validate the biometric inputs required for a reliable calculation.
 * Returns { valid: true } or { valid: false, message: string }.
 */
export function validateProfile({ weight, height, age, gender }) {
  const checks = [
    [!weight || isNaN(weight) || weight <= 0, 'Weight must be a positive number (kg).'],
    [weight < 20 || weight > 500, 'Weight must be between 20 and 500 kg.'],
    [!height || isNaN(height) || height <= 0, 'Height must be a positive number (cm).'],
    [height < 50 || height > 280, 'Height must be between 50 and 280 cm.'],
    [!age || isNaN(age) || age <= 0, 'Age must be a positive number.'],
    [age < 10 || age > 120, 'Age must be between 10 and 120.'],
    [!gender || !['male', 'female', 'other'].includes(gender), 'Please select a gender.'],
  ];

  for (const [fail, message] of checks) {
    if (fail) return { valid: false, message };
  }
  return { valid: true };
}

/**
 * Calculate BMR using Mifflin–St Jeor.
 * Requires: weight (kg), height (cm), age (years), gender ('male'|'female'|'other').
 * Returns: BMR in kcal/day (rounded integer).
 */
export function calculateBMR({ weight, height, age, gender }) {
  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  let genderConstant;
  if (gender === 'male') genderConstant = 5;
  else if (gender === 'female') genderConstant = -161;
  else genderConstant = -78; // average for 'other'

  const bmr = 10 * w + 6.25 * h - 5 * a + genderConstant;
  return Math.round(bmr);
}

/**
 * Calculate TDEE (maintenance calories).
 * Applies hypothyroidism adjustment BEFORE goal offset.
 */
export function calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory }) {
  const bmr = calculateBMR({ weight, height, age, gender });
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;
  let tdee = Math.round(bmr * multiplier);

  // Medical: hypothyroidism lowers metabolic rate
  if (medicalHistory === 'hypothyroidism') {
    tdee = Math.round(tdee * 0.9);
  }

  return tdee;
}

/**
 * Calculate the recommended daily calorie TARGET based on the user's goal.
 * Returns the recommended target (number).
 */
export function calculateRecommendedCalorieTarget({
  weight, height, age, gender, activityLevel, medicalHistory, goalType,
}) {
  const tdee = calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory });
  const adjustment = GOAL_ADJUSTMENTS[goalType] ?? 0;
  // Safety: never recommend below 1200 kcal
  return Math.max(1200, tdee + adjustment);
}

/**
 * Calculate macro targets (protein, carbs, fat in grams) from a given calorie goal.
 *
 * All macros are derived from `calorieGoal` — this is the critical contract.
 * Do NOT pass TDEE here if the user has a different calorie target.
 *
 * @param {object} params
 * @param {number} params.calorieGoal - The ACTIVE daily calorie target (kcal)
 * @param {number} params.weight      - Body weight in kg
 * @param {string} params.medicalHistory
 *
 * @returns {{ protein: number, carbs: number, fat: number, macroKcal: number, delta: number }}
 *   delta = macroKcal − calorieGoal (should be within ±15 kcal)
 */
export function calculateMacros({ calorieGoal, weight, medicalHistory }) {
  const goal = Number(calorieGoal);
  const w = Number(weight);

  // ── Protein ─────────────────────────────────────────────────────────────
  let protein;
  if (medicalHistory === 'kidney_issues') {
    protein = Math.round(w * 0.8); // reduced protein for kidney patients
  } else {
    protein = Math.round(w * 2); // 2 g/kg standard high-protein
    // Clamp: protein kcal must not exceed 40% of goal
    const maxProteinKcal = goal * 0.4;
    if (protein * 4 > maxProteinKcal) {
      protein = Math.floor(maxProteinKcal / 4);
    }
  }

  const proteinKcal = protein * 4;

  // ── Fat ──────────────────────────────────────────────────────────────────
  const fat = Math.round((goal * 0.25) / 9);
  const fatKcal = fat * 9;

  // ── Carbs ─────────────────────────────────────────────────────────────────
  let carbs;
  if (medicalHistory === 'diabetes') {
    // Cap carbs at 35% of goal for blood sugar management
    carbs = Math.round((goal * 0.35) / 4);
    // Recalculate fat from the remainder
    const remainingKcal = goal - proteinKcal - carbs * 4;
    const adjustedFat = Math.max(0, Math.round(remainingKcal / 9));
    const macroKcal = proteinKcal + carbs * 4 + adjustedFat * 9;
    return {
      protein,
      carbs,
      fat: adjustedFat,
      macroKcal,
      delta: macroKcal - goal,
    };
  } else {
    carbs = Math.max(0, Math.round((goal - proteinKcal - fatKcal) / 4));
  }

  const macroKcal = proteinKcal + carbs * 4 + fat * 9;
  return {
    protein,
    carbs,
    fat,
    macroKcal,
    delta: macroKcal - goal,
  };
}

/**
 * Full calculation pipeline: given a user profile, return all computed values.
 *
 * @param {object} profile - User profile fields
 * @returns {object|null} null if profile is invalid, otherwise all computed targets
 */
export function computeNutritionPlan(profile) {
  const {
    weight, height, age, gender,
    activityLevel = 'sedentary',
    medicalHistory = 'none',
    goalType = 'maintain',
    customCalorieGoal = null, // if user has manually overridden the goal
  } = profile;

  const validation = validateProfile({ weight, height, age, gender });
  if (!validation.valid) return { error: validation.message };

  const bmr = calculateBMR({ weight, height, age, gender });
  const maintenanceCalories = calculateTDEE({ weight, height, age, gender, activityLevel, medicalHistory });
  const recommendedCalorieTarget = calculateRecommendedCalorieTarget({
    weight, height, age, gender, activityLevel, medicalHistory, goalType,
  });

  // The ACTIVE goal is the user's custom value if set, otherwise the recommendation
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
