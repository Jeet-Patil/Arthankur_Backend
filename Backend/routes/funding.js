const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Funding = require('../models/Funding');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Meeting = require('../models/Meeting');

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
        
        // Find the funding request and populate investor details
        const funding = await Funding.findById(id).populate('interests.investorId');
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
        
        // Get startup details
        const startup = await User.findById(funding.userId);
        if (!startup) {
            return res.status(404).json({ error: 'Startup details not found' });
        }
        
        // Update the interest status to accepted
        funding.interests[interestIndex].status = 'accepted';
        
        // Generate a unique meeting room ID
        const meetingId = `meeting-${funding._id}-${funding.interests[interestIndex].investorId}`;
        
        // Create a meeting record
        const meeting = new Meeting({
            requestedBy: funding.userId, // startup
            requestedTo: funding.interests[interestIndex].investorId, // investor
            title: `Discussion: ${funding.title}`,
            description: `Investment discussion for ${funding.title} between ${startup.name} and ${funding.interests[interestIndex].name}`,
            dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
            duration: 60, // Default 60 minutes
            status: 'pending',
            meetingLink: meetingId
        });
        
        await meeting.save();
        
        // Add meeting details
        funding.interests[interestIndex].meetingRoomId = meetingId;
        funding.interests[interestIndex].meetingDetails = {
            startupName: startup.name,
            investorName: funding.interests[interestIndex].name,
            fundingTitle: funding.title,
            fundingType: funding.type,
            amount: funding.maxAmount,
            createdAt: new Date()
        };
        
        // Create notification for the investor
        const notification = new Notification({
            userId: funding.interests[interestIndex].investorId,
            title: 'Interest Accepted!',
            message: `${startup.name} has accepted your interest in "${funding.title}". A meeting has been scheduled for further discussion.`,
            type: 'interest_accepted',
            relatedTo: {
                fundingId: funding._id,
                meetingId: meeting._id
            }
        });
        
        await notification.save();
        
        // Update the funding status to in_progress
        funding.status = 'in_progress';
        
        await funding.save();
        
        res.status(200).json({ 
            message: 'Interest accepted successfully',
            funding,
            meetingId: meeting._id,
            notification
        });
    } catch (error) {
        console.error('Error accepting interest:', error);
        res.status(500).json({ error: 'Error accepting interest in funding request' });
    }
});

// Delete a funding request
router.delete('/:id', auth, async (req, res) => {
    try {
        const funding = await Funding.findById(req.params.id);
        
        if (!funding) {
            return res.status(404).json({ error: 'Funding request not found' });
        }

        // Verify this funding request belongs to the user
        if (funding.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete this funding request' });
        }

        // Delete any associated notifications
        await Notification.deleteMany({
            'relatedTo.fundingId': funding._id
        });

        // Delete the funding request
        await Funding.findByIdAndDelete(req.params.id);

        res.json({ message: 'Funding request deleted successfully' });
    } catch (error) {
        console.error('Error deleting funding request:', error);
        res.status(500).json({ error: 'Error deleting funding request' });
    }
});

module.exports = router;