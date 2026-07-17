/**
 * Quick Gemini API connectivity test
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function testGemini() {
    console.log('=== Gemini API Test ===\n');

    // 1. Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('❌ GEMINI_API_KEY is NOT set in .env');
        console.log('   Add this line to backend/.env:');
        console.log('   GEMINI_API_KEY=your_api_key_here');
        console.log('\n   Get a key at: https://aistudio.google.com/apikey');
        return;
    }

    console.log(`✅ GEMINI_API_KEY found (starts with: ${apiKey.substring(0, 8)}...)`);

    // 2. Try to initialize the client
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        console.log('✅ GoogleGenerativeAI client initialized');

        // 3. Make a real API call (small, cheap test)
        console.log('\n⏳ Testing API call (nutrition for "apple", 100g)...');
        const prompt = `Return JSON: {"foodName":"apple","calories":52,"protein":0.3,"carbs":14,"fat":0.2,"confidence":0.95}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ API responded successfully!');
        console.log('   Response:', text.substring(0, 200));

        // Try parsing
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        console.log('✅ JSON parsed successfully:', parsed);

        console.log('\n🎉 Gemini API is working fine!');
    } catch (error) {
        console.log(`\n❌ Gemini API Error: ${error.message}`);
        if (error.message.includes('API_KEY_INVALID') || error.status === 400) {
            console.log('   → Your API key is invalid. Generate a new one.');
        } else if (error.message.includes('quota') || error.status === 429) {
            console.log('   → Quota exceeded. Check your usage at Google AI Studio.');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
            console.log('   → Network error. Check your internet connection.');
        }
    }
}

testGemini();
