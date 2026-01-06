const mongoose = require('mongoose');

const foodAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodName: {
        type: String,
        required: true,
        trim: true
    },
    calories: {
        type: Number,
        required: true,
        min: 0
    },
    protein: {
        type: Number,
        required: true,
        min: 0
    },
    carbs: {
        type: Number,
        required: true,
        min: 0
    },
    fat: {
        type: Number,
        required: true,
        min: 0
    },
    micronutrients: {
        vitaminA: { type: Number, default: 0 },
        vitaminC: { type: Number, default: 0 },
        calcium: { type: Number, default: 0 },
        iron: { type: Number, default: 0 }
    },
    servingSize: {
        type: Number, // in grams
        default: 100
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    },
    imageMetadata: {
        originalName: String,
        size: Number,
        mimeType: String
    },
    analysisDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries by user and date
foodAnalysisSchema.index({ user: 1, analysisDate: -1 });
foodAnalysisSchema.index({ user: 1, createdAt: -1 });

// Virtual for daily totals (can be used for aggregation)
foodAnalysisSchema.virtual('dailyTotal').get(function () {
    return {
        calories: this.calories,
        protein: this.protein,
        carbs: this.carbs,
        fat: this.fat
    };
});

module.exports = mongoose.model('FoodAnalysis', foodAnalysisSchema);
