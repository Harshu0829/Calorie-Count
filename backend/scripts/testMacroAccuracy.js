/**
 * Macro Accuracy Test for Manual Meal Entries
 * Compares local DB + API output against USDA reference values (per 100g)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { calculateFoodNutrition } = require('../utils/foodDatabase');

// USDA Standard Reference values (per 100g, cooked unless noted)
const USDA_REFERENCE = {
    // === LOCAL DB FOODS ===
    'rice': { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, source: 'USDA #20450 (white, cooked)' },
    'egg': { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, source: 'USDA #01129 (whole, raw)' },
    'chicken_breast': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, source: 'USDA #05062 (cooked)' },
    'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, source: 'USDA #09040 (raw)' },
    'apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, source: 'USDA #09003 (raw)' },
    'paneer': { calories: 265, protein: 18.3, carbs: 3.6, fat: 20.8, source: 'IFCT (Indian paneer)' },
    'roti': { calories: 297, protein: 8.7, carbs: 56.0, fat: 3.7, source: 'IFCT (wheat chapati, per 100g flour)' },
    'dal_tadka': { calories: 116, protein: 7.6, carbs: 16.3, fat: 2.4, source: 'IFCT (cooked toor dal)' },
    'milk': { calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0, source: 'USDA #01079 (1% low-fat)' },
    'salmon': { calories: 208, protein: 20.4, carbs: 0, fat: 13.4, source: 'USDA #15086 (Atlantic, cooked)' },
    'broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, source: 'USDA #11090 (raw)' },
    'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, source: 'USDA #11457 (raw)' },
    'potato': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, source: 'USDA #11352 (raw)' },
    'idli': { calories: 58, protein: 2.0, carbs: 12.0, fat: 0.1, source: 'IFCT (steamed rice cake)' },
    'dosa': { calories: 168, protein: 3.9, carbs: 29.0, fat: 3.7, source: 'IFCT (plain dosa)' },
    'chole': { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, source: 'USDA #16057 (chickpeas, cooked)' },
    'paratha': { calories: 260, protein: 5.0, carbs: 40.0, fat: 8.0, source: 'IFCT (plain paratha)' },
    'yogurt': { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, source: 'USDA #01116 (plain, low-fat)' },

    // === NOT IN LOCAL DB (will trigger AI or fallback) ===
    'pizza': { calories: 266, protein: 11.4, carbs: 33.0, fat: 10.4, source: 'USDA #21299 (cheese pizza)' },
    'biryani': { calories: 175, protein: 7.5, carbs: 22.0, fat: 6.5, source: 'IFCT (chicken biryani)' },
    'butter chicken': { calories: 148, protein: 14.0, carbs: 6.0, fat: 8.0, source: 'IFCT estimate' },
    'pasta': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, source: 'USDA #20120 (cooked)' },
    'oatmeal': { calories: 68, protein: 2.5, carbs: 12.0, fat: 1.4, source: 'USDA #08120 (cooked)' },
    'samosa': { calories: 262, protein: 5.0, carbs: 28.0, fat: 14.5, source: 'IFCT (fried, potato)' },
    'naan': { calories: 290, protein: 8.7, carbs: 50.0, fat: 5.7, source: 'IFCT (tandoori naan)' },
    'rajma': { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, source: 'USDA #16038 (kidney beans, cooked)' },
    'palak paneer': { calories: 130, protein: 7.0, carbs: 5.0, fat: 9.5, source: 'IFCT estimate' },
};

const TOLERANCE = {
    calories: 25,  // ±25% tolerance for calories
    protein: 35,   // ±35% tolerance for protein
    carbs: 35,     // ±35% tolerance for carbs
    fat: 50,       // ±50% tolerance for fat (most variable)
};

function calcDeviation(actual, expected) {
    if (expected === 0 && actual === 0) return 0;
    if (expected === 0) return actual > 2 ? 999 : 0; // small absolute values are OK
    return Math.round(Math.abs((actual - expected) / expected) * 100);
}

function getVerdict(deviation, tolerancePercent) {
    if (deviation <= 10) return '✅ Excellent';
    if (deviation <= tolerancePercent) return '⚠️  Acceptable';
    return '❌ INACCURATE';
}

async function runTests() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║        MACRO ACCURACY TEST — Manual Meal Entries                ║');
    console.log('║        Testing calculateFoodNutrition() vs USDA Reference       ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    const results = [];
    const testWeight = 100; // Test at 100g for easy comparison

    for (const [foodName, usda] of Object.entries(USDA_REFERENCE)) {
        try {
            const result = await calculateFoodNutrition(foodName, testWeight, 'cooked');

            const calDev = calcDeviation(result.calories, usda.calories);
            const proDev = calcDeviation(result.protein, usda.protein);
            const carbDev = calcDeviation(result.carbs, usda.carbs);
            const fatDev = calcDeviation(result.fat, usda.fat);

            const hasIssue = calDev > TOLERANCE.calories ||
                             proDev > TOLERANCE.protein ||
                             carbDev > TOLERANCE.carbs ||
                             fatDev > TOLERANCE.fat;

            const entry = {
                food: foodName,
                source: result.dataSource || 'unknown',
                usda, result,
                deviations: { calDev, proDev, carbDev, fatDev },
                hasIssue
            };
            results.push(entry);

            // Print each food result
            const icon = hasIssue ? '❌' : '✅';
            console.log(`${icon} ${foodName.toUpperCase()} (${testWeight}g) — Source: ${result.dataSource}`);
            console.log(`   ┌──────────┬──────────┬──────────┬───────────┬──────────────────┐`);
            console.log(`   │ Macro    │ Got      │ USDA     │ Deviation │ Verdict          │`);
            console.log(`   ├──────────┼──────────┼──────────┼───────────┼──────────────────┤`);
            console.log(`   │ Calories │ ${String(result.calories).padEnd(8)} │ ${String(usda.calories).padEnd(8)} │ ${String(calDev + '%').padEnd(9)} │ ${getVerdict(calDev, TOLERANCE.calories).padEnd(16)} │`);
            console.log(`   │ Protein  │ ${String(result.protein + 'g').padEnd(8)} │ ${String(usda.protein + 'g').padEnd(8)} │ ${String(proDev + '%').padEnd(9)} │ ${getVerdict(proDev, TOLERANCE.protein).padEnd(16)} │`);
            console.log(`   │ Carbs    │ ${String(result.carbs + 'g').padEnd(8)} │ ${String(usda.carbs + 'g').padEnd(8)} │ ${String(carbDev + '%').padEnd(9)} │ ${getVerdict(carbDev, TOLERANCE.carbs).padEnd(16)} │`);
            console.log(`   │ Fat      │ ${String(result.fat + 'g').padEnd(8)} │ ${String(usda.fat + 'g').padEnd(8)} │ ${String(fatDev + '%').padEnd(9)} │ ${getVerdict(fatDev, TOLERANCE.fat).padEnd(16)} │`);
            console.log(`   └──────────┴──────────┴──────────┴───────────┴──────────────────┘`);
            console.log(`   Ref: ${usda.source}\n`);

        } catch (err) {
            console.log(`❌ ${foodName.toUpperCase()} — ERROR: ${err.message}\n`);
            results.push({ food: foodName, source: 'error', hasIssue: true, error: err.message });
        }
    }

    // === SUMMARY ===
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                        SUMMARY                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    const accurate = results.filter(r => !r.hasIssue);
    const inaccurate = results.filter(r => r.hasIssue);
    const localSource = results.filter(r => r.source === 'local');
    const aiSource = results.filter(r => r.source === 'ai');
    const fallbackSource = results.filter(r => r.source === 'fallback');

    console.log(`Total foods tested:  ${results.length}`);
    console.log(`✅ Accurate:         ${accurate.length}/${results.length} (${Math.round(accurate.length/results.length*100)}%)`);
    console.log(`❌ Inaccurate:       ${inaccurate.length}/${results.length}`);
    console.log(`\nData Source Breakdown:`);
    console.log(`   Local DB:   ${localSource.length}`);
    console.log(`   AI (Gemini):${aiSource.length}`);
    console.log(`   Fallback:   ${fallbackSource.length}`);

    if (inaccurate.length > 0) {
        console.log(`\n⚠️  INACCURATE FOODS (need fixing):`);
        for (const r of inaccurate) {
            if (r.error) {
                console.log(`   • ${r.food}: ERROR - ${r.error}`);
            } else {
                const worst = Math.max(r.deviations.calDev, r.deviations.proDev, r.deviations.carbDev, r.deviations.fatDev);
                console.log(`   • ${r.food}: worst deviation ${worst}% (source: ${r.source})`);
            }
        }
    }

    if (fallbackSource.length > 0) {
        console.log(`\n🚨 FALLBACK ENTRIES (all get same hardcoded values — BROKEN):`);
        for (const r of fallbackSource) {
            console.log(`   • ${r.food}: Got cal=${r.result.calories} pro=${r.result.protein} (should be cal=${r.usda.calories} pro=${r.usda.protein})`);
        }
        console.log(`\n   ROOT CAUSE: GEMINI_API_KEY is missing. These foods are not in the local DB`);
        console.log(`   and the AI fallback returns hardcoded values (cal=135, pro=17.5, carbs=11.5, fat=1.2)`);
    }
}

runTests().catch(console.error);
