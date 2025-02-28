const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Define Virtual Pitch Schema (you can move this to models directory later)
const virtualPitchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorType: {
        type: String,
        enum: ['startup', 'investor'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    attendees: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userType: {
            type: String,
            enum: ['startup', 'investor']
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create model if it doesn't exist
const VirtualPitch = mongoose.models.VirtualPitch || mongoose.model('VirtualPitch', virtualPitchSchema);

// Create a new virtual pitch
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, industry, roomId, scheduledDate } = req.body;
        
        const virtualPitch = new VirtualPitch({
            title,
            description,
            industry,
            roomId,
            createdBy: req.user.id,
            creatorType: req.user.userType,
            scheduledDate: new Date(scheduledDate)
        });
        
        await virtualPitch.save();
        
        res.status(201).json(virtualPitch);
    } catch (error) {
        console.error('Error creating virtual pitch:', error);
        res.status(400).json({ message: 'Error creating virtual pitch', error: error.message });
    }
});

// Get all virtual pitches (with filtering)
router.get('/', auth, async (req, res) => {
    try {
        const { industry, search } = req.query;
        
        // Build the filter
        const filter = {};
        
        // Only add industry filter if provided
        if (industry) {
            filter.industry = industry;
        }
        
        // Add text search if provided
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add filter for active pitches
        filter.isActive = true;
        
        // Get all virtual pitches
        const virtualPitches = await VirtualPitch.find(filter)
            .populate('createdBy', 'name email userType')
            .sort({ scheduledDate: 1 });
        
        res.json(virtualPitches);
    } catch (error) {
        console.error('Error fetching virtual pitches:', error);
        res.status(500).json({ message: 'Error fetching virtual pitches' });
    }
});

// Get virtual pitches created by the current user
router.get('/my-pitches', auth, async (req, res) => {
    try {
        const virtualPitches = await VirtualPitch.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json(virtualPitches);
    } catch (error) {
        console.error('Error fetching my virtual pitches:', error);
        res.status(500).json({ message: 'Error fetching my virtual pitches' });
    }
});

// Get a single virtual pitch by ID
router.get('/:pitchId', auth, async (req, res) => {
    try {
        const virtualPitch = await VirtualPitch.findById(req.params.pitchId)
            .populate('createdBy', 'name email userType')
            .populate('attendees.userId', 'name email userType');
        
        if (!virtualPitch) {
            return res.status(404).json({ message: 'Virtual pitch not found' });
        }
        
        res.json(virtualPitch);
    } catch (error) {
        console.error('Error fetching virtual pitch:', error);
        res.status(500).json({ message: 'Error fetching virtual pitch' });
    }
});

// Join a virtual pitch
router.post('/:pitchId/join', auth, async (req, res) => {
    try {
        const virtualPitch = await VirtualPitch.findById(req.params.pitchId);
        
        if (!virtualPitch) {
            return res.status(404).json({ message: 'Virtual pitch not found' });
        }
        
        // Check if user already joined
        const alreadyJoined = virtualPitch.attendees.some(
            attendee => attendee.userId.toString() === req.user.id
        );
        
        if (!alreadyJoined) {
            virtualPitch.attendees.push({
                userId: req.user.id,
                userType: req.user.userType
            });
            
            await virtualPitch.save();
        }
        
        res.json(virtualPitch);
    } catch (error) {
        console.error('Error joining virtual pitch:', error);
        res.status(500).json({ message: 'Error joining virtual pitch' });
    }
});

// Update a virtual pitch (only creator can update)
router.patch('/:pitchId', auth, async (req, res) => {
    try {
        const { title, description, industry, scheduledDate, isActive } = req.body;
        
        const virtualPitch = await VirtualPitch.findOne({
            _id: req.params.pitchId,
            createdBy: req.user.id
        });
        
        if (!virtualPitch) {
            return res.status(404).json({ message: 'Virtual pitch not found or unauthorized' });
        }
        
        // Update fields if provided
        if (title) virtualPitch.title = title;
        if (description) virtualPitch.description = description;
        if (industry) virtualPitch.industry = industry;
        if (scheduledDate) virtualPitch.scheduledDate = new Date(scheduledDate);
        if (isActive !== undefined) virtualPitch.isActive = isActive;
        
        await virtualPitch.save();
        
        res.json(virtualPitch);
    } catch (error) {
        console.error('Error updating virtual pitch:', error);
        res.status(400).json({ message: 'Error updating virtual pitch' });
    }
});

// Delete a virtual pitch (only creator can delete)
router.delete('/:pitchId', auth, async (req, res) => {
    try {
        const virtualPitch = await VirtualPitch.findOneAndDelete({
            _id: req.params.pitchId,
            createdBy: req.user.id
        });
        
        if (!virtualPitch) {
            return res.status(404).json({ message: 'Virtual pitch not found or unauthorized' });
        }
        
        res.json({ message: 'Virtual pitch deleted successfully' });
    } catch (error) {
        console.error('Error deleting virtual pitch:', error);
        res.status(500).json({ message: 'Error deleting virtual pitch' });
    }
});

module.exports = router;
