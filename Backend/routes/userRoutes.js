const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('Register attempt:', req.body); // Debug log

        const { name, email, password, userType } = req.body;
        
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
            userType
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
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
                name: user.name
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
            { userId: user._id, userType: user.userType },
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
                name: user.name
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

module.exports = router; 