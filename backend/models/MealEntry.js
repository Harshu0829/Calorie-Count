const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        default: 'snack'
    },
    foodName: {
        type: String,
        required: true,
        trim: true
    },
    portion: {
        type: Number,
        default: 100,
        min: 0
    },
    calories: {
        type: Number,
        default: 0,
        min: 0
    },
    protein: {
        type: Number,
        default: 0,
        min: 0
    },
    carbs: {
        type: Number,
        default: 0,
        min: 0
    },
    fat: {
        type: Number,
        default: 0,
        min: 0
    },
    micronutrients: {
        vitaminA: { type: Number, default: 0 },
        vitaminC: { type: Number, default: 0 },
        calcium: { type: Number, default: 0 },
        iron: { type: Number, default: 0 }
    },
    entryType: {
        type: String,
        enum: ['manual', 'ai', 'search'],
        default: 'manual'
    },
    foodState: {
        type: String,
        enum: ['raw', 'cooked'],
        default: 'cooked'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1 // Manual entries have 100% confidence by default
    },
    imageMetadata: {
        originalName: String,
        size: Number,
        mimeType: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries by user and date
mealEntrySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('MealEntry', mealEntrySchema);
