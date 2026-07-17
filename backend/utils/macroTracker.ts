/**
 * Comprehensive Macro Tracking System
 * 
 * Provides BMR/TDEE calculation and a full food entry management system
 * with strict macro/calorie validation and daily progress tracking.
 */

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Interface for a single food entry
 */
export interface FoodEntry {
  id: string;
  name: string;
  servingSize: number; // in g or ml
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  mealType: MealType;
  timestamp: Date;
}

/**
 * Interface for daily nutrition totals
 */
export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Interface for daily progress report
 */
export interface ProgressReport {
  consumed: DailyTotals;
  target: DailyTotals;
  percentage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  warnings: string[];
}

// ==========================================
// CONSTANTS
// ==========================================

export const CAL_CONSTANTS = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
  ALCOHOL: 7
} as const;

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

const MACRO_RATIOS: Record<FitnessGoal, { p: number; c: number; f: number }> = {
  weight_loss: { p: 0.40, c: 0.30, f: 0.30 },
  muscle_gain: { p: 0.30, c: 0.50, f: 0.20 },
  maintenance: { p: 0.25, c: 0.50, f: 0.25 }
};

// ==========================================
// IN-MEMORY STORE
// ==========================================

let foodEntries: FoodEntry[] = [];

// ==========================================
// CORE CALCULATIONS (PART 1)
// ==========================================

/**
 * Calculates BMR using Mifflin-St Jeor formula
 */
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculates TDEE based on BMR and Activity Level
 */
export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

/**
 * Calculates target macros based on TDEE and Goal
 */
export function getTargetMacros(tdee: number, goal: FitnessGoal): DailyTotals {
  const calories = Math.round(tdee);
  const { p, c, f } = MACRO_RATIOS[goal];
  return {
    calories,
    protein: Math.round((calories * p) / CAL_CONSTANTS.PROTEIN),
    carbs: Math.round((calories * c) / CAL_CONSTANTS.CARBS),
    fat: Math.round((calories * f) / CAL_CONSTANTS.FAT)
  };
}

// ==========================================
// FOOD ENTRY SYSTEM (PART 2)
// ==========================================

/**
 * Validates that calories match the sum of macros (±2 kcal tolerance)
 */
function validateEntryMacros(entry: Omit<FoodEntry, 'id' | 'timestamp'>): void {
  const calculated = (entry.protein_g * CAL_CONSTANTS.PROTEIN) + 
                     (entry.carbs_g * CAL_CONSTANTS.CARBS) + 
                     (entry.fat_g * CAL_CONSTANTS.FAT);
  
  const diff = Math.abs(calculated - entry.calories);
  if (diff > 2) {
    throw new Error(
      `Invalid nutrition data for "${entry.name}":\n` +
      `- Reported Calories: ${entry.calories} kcal\n` +
      `- Calculated from Macros: ${calculated.toFixed(1)} kcal ` +
      `(${entry.protein_g}g P, ${entry.carbs_g}g C, ${entry.fat_g}g F)\n` +
      `- Difference: ${diff.toFixed(1)} kcal (Max tolerance: 2 kcal).\n` +
      `Please verify your macro inputs.`
    );
  }
}

/**
 * Adds a new food entry after validation
 */
export function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'timestamp'>): FoodEntry {
  validateEntryMacros(entry);
  const newEntry: FoodEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date()
  };
  foodEntries.push(newEntry);
  return newEntry;
}

/**
 * Edits an existing food entry and re-validates
 */
export function editFoodEntry(id: string, updates: Partial<Omit<FoodEntry, 'id' | 'timestamp'>>): FoodEntry {
  const index = foodEntries.findIndex(e => e.id === id);
  if (index === -1) throw new Error(`Entry with id ${id} not found`);

  const updatedEntry = { ...foodEntries[index], ...updates };
  validateEntryMacros(updatedEntry);
  
  foodEntries[index] = updatedEntry;
  return updatedEntry;
}

/**
 * Deletes a food entry
 */
export function deleteFoodEntry(id: string): void {
  foodEntries = foodEntries.filter(e => e.id !== id);
}

/**
 * Proportionally recalculates all macros when serving size changes
 */
export function scaleByServing(entry: FoodEntry, newServingSize: number): FoodEntry {
  const ratio = newServingSize / entry.servingSize;
  return {
    ...entry,
    servingSize: newServingSize,
    calories: Math.round(entry.calories * ratio),
    protein_g: Number((entry.protein_g * ratio).toFixed(1)),
    carbs_g: Number((entry.carbs_g * ratio).toFixed(1)),
    fat_g: Number((entry.fat_g * ratio).toFixed(1))
  };
}

// ==========================================
// DAILY TRACKING (PART 3)
// ==========================================

/**
 * Returns sum of nutrition for all entries on a specific date
 */
export function getDailyTotals(date: Date): DailyTotals {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
  const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

  return foodEntries
    .filter(e => {
      const t = e.timestamp.getTime();
      return t >= startOfDay && t <= endOfDay;
    })
    .reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein_g,
      carbs: acc.carbs + curr.carbs_g,
      fat: acc.fat + curr.fat_g
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

/**
 * Returns consumed vs target + progress percentages
 */
export function getDailyProgress(date: Date, target: DailyTotals): ProgressReport {
  const consumed = getDailyTotals(date);
  const warnings: string[] = [];

  // Part 4: 5% deviation safety rule
  const calorieDiffPercent = Math.abs((consumed.calories - target.calories) / target.calories) * 100;
  if (calorieDiffPercent > 5) {
    warnings.push(`Warning: Daily calorie intake deviates by ${calorieDiffPercent.toFixed(1)}% from target!`);
  }

  const getPercent = (c: number, t: number) => Number(((c / t) * 100).toFixed(1));

  return {
    consumed,
    target,
    percentage: {
      calories: getPercent(consumed.calories, target.calories),
      protein: getPercent(consumed.protein, target.protein),
      carbs: getPercent(consumed.carbs, target.carbs),
      fat: getPercent(consumed.fat, target.fat)
    },
    warnings
  };
}

/**
 * Returns how many grams/calories are left for the day
 */
export function getRemainingMacros(date: Date, target: DailyTotals): DailyTotals {
  const consumed = getDailyTotals(date);
  return {
    calories: Math.max(0, target.calories - consumed.calories),
    protein: Math.max(0, target.protein - consumed.protein),
    carbs: Math.max(0, target.carbs - consumed.carbs),
    fat: Math.max(0, target.fat - consumed.fat)
  };
}

/**
 * Returns totals grouped by meal type
 */
export function getMealBreakdown(date: Date): Record<MealType, DailyTotals> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
  const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

  const dayEntries = foodEntries.filter(e => {
    const t = e.timestamp.getTime();
    return t >= startOfDay && t <= endOfDay;
  });

  const empty = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const breakdown: Record<MealType, DailyTotals> = {
    breakfast: empty(),
    lunch: empty(),
    dinner: empty(),
    snack: empty()
  };

  dayEntries.forEach(e => {
    breakdown[e.mealType].calories += e.calories;
    breakdown[e.mealType].protein += e.protein_g;
    breakdown[e.mealType].carbs += e.carbs_g;
    breakdown[e.mealType].fat += e.fat_g;
  });

  return breakdown;
}

// ==========================================
// WORKED EXAMPLES (PART 5)
// ==========================================

/*
// Reset store for examples
foodEntries = [];

// 1. Adding a meal (Healthy Breakfast)
const eggs = addFoodEntry({
  name: "Large Eggs (2x)",
  servingSize: 100,
  calories: 140,
  protein_g: 13,
  carbs_g: 1,
  fat_g: 9.3, // (13*4) + (1*4) + (9.3*9) = 52 + 4 + 83.7 = 139.7 (Valid)
  mealType: 'breakfast'
});

// 2. Scaling a serving (Double the eggs)
const doubleEggs = scaleByServing(eggs, 200);
console.log("Scaled Eggs:", doubleEggs.calories); // 280

// 3. Getting daily totals
const totals = getDailyTotals(new Date());
console.log("Daily Totals:", totals);

// 4. Checking Progress (Target: 2000 kcal)
const myTarget: DailyTotals = { calories: 2000, protein: 150, carbs: 200, fat: 66 };
const progress = getDailyProgress(new Date(), myTarget);
console.log("Progress:", progress.percentage.calories + "%");
if (progress.warnings.length) console.log(progress.warnings[0]);

// 5. Deliberate Bad Entry (Will trigger Error)
try {
  addFoodEntry({
    name: "Fake Protein Bar",
    servingSize: 50,
    calories: 100,
    protein_g: 30, // 30*4 = 120 (Already exceeds 100 kcal)
    carbs_g: 10,
    fat_g: 5,
    mealType: 'snack'
  });
} catch (e) {
  console.error("Caught expected error:", e.message);
}
*/
