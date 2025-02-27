const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('Register attempt:', req.body); // Debug log

        const { name, email, password, userType, phoneNumber } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email); // Debug log
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            userType,
            phoneNumber
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Registration successful for:', email); // Debug log

        res.status(201).json({
            token,
            userType: user.userType,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('User found:', { email: user.email, userType: user.userType });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful, sending response');

        res.json({
            token,
            userType: user.userType,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get all users (for testing)
router.get('/all', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add this route to check registered users
router.get('/check-users', async (req, res) => {
    try {
        const users = await User.find({}, 'email userType');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get user profile by ID
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error fetching user profile' });
    }
});

// Update user profile
router.put('/:userId', authMiddleware, async (req, res) => {
    try {
        // Check if user is updating their own profile
        if (req.user.userId !== req.params.userId) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }
        
        const { name, bio, location, website, linkedin, twitter, skills, interests } = req.body;
        
        // Build user object
        const userFields = {};
        if (name) userFields.name = name;
        if (bio) userFields.bio = bio;
        if (location) userFields.location = location;
        if (website) userFields.website = website;
        if (linkedin) userFields.linkedin = linkedin;
        if (twitter) userFields.twitter = twitter;
        if (skills) userFields.skills = skills;
        if (interests) userFields.interests = interests;
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: userFields },
            { new: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Server error updating user profile' });
    }
});

module.exports = router;