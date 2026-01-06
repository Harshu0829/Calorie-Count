const mongoose = require('mongoose');

const foodCacheSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    normalizedName: {
        type: String,
        required: true,
        index: true
    },
    nutrition: {
        calories: { type: Number, required: true, min: 0 },
        protein: { type: Number, required: true, min: 0 },
        carbs: { type: Number, required: true, min: 0 },
        fat: { type: Number, required: true, min: 0 },
        servingSize: { type: Number, default: 100 }
    },
    analysisCount: {
        type: Number,
        default: 1,
        min: 1
    },
    averageConfidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    },
    lastAnalyzed: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 } // TTL index
    }
}, {
    timestamps: true
});

// Index for text search
foodCacheSchema.index({ foodName: 'text', normalizedName: 'text' });

// Method to check if cache is still valid
foodCacheSchema.methods.isValid = function () {
    const expiryDays = parseInt(process.env.CACHE_EXPIRY_DAYS) || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - expiryDays);
    return this.lastAnalyzed > expiryDate;
};

// Method to increment analysis count
foodCacheSchema.methods.incrementCount = function () {
    this.analysisCount += 1;
    this.lastAnalyzed = new Date();
    return this.save();
};

// Static method to find similar foods
foodCacheSchema.statics.findSimilar = async function (foodName) {
    const normalized = foodName.toLowerCase().trim();

    // Try exact match first
    let food = await this.findOne({ normalizedName: normalized });
    if (food && food.isValid()) return food;

    // Try fuzzy match (text search)
    const results = await this.find(
        { $text: { $search: normalized } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(1);

    if (results.length > 0 && results[0].isValid()) {
        return results[0];
    }

    return null;
};

module.exports = mongoose.model('FoodCache', foodCacheSchema);
