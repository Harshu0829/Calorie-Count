const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievementType: {
        type: String,
        enum: ['streak', 'goal', 'milestone', 'weekly_goal', 'monthly_goal'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'trophy'
    },
    dateEarned: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for querying user achievements
achievementSchema.index({ user: 1, dateEarned: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);

