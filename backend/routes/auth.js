const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, age, gender, height, weight, activityLevel } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            age,
            gender,
            height,
            weight,
            activityLevel
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                profilePicture: user.profilePicture,
                currentStreak: user.currentStreak
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '7d' }
        );

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastLogged = user.lastLoggedDate ? new Date(user.lastLoggedDate) : null;
        if (lastLogged) {
            lastLogged.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastLogged) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                user.currentStreak = (user.currentStreak || 0) + 1;
            } else if (daysDiff > 1) {
                user.currentStreak = 1;
            }
        } else {
            user.currentStreak = 1;
        }
        user.lastLoggedDate = new Date();
        await user.save();

        res.json({
            token,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                profilePicture: user.profilePicture,
                currentStreak: user.currentStreak,
                lastLoggedDate: user.lastLoggedDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                profilePicture: user.profilePicture,
                authProvider: user.authProvider,
                phoneNumber: user.phoneNumber,
                currentStreak: user.currentStreak,
                lastLoggedDate: user.lastLoggedDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const {
            name,
            age,
            height,
            weight,
            activityLevel,
            dailyCalorieGoal,
            dailyProteinGoal,
            dailyCarbsGoal,
            dailyFatGoal
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields and history
        if (name) user.name = name;
        if (age !== undefined) user.age = age;

        if (height !== undefined && height !== user.height) {
            user.heightHistory.push({ height: user.height, date: new Date() });
            user.height = height;
        }

        if (weight !== undefined && weight !== user.weight) {
            user.weightHistory.push({ weight: user.weight, date: new Date() });
            user.weight = weight;
        }

        if (activityLevel) user.activityLevel = activityLevel;

        // Check if any goal changed
        const goalsChanged =
            (dailyCalorieGoal !== undefined && dailyCalorieGoal !== user.dailyCalorieGoal) ||
            (dailyProteinGoal !== undefined && dailyProteinGoal !== user.dailyProteinGoal) ||
            (dailyCarbsGoal !== undefined && dailyCarbsGoal !== user.dailyCarbsGoal) ||
            (dailyFatGoal !== undefined && dailyFatGoal !== user.dailyFatGoal);

        if (goalsChanged) {
            user.goalHistory.push({
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                date: new Date()
            });
        }

        if (dailyCalorieGoal !== undefined) user.dailyCalorieGoal = dailyCalorieGoal;
        if (dailyProteinGoal !== undefined) user.dailyProteinGoal = dailyProteinGoal;
        if (dailyCarbsGoal !== undefined) user.dailyCarbsGoal = dailyCarbsGoal;
        if (dailyFatGoal !== undefined) user.dailyFatGoal = dailyFatGoal;

        await user.save();

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                profilePicture: user.profilePicture,
                authProvider: user.authProvider,
                phoneNumber: user.phoneNumber,
                currentStreak: user.currentStreak
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

