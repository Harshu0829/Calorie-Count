const mongoose = require('mongoose');

const mealFoodSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number, // in grams
        required: true,
        min: 0
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
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    imageUrl: {
        type: String
    }
});

const mealSchema = new mongoose.Schema({
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
    foods: [mealFoodSchema],
    totalCalories: {
        type: Number,
        default: 0,
        min: 0
    },
    totalProtein: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCarbs: {
        type: Number,
        default: 0,
        min: 0
    },
    totalFat: {
        type: Number,
        default: 0,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Calculate totals before saving
mealSchema.pre('save', function(next) {
    this.totalCalories = this.foods.reduce((sum, food) => sum + food.calories, 0);
    this.totalProtein = this.foods.reduce((sum, food) => sum + food.protein, 0);
    this.totalCarbs = this.foods.reduce((sum, food) => sum + food.carbs, 0);
    this.totalFat = this.foods.reduce((sum, food) => sum + food.fat, 0);
    next();
});

// Index for querying by user and date
mealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);

