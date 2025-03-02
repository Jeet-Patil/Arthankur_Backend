const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image file (jpg, jpeg, png)'));
        }
        cb(null, true);
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        
        const { 
            name, 
            email, 
            password, 
            userType, 
            phoneNumber, 
            registrationNumber, 
            industry, 
            about,
            startupStage,
            industryType,
            annualRevenue,
            numberOfEmployees,
            registeredLocation,
            existingGovernmentSupport,
            investmentExperience
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !userType || !phoneNumber) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
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

        // Add user type specific fields
        if (userType === 'startup') {
            user.registrationNumber = registrationNumber;
            user.industry = industry;
            user.about = about;
            // Additional fields for government scheme eligibility
            user.startupStage = startupStage;
            user.industryType = industryType;
            user.annualRevenue = annualRevenue;
            user.numberOfEmployees = numberOfEmployees;
            user.registeredLocation = registeredLocation;
            user.existingGovernmentSupport = existingGovernmentSupport;
        } else if (userType === 'investor') {
            user.investmentExperience = investmentExperience;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully:', user._id);

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    throw err;
                }
                res.json({ 
                    token,
                    userType: user.userType,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        console.error('Registration error details:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        res.status(500).json({ error: 'Server error during registration', details: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token,
                    userType: user.userType,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user's profile
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Getting current user profile for ID:', req.user._id);
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('Returning user profile');
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// Get user profile by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// Update user profile
router.put('/:id', auth, upload.single('profilePhoto'), async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify user is updating their own profile
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        const updateData = { ...req.body };
        
        // If a new profile photo was uploaded
        if (req.file) {
            updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

module.exports = router; 