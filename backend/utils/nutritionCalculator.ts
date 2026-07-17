/**
 * Nutrition Calculation Utility
 * 
 * Provides high-precision macro calculation logic based on the Mifflin-St Jeor formula
 * and goal-based macro distribution.
 */

/**
 * Valid activity levels for TDEE calculation
 */
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

/**
 * Valid fitness goals for macro distribution
 */
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';

/**
 * Input parameters for nutrition calculation
 */
export interface NutritionInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

/**
 * Calculated nutrition results
 */
export interface NutritionResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  validation: {
    calculatedCalories: number;
    difference: number;
    isValid: boolean;
  };
}

/**
 * Calorie-per-gram constants
 */
export const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
  ALCOHOL: 7
} as const;

/**
 * Activity multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

/**
 * Macro ratio splits by fitness goal
 * [Protein%, Carbs%, Fat%]
 */
const MACRO_SPLITS: Record<FitnessGoal, [number, number, number]> = {
  weight_loss: [0.40, 0.30, 0.30],
  muscle_gain: [0.30, 0.50, 0.20],
  maintenance: [0.25, 0.50, 0.25]
};

/**
 * Calculates Basic Metabolic Rate (BMR) using the Mifflin-St Jeor formula.
 * 
 * Formula:
 * Males: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Females: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 * 
 * @param weight - Body weight in kilograms
 * @param height - Height in centimeters
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @returns Calculated BMR
 */
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * 
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - The user's activity intensity
 * @returns Calculated TDEE
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Calculates target calories and macro distribution based on fitness goal.
 * For Weight Loss, a deficit is typically applied (e.g., -500 kcal for ~0.5kg/week),
 * but for this logic, we use TDEE as the baseline and apply the specified ratios.
 * 
 * @param tdee - Total Daily Energy Expenditure
 * @param goal - User's fitness goal
 * @returns Calorie target and macro grams
 */
export function calculateMacros(tdee: number, goal: FitnessGoal): { targetCalories: number; proteinG: number; carbsG: number; fatG: number } {
  const targetCalories = Math.round(tdee);
  const [pRatio, cRatio, fRatio] = MACRO_SPLITS[goal];

  const proteinG = (targetCalories * pRatio) / CALORIES_PER_GRAM.PROTEIN;
  const carbsG = (targetCalories * cRatio) / CALORIES_PER_GRAM.CARBS;
  const fatG = (targetCalories * fRatio) / CALORIES_PER_GRAM.FAT;

  return {
    targetCalories,
    proteinG: Number(proteinG.toFixed(1)),
    carbsG: Number(carbsG.toFixed(1)),
    fatG: Number(fatG.toFixed(1))
  };
}

/**
 * Performs a validation check to ensure macros sum up to total calories.
 * (protein_g × 4) + (carbs_g × 4) + (fat_g × 9) must equal target calories (±1 kcal)
 * 
 * @param calories - Target calorie number
 * @param proteinG - Grams of protein
 * @param carbsG - Grams of carbohydrates
 * @param fatG - Grams of fat
 * @returns Validation results
 */
export function validateMacros(calories: number, proteinG: number, carbsG: number, fatG: number) {
  const calculated = (proteinG * CALORIES_PER_GRAM.PROTEIN) + 
                     (carbsG * CALORIES_PER_GRAM.CARBS) + 
                     (fatG * CALORIES_PER_GRAM.FAT);
  
  const difference = Math.abs(calculated - calories);
  return {
    calculatedCalories: Number(calculated.toFixed(1)),
    difference: Number(difference.toFixed(1)),
    isValid: difference <= 1
  };
}

/**
 * Main entry point for comprehensive nutrition calculation.
 * 
 * @param input - User data required for calculation
 * @returns Full nutrition profile
 */
export function calculateNutrition(input: NutritionInput): NutritionResult {
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.age, input.gender);
  const tdee = calculateTDEE(bmr, input.activityLevel);
  const { targetCalories, proteinG, carbsG, fatG } = calculateMacros(tdee, input.goal);
  const validation = validateMacros(targetCalories, proteinG, carbsG, fatG);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros: {
      proteinGrams: proteinG,
      carbsGrams: carbsG,
      fatGrams: fatG
    },
    validation
  };
}

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
Example 1: Maintenance (Male, 80kg, 180cm, 30y, Moderately Active)
------------------------------------------------------------------
Input: { weightKg: 80, heightCm: 180, age: 30, gender: 'male', activityLevel: 'moderately_active', goal: 'maintenance' }
BMR: (10*80) + (6.25*180) - (5*30) + 5 = 1780
TDEE: 1780 * 1.55 = 2759
Macros (Maintenance 25/50/25):
  Protein: (2759 * 0.25) / 4 = 172.4g
  Carbs: (2759 * 0.50) / 4 = 344.9g
  Fat: (2759 * 0.25) / 9 = 76.6g
Validation: (172.4*4) + (344.9*4) + (76.6*9) = 689.6 + 1379.6 + 689.4 = 2758.6 (within 1 kcal of 2759)
*/

/*
Example 2: Weight Loss (Female, 65kg, 165cm, 25y, Lightly Active)
-----------------------------------------------------------------
Input: { weightKg: 65, heightCm: 165, age: 25, gender: 'female', activityLevel: 'lightly_active', goal: 'weight_loss' }
BMR: (10*65) + (6.25*165) - (5*25) - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
TDEE: 1395.25 * 1.375 = 1918.47
Macros (Weight Loss 40/30/30):
  Protein: (1918 * 0.40) / 4 = 191.8g
  Carbs: (1918 * 0.30) / 4 = 143.9g
  Fat: (1918 * 0.30) / 9 = 63.9g
Validation: (191.8*4) + (143.9*4) + (63.9*9) = 767.2 + 575.6 + 575.1 = 1917.9 (within 1 kcal of 1918)
*/

/*
Example 3: Muscle Gain (Male, 70kg, 175cm, 22y, Very Active)
-----------------------------------------------------------
Input: { weightKg: 70, heightCm: 175, age: 22, gender: 'male', activityLevel: 'very_active', goal: 'muscle_gain' }
BMR: (10*70) + (6.25*175) - (5*22) + 5 = 700 + 1093.75 - 110 + 5 = 1688.75
TDEE: 1688.75 * 1.725 = 2913.09
Macros (Muscle Gain 30/50/20):
  Protein: (2913 * 0.30) / 4 = 218.5g
  Carbs: (2913 * 0.50) / 4 = 364.1g
  Fat: (2913 * 0.20) / 9 = 64.7g
Validation: (218.5*4) + (364.1*4) + (64.7*9) = 874 + 1456.4 + 582.3 = 2912.7 (within 1 kcal of 2913)
*/
