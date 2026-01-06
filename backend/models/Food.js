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
        enum: ['fruit', 'vegetable', 'protein', 'grain', 'dairy', 'snack', 'beverage', 'dessert', 'other'],
        default: 'other'
    }
}, {
    timestamps: true
});

// Index for searching
foodSchema.index({ name: 'text', displayName: 'text' });
const Food = mongoose.model('Food', foodSchema);

const dessertSchema = new mongoose.Schema({
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
    sugar: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    servingSize: {
        type: Number, // in grams
        default: 100
    },
    category: {
        type: String,
        default: 'dessert'
    },
    isSugarFree: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

dessertSchema.index({ name: 'text', displayName: 'text' });
const Dessert = mongoose.model('Dessert', dessertSchema);

module.exports = { Food, Dessert };

