const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
// Using GEMINI_API_KEY from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

/**
 * Get nutritional information from text description using Gemini
 * @param {string} foodName - Name or description of the food
 * @param {number} weightGrams - Weight of the portion in grams
 * @param {string} foodState - State of the food ('raw' or 'cooked')
 * @returns {Promise<Object>} Nutritional data
 */
exports.getNutritionalInfoFromText = async (foodName, weightGrams, foodState = 'cooked') => {
    try {
        const prompt = `Analyze this food description: "${foodName}" which is in a "${foodState}" state, for a portion of ${weightGrams}g. 
        CRITICAL: Provide nutritional information EXACTLY for the provided weight of ${weightGrams}g.
        Return a JSON object with this exact structure:
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": ${weightGrams},
  "calculatedForWeight": ${weightGrams},
  "micronutrients": {
    "vitaminA": number (in mcg),
    "vitaminC": number (in mg),
    "calcium": number (in mg),
    "iron": number (in mg)
  },
  "confidence": number (0-1)
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        let nutritionData;
        try {
            // Clean markdown if present
            const cleanText = responseText.replace(/```json|```/g, '').trim();
            nutritionData = JSON.parse(cleanText);
        } catch (e) {
            // Fallback: try to find JSON block
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                nutritionData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse nutrition data from AI response');
            }
        }

        return nutritionData;
    } catch (error) {
        console.error('Gemini Service Error (Text Analysis):', error);
        throw error;
    }
};

/**
 * Analyze food image using Gemini 1.5 Flash Vision
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Nutritional data
 */
exports.analyzeFoodImage = async (base64Image, mimeType) => {
    try {
        const prompt = `Analyze this food image and provide nutritional information. 
        CRITICAL: If you can identify the food, estimate its weight in grams and provide nutritional values BASED ON THAT ESTIMATED WEIGHT.
        Return a JSON object with this exact structure:
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": number (estimate in grams),
  "estimatedWeight": number (in grams),
  "micronutrients": {
    "vitaminA": number (in mcg),
    "vitaminC": number (in mg),
    "calcium": number (in mg),
    "iron": number (in mg)
  },
  "confidence": number (0-1)
}`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const responseText = response.text();

        let nutritionData;
        try {
            const cleanText = responseText.replace(/```json|```/g, '').trim();
            nutritionData = JSON.parse(cleanText);
        } catch (e) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                nutritionData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse nutrition data from AI response');
            }
        }

        return nutritionData;
    } catch (error) {
        console.error('Gemini Service Error (Image Analysis):', error);
        throw error;
    }
};
