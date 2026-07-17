const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Limit login specifically to 5 attempts
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Register
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { name, email, password, age, gender, height, weight, activityLevel, medicalHistory } = req.body;

        // Check if user exists - case insensitive
        const existingUser = await User.findOne({ email: email.toLowerCase() });
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
            activityLevel,
            medicalHistory: medicalHistory || 'none'
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
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
                weightHistory: user.weightHistory || [],
                heightHistory: user.heightHistory || [],
                goalHistory: user.goalHistory || [],
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                targetWeight: user.targetWeight,
                goalType: user.goalType
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user - using case-insensitive email check
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('Login failed: User not found for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const startTime = Date.now();
        const isMatch = await user.comparePassword(password);
        const bcryptTime = Date.now() - startTime;
        console.log(`Bcrypt compare took: ${bcryptTime}ms`);

        if (!isMatch) {
            console.log('Login failed: Password mismatch for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

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
                weightHistory: (user.weightHistory || []).slice(-10),
                heightHistory: (user.heightHistory || []).slice(-10),
                goalHistory: (user.goalHistory || []).slice(-10),
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                targetWeight: user.targetWeight,
                goalType: user.goalType
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
                weightHistory: (user.weightHistory || []).slice(-50),
                heightHistory: (user.heightHistory || []).slice(-50),
                goalHistory: (user.goalHistory || []).slice(-50),
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                targetWeight: user.targetWeight,
                goalType: user.goalType
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
                weightHistory: user.weightHistory,
                heightHistory: user.heightHistory,
                goalHistory: user.goalHistory
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Complete Onboarding
router.post('/onboarding', auth, async (req, res) => {
    try {
        const updates = req.body;
        // req.user is already populated by auth middleware
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        const allowedUpdates = [
            'age', 'gender', 'height', 'weight', 'activityLevel',
            'dailyCalorieGoal', 'dailyProteinGoal', 'dailyCarbsGoal', 'dailyFatGoal',
            'goalType', 'targetWeight', 'hasCompletedOnboarding', 'medicalHistory'
        ];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
            }
        });

        // Always mark as completed when this endpoint is called
        user.hasCompletedOnboarding = true;

        // Initialize history if empty
        if (user.weightHistory.length === 0) {
            user.weightHistory.push({ weight: user.weight, date: new Date() });
        }
        if (user.heightHistory.length === 0) {
            user.heightHistory.push({ height: user.height, date: new Date() });
        }
        if (user.goalHistory.length === 0) {
            user.goalHistory.push({
                dailyCalorieGoal: user.dailyCalorieGoal,
                dailyProteinGoal: user.dailyProteinGoal,
                dailyCarbsGoal: user.dailyCarbsGoal,
                dailyFatGoal: user.dailyFatGoal,
                date: new Date()
            });
        }

        await user.save();

        res.json({ message: 'Onboarding completed', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request for:', email);

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found in database for email:', email);
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        console.log('User found:', user.email);
        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send email
        const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error);
            return res.status(500).json({ message: 'Error sending reset email. Please try again later.' });
        }

        console.log('Reset email sent successfully to:', user.email);
        res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password and clear reset fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Google OAuth callback — verifies ID token server-side
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Missing Google credential token' });
        }

        // Verify the Google ID token server-side
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        const email = payload.email;
        const name = payload.name;
        const profilePicture = payload.picture;

        if (!email) {
            return res.status(400).json({ message: 'Could not retrieve email from Google account' });
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create new user from Google OAuth
            user = new User({
                name,
                email: email.toLowerCase(),
                profilePicture,
                authProvider: 'google',
                hasCompletedOnboarding: false
            });
            await user.save();
        } else {
            // Update profile picture if changed
            let needsSave = false;
            if (user.authProvider !== 'google') {
                user.authProvider = 'google';
                needsSave = true;
            }
            if (profilePicture && user.profilePicture !== profilePicture) {
                user.profilePicture = profilePicture;
                needsSave = true;
            }
            if (needsSave) await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

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
                authProvider: user.authProvider,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                targetWeight: user.targetWeight,
                goalType: user.goalType,
                medicalHistory: user.medicalHistory,
                weightHistory: (user.weightHistory || []).slice(-10),
                heightHistory: (user.heightHistory || []).slice(-10),
                goalHistory: (user.goalHistory || []).slice(-10)
            }
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ message: 'Google authentication failed. Please try again.' });
    }
});

module.exports = router;

