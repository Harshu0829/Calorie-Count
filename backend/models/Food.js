const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true
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
    servingSize: {
        type: Number, // in grams
        default: 100
    },
    category: {
        type: String,
        enum: ['fruit', 'vegetable', 'protein', 'grain', 'dairy', 'snack', 'beverage', 'other'],
        default: 'other'
    }
}, {
    timestamps: true
});

// Index for searching
foodSchema.index({ name: 'text', displayName: 'text' });

module.exports = mongoose.model('Food', foodSchema);

