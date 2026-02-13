const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Get nutritional information from text description using Claude
 * @param {string} foodName - Name or description of the food
 * @param {number} weightGrams - Weight of the portion in grams
 * @returns {Promise<Object>} Nutritional data
 */
exports.getNutritionalInfoFromText = async (foodName, weightGrams) => {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Analyze this food description: "${foodName}" for a portion of ${weightGrams}g. 
                    Provide nutritional information. Return ONLY a valid JSON object with this exact structure (no additional text):
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": ${weightGrams},
  "micronutrients": {
    "vitaminA": number (in mcg),
    "vitaminC": number (in mg),
    "calcium": number (in mg),
    "iron": number (in mg)
  },
  "confidence": number (0-1)
}`
                }
            ],
        });

        const responseText = message.content[0].text;
        let nutritionData;

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            nutritionData = JSON.parse(jsonMatch[0]);
        } else {
            nutritionData = JSON.parse(responseText);
        }

        return nutritionData;
    } catch (error) {
        console.error('AI Service Error (Text Analysis):', error);
        throw error;
    }
};

/**
 * Analyze food image using Claude Vision API
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image mime type
 * @returns {Promise<Object>} Nutritional data
 */
exports.analyzeFoodImage = async (base64Image, mimeType) => {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType,
                                data: base64Image,
                            },
                        },
                        {
                            type: "text",
                            text: `Analyze this food image and provide nutritional information. Return ONLY a valid JSON object with this exact structure (no additional text):
{
  "foodName": "name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": number (in grams),
  "micronutrients": {
    "vitaminA": number (in mcg),
    "vitaminC": number (in mg),
    "calcium": number (in mg),
    "iron": number (in mg)
  },
  "confidence": number (0-1)
}`
                        }
                    ],
                },
            ],
        });

        const responseText = message.content[0].text;
        let nutritionData;

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            nutritionData = JSON.parse(jsonMatch[0]);
        } else {
            nutritionData = JSON.parse(responseText);
        }

        return nutritionData;
    } catch (error) {
        console.error('AI Service Error (Image Analysis):', error);
        throw error;
    }
};
