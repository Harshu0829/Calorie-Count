const mongoose = require('mongoose');

const manualMealSchema = new mongoose.Schema({
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
    description: {
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
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ManualMeal', manualMealSchema);



