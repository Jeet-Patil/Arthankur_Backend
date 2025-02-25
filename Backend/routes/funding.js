const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Funding = require('../models/Funding');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/funding')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage });

// Create funding request
router.post('/', auth, upload.array('attachments'), async (req, res) => {
    try {
        console.log('Received funding request body:', req.body);
        console.log('User from token:', req.user);
        console.log('Files received:', req.files);

        const {
            title,
            type,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            description,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName
        } = req.body;

        // Validate required fields
        if (!title || !type || !minAmount || !maxAmount || !startDate || !endDate || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const funding = new Funding({
            userId: req.user.id,
            title,
            type,
            minAmount: Number(minAmount),
            maxAmount: Number(maxAmount),
            startDate,
            endDate,
            description,
            bankDetails: {
                bankName,
                accountNumber,
                ifscCode,
                accountHolderName
            },
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            })) : []
        });

        console.log('Attempting to save funding:', funding);

        await funding.save();
        console.log('Funding saved successfully');

        res.status(201).json(funding);
    } catch (error) {
        console.error('Error creating funding request:', error);
        res.status(500).json({ error: error.message || 'Error creating funding request' });
    }
});

// Get all funding requests for a user
router.get('/', auth, async (req, res) => {
    try {
        const fundings = await Funding.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(fundings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funding requests' });
    }
});

// Get funding statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Funding.aggregate([
            { $match: { userId: req.user.id } },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    totalFundingRequested: { $sum: '$maxAmount' },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            totalRequests: 0,
            totalFundingRequested: 0,
            inProgress: 0,
            approved: 0,
            rejected: 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funding statistics' });
    }
});

// Get all funding requests (for testing)
router.get('/all', async (req, res) => {
    try {
        const allFundings = await Funding.find()
            .sort({ createdAt: -1 });
        res.json(allFundings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funding requests' });
    }
});

module.exports = router; 