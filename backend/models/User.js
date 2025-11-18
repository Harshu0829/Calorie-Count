const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6
    },
    age: {
        type: Number,
        min: 1,
        max: 120
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    height: {
        type: Number, // in cm
        min: 0
    },
    weight: {
        type: Number, // in kg
        min: 0
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
        default: 'sedentary'
    },
    dailyCalorieGoal: {
        type: Number,
        default: 2000
    },
    dailyProteinGoal: {
        type: Number,
        default: 50
    },
    dailyCarbsGoal: {
        type: Number,
        default: 250
    },
    dailyFatGoal: {
        type: Number,
        default: 65
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

