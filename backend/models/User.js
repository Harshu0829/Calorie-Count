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
        minlength: 6
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook', 'mobile'],
        default: 'local'
    },
    profilePicture: {
        type: String
    },
    phoneNumber: {
        type: String
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
    },
    weightHistory: [{
        weight: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    heightHistory: [{
        height: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    goalHistory: [{
        dailyCalorieGoal: Number,
        dailyProteinGoal: Number,
        dailyCarbsGoal: Number,
        dailyFatGoal: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Onboarding fields
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    },
    targetWeight: {
        type: Number,
        min: 0
    },
    goalType: {
        type: String,
        enum: ['lose', 'maintain', 'gain']
    },
    medicalHistory: {
        type: String,
        enum: ['none', 'diabetes', 'hypertension', 'hypothyroidism', 'kidney_issues', 'other'],
        default: 'none'
    }
}, {
    timestamps: true,
    bufferCommands: false // Disable buffering for this model
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);

