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
            .populate('interests.investorId')
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
                    },
                    totalInterests: { $sum: { $size: { $ifNull: ["$interests", []] } } }
                }
            }
        ]);

        res.json(stats[0] || {
            totalRequests: 0,
            totalFundingRequested: 0,
            inProgress: 0,
            approved: 0,
            rejected: 0,
            totalInterests: 0
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

// Express interest in a funding request
router.post('/:id/interest', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        // Find the funding request
        const funding = await Funding.findById(id);
        if (!funding) {
            return res.status(404).json({ error: 'Funding request not found' });
        }
        
        // Check if the investor has already expressed interest
        const alreadyInterested = funding.interests.some(
            interest => interest.investorId.toString() === req.user.id.toString()
        );
        
        if (alreadyInterested) {
            return res.status(400).json({ error: 'You have already expressed interest in this funding request' });
        }
        
        // Add the investor's interest with the message
        funding.interests.push({
            investorId: req.user.id,
            name: req.user.name,
            email: req.user.email,
            message: message || 'Interested in your funding opportunity',
            status: 'pending',
            date: new Date()
        });
        
        await funding.save();
        
        res.status(201).json({ message: 'Interest expressed successfully', funding });
    } catch (error) {
        console.error('Error expressing interest:', error);
        res.status(500).json({ error: 'Error expressing interest in funding request' });
    }
});

// Get a specific funding request by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const funding = await Funding.findById(req.params.id);
        if (!funding) {
            return res.status(404).json({ error: 'Funding request not found' });
        }
        
        res.json(funding);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funding request' });
    }
});

// Accept investor interest in a funding request
router.post('/:id/accept-interest/:interestId', auth, async (req, res) => {
    try {
        const { id, interestId } = req.params;
        
        // Find the funding request
        const funding = await Funding.findById(id);
        if (!funding) {
            return res.status(404).json({ error: 'Funding request not found' });
        }
        
        // Verify this funding request belongs to the user
        if (funding.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to accept interest for this funding request' });
        }
        
        // Find the specific interest in the array
        const interestIndex = funding.interests.findIndex(
            interest => interest._id.toString() === interestId
        );
        
        if (interestIndex === -1) {
            return res.status(404).json({ error: 'Interest not found in this funding request' });
        }
        
        // Update the interest status to accepted
        funding.interests[interestIndex].status = 'accepted';
        
        // Update the funding status to approved
        funding.status = 'approved';
        
        await funding.save();
        
        res.status(200).json({ 
            message: 'Interest accepted successfully',
            funding
        });
    } catch (error) {
        console.error('Error accepting interest:', error);
        res.status(500).json({ error: 'Error accepting interest in funding request' });
    }
});

module.exports = router;