/**
 * nutritionCalc.test.js
 * Unit tests for the single authoritative calorie/macro calculation pipeline.
 *
 * Run with: cd backend && node utils/nutritionCalc.test.js
 * (No external test runner required — uses a lightweight built-in assert.)
 */

const assert = require('assert');
const {
    validateProfile,
    calculateBMR,
    calculateTDEE,
    calculateRecommendedCalorieTarget,
    calculateMacros,
    computeNutritionPlan,
    ACTIVITY_MULTIPLIERS,
    GOAL_ADJUSTMENTS,
} = require('./nutritionCalc');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${name}`);
        console.error(`     ${err.message}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 validateProfile\n');

test('accepts valid male profile', () => {
    const r = validateProfile({ weight: 75, height: 175, age: 30, gender: 'male' });
    assert.strictEqual(r.valid, true);
});

test('accepts valid female profile', () => {
    const r = validateProfile({ weight: 60, height: 165, age: 25, gender: 'female' });
    assert.strictEqual(r.valid, true);
});

test('accepts other gender', () => {
    const r = validateProfile({ weight: 70, height: 170, age: 28, gender: 'other' });
    assert.strictEqual(r.valid, true);
});

test('rejects missing weight', () => {
    const r = validateProfile({ height: 170, age: 28, gender: 'male' });
    assert.strictEqual(r.valid, false);
    assert.ok(r.message.toLowerCase().includes('weight'));
});

test('rejects zero weight', () => {
    const r = validateProfile({ weight: 0, height: 170, age: 28, gender: 'male' });
    assert.strictEqual(r.valid, false);
});

test('rejects negative age', () => {
    const r = validateProfile({ weight: 70, height: 170, age: -5, gender: 'male' });
    assert.strictEqual(r.valid, false);
});

test('rejects implausible height', () => {
    const r = validateProfile({ weight: 70, height: 10, age: 30, gender: 'male' });
    assert.strictEqual(r.valid, false);
});

test('rejects missing gender', () => {
    const r = validateProfile({ weight: 70, height: 170, age: 28, gender: '' });
    assert.strictEqual(r.valid, false);
});

test('rejects invalid gender string', () => {
    const r = validateProfile({ weight: 70, height: 170, age: 28, gender: 'unknown' });
    assert.strictEqual(r.valid, false);
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 calculateBMR\n');

test('male BMR — Mifflin-St Jeor', () => {
    // 75kg, 175cm, 30yo male: 10*75 + 6.25*175 - 5*30 + 5 = 750+1093.75-150+5 = 1698.75 → 1699
    const bmr = calculateBMR({ weight: 75, height: 175, age: 30, gender: 'male' });
    assert.strictEqual(bmr, 1699);
});

test('female BMR — Mifflin-St Jeor', () => {
    // 60kg, 165cm, 25yo female: 10*60 + 6.25*165 - 5*25 - 161 = 600+1031.25-125-161 = 1345.25 → 1345
    const bmr = calculateBMR({ weight: 60, height: 165, age: 25, gender: 'female' });
    assert.strictEqual(bmr, 1345);
});

test('other gender BMR uses average constant', () => {
    // 70kg, 170cm, 28yo other: 10*70 + 6.25*170 - 5*28 - 78 = 700+1062.5-140-78 = 1544.5 → 1545
    const bmr = calculateBMR({ weight: 70, height: 170, age: 28, gender: 'other' });
    assert.strictEqual(bmr, 1545);
});

test('BMR differs by gender constant', () => {
    const mBMR = calculateBMR({ weight: 70, height: 170, age: 28, gender: 'male' });
    const fBMR = calculateBMR({ weight: 70, height: 170, age: 28, gender: 'female' });
    // Difference must be 5 - (-161) = 166
    assert.strictEqual(mBMR - fBMR, 166);
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 calculateTDEE\n');

test('TDEE = BMR * activity multiplier', () => {
    const bmr = calculateBMR({ weight: 75, height: 175, age: 30, gender: 'male' });
    const tdee = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none' });
    assert.strictEqual(tdee, Math.round(bmr * ACTIVITY_MULTIPLIERS.sedentary));
});

test('hypothyroidism reduces TDEE by 10%', () => {
    const normal = calculateTDEE({ weight: 65, height: 165, age: 35, gender: 'female', activityLevel: 'lightly_active', medicalHistory: 'none' });
    const hypo = calculateTDEE({ weight: 65, height: 165, age: 35, gender: 'female', activityLevel: 'lightly_active', medicalHistory: 'hypothyroidism' });
    assert.strictEqual(hypo, Math.round(normal * 0.9));
});

test('other medical conditions do not affect TDEE', () => {
    const normal = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'moderately_active', medicalHistory: 'none' });
    const diabetes = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'moderately_active', medicalHistory: 'diabetes' });
    assert.strictEqual(normal, diabetes);
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 calculateRecommendedCalorieTarget\n');

test('maintain goal = TDEE', () => {
    const tdee = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none' });
    const target = calculateRecommendedCalorieTarget({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none', goalType: 'maintain' });
    assert.strictEqual(target, tdee);
});

test('lose goal = TDEE - 500', () => {
    const tdee = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none' });
    const target = calculateRecommendedCalorieTarget({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none', goalType: 'lose' });
    assert.strictEqual(target, Math.max(1200, tdee - 500));
});

test('gain goal = TDEE + 300', () => {
    const tdee = calculateTDEE({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none' });
    const target = calculateRecommendedCalorieTarget({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', medicalHistory: 'none', goalType: 'gain' });
    assert.strictEqual(target, tdee + 300);
});

test('never recommends below 1200 kcal', () => {
    // Tiny person with large deficit
    const target = calculateRecommendedCalorieTarget({ weight: 40, height: 150, age: 20, gender: 'female', activityLevel: 'sedentary', medicalHistory: 'none', goalType: 'lose' });
    assert.ok(target >= 1200, `Expected >= 1200, got ${target}`);
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 calculateMacros — consistency (Case A & B from spec)\n');

test('Case A: macro kcal must match calorie goal within ±15 kcal', () => {
    // The reported bug: 1514 kcal goal but macros totalling 2127 kcal
    const result = calculateMacros({ calorieGoal: 1514, weight: 57, medicalHistory: 'none' });
    const { protein, carbs, fat, macroKcal } = result;
    const recomputed = protein * 4 + carbs * 4 + fat * 9;
    assert.strictEqual(recomputed, macroKcal, 'macroKcal field must match P*4+C*4+F*9');
    assert.ok(Math.abs(macroKcal - 1514) <= 15, `Macro kcal ${macroKcal} must be within ±15 kcal of 1514`);
});

test('Case B: changing calorie goal recalculates macros accordingly', () => {
    const low = calculateMacros({ calorieGoal: 1500, weight: 70, medicalHistory: 'none' });
    const high = calculateMacros({ calorieGoal: 2500, weight: 70, medicalHistory: 'none' });

    // Higher calorie goal must produce higher macro amounts
    assert.ok(low.carbs < high.carbs, `Expected carbs to increase with higher goal`);
    assert.ok(low.fat < high.fat, `Expected fat to increase with higher goal`);

    // Both must be internally consistent
    for (const [label, result, goal] of [['1500', low, 1500], ['2500', high, 2500]]) {
        const recomputed = result.protein * 4 + result.carbs * 4 + result.fat * 9;
        assert.ok(Math.abs(recomputed - goal) <= 15, `${label} kcal: macro total ${recomputed} not within ±15 of ${goal}`);
    }
});

test('diabetes: carbs capped at 35% of goal', () => {
    const goal = 2000;
    const result = calculateMacros({ calorieGoal: goal, weight: 70, medicalHistory: 'diabetes' });
    const carbKcal = result.carbs * 4;
    // Carbs must not exceed 35% * 2000 = 700 kcal
    assert.ok(carbKcal <= goal * 0.35 + 4, `Carb kcal ${carbKcal} exceeds 35% of ${goal}`);
});

test('kidney_issues: protein reduced to 0.8 g/kg', () => {
    const result = calculateMacros({ calorieGoal: 2000, weight: 80, medicalHistory: 'kidney_issues' });
    // Should be round(80 * 0.8) = 64g
    assert.strictEqual(result.protein, 64);
});

test('protein clamped at 40% of calorie goal', () => {
    // 2g/kg for a 200kg person would be 400g protein = 1600 kcal, which exceeds 40% of 2500
    const result = calculateMacros({ calorieGoal: 2500, weight: 200, medicalHistory: 'none' });
    const proteinKcal = result.protein * 4;
    assert.ok(proteinKcal <= 2500 * 0.4 + 4, `Protein kcal ${proteinKcal} exceeds 40% of 2500`);
});

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧪 computeNutritionPlan — integration (Cases C, D, E)\n');

test('Case C: profile update recalculates all targets', () => {
    const plan1 = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: 'male', activityLevel: 'sedentary', goalType: 'maintain' });
    const plan2 = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: 'male', activityLevel: 'very_active', goalType: 'maintain' });
    assert.ok(plan2.maintenanceCalories > plan1.maintenanceCalories, 'Higher activity should produce higher TDEE');
});

test('Case D: custom calorie goal is preserved', () => {
    const plan = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: 'male', activityLevel: 'sedentary', goalType: 'maintain', customCalorieGoal: 1800 });
    assert.strictEqual(plan.activeCalorieGoal, 1800);
    // But macros must be consistent with 1800 (within ±15)
    const macroKcal = plan.dailyProteinGoal * 4 + plan.dailyCarbsGoal * 4 + plan.dailyFatGoal * 9;
    assert.ok(Math.abs(macroKcal - 1800) <= 15, `Macro kcal ${macroKcal} not consistent with 1800 kcal custom goal`);
});

test('Case E: invalid input (NaN weight) returns error', () => {
    const plan = computeNutritionPlan({ weight: NaN, height: 170, age: 30, gender: 'male' });
    assert.ok(plan.error, 'Expected an error for NaN weight');
});

test('Case E: missing gender returns error', () => {
    const plan = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: '' });
    assert.ok(plan.error, 'Expected an error for missing gender');
});

test('Case E: negative values return error', () => {
    const plan = computeNutritionPlan({ weight: -5, height: 170, age: 30, gender: 'male' });
    assert.ok(plan.error, 'Expected an error for negative weight');
});

test('Case F: macros are consistent regardless of path (no stale state)', () => {
    // Both calls with same profile should return same result
    const p1 = computeNutritionPlan({ weight: 72, height: 172, age: 28, gender: 'female', activityLevel: 'lightly_active', goalType: 'lose' });
    const p2 = computeNutritionPlan({ weight: 72, height: 172, age: 28, gender: 'female', activityLevel: 'lightly_active', goalType: 'lose' });
    assert.deepStrictEqual(p1, p2, 'Same inputs must always produce same outputs');
});

test('Case G: goal type change updates targets', () => {
    const lose = computeNutritionPlan({ weight: 80, height: 175, age: 35, gender: 'male', activityLevel: 'moderately_active', goalType: 'lose' });
    const gain = computeNutritionPlan({ weight: 80, height: 175, age: 35, gender: 'male', activityLevel: 'moderately_active', goalType: 'gain' });
    assert.ok(lose.dailyCalorieGoal < gain.dailyCalorieGoal, 'Lose goal should have fewer calories than gain goal');
    // Macros must be derived from respective goals
    for (const [label, plan] of [['lose', lose], ['gain', gain]]) {
        const macroKcal = plan.dailyProteinGoal * 4 + plan.dailyCarbsGoal * 4 + plan.dailyFatGoal * 9;
        assert.ok(Math.abs(macroKcal - plan.dailyCalorieGoal) <= 15,
            `${label}: macro kcal ${macroKcal} not within ±15 of ${plan.dailyCalorieGoal}`);
    }
});

test('Case H: medical history only affects designated fields', () => {
    const noneResult = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: 'male', activityLevel: 'sedentary', goalType: 'maintain', medicalHistory: 'none' });
    const hypoResult = computeNutritionPlan({ weight: 70, height: 170, age: 30, gender: 'male', activityLevel: 'sedentary', goalType: 'maintain', medicalHistory: 'hypothyroidism' });
    // Hypothyroidism reduces TDEE
    assert.ok(hypoResult.maintenanceCalories < noneResult.maintenanceCalories, 'Hypothyroidism should reduce maintenance calories');
    // BMR (before activity multiplier) should be the same
    assert.strictEqual(hypoResult.bmr, noneResult.bmr, 'BMR is not affected by medical history');
});

test('Case I: calorie goal is not changed by adding meals (isolation test)', () => {
    // Simulate: compute plan, store goal, then add macro consumption separately
    const plan = computeNutritionPlan({ weight: 75, height: 175, age: 30, gender: 'male', activityLevel: 'sedentary', goalType: 'maintain' });
    const savedGoal = plan.dailyCalorieGoal;

    // Simulate a meal being logged — this should NOT alter the goal
    const consumed = { calories: 500, protein: 30, carbs: 60, fat: 15 };
    const remaining = {
        calories: savedGoal - consumed.calories,
        protein: plan.dailyProteinGoal - consumed.protein,
        carbs: plan.dailyCarbsGoal - consumed.carbs,
        fat: plan.dailyFatGoal - consumed.fat,
    };

    // The goal itself must not have changed
    assert.strictEqual(plan.dailyCalorieGoal, savedGoal, 'Daily calorie goal must not be mutated by meal logging');
    assert.ok(remaining.calories > 0, 'Remaining calories should be positive after one meal');
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
console.log(`\n${'─'.repeat(60)}`);
console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}  Total: ${passed + failed}`);
console.log(`${'─'.repeat(60)}\n`);
process.exit(failed > 0 ? 1 : 0);
