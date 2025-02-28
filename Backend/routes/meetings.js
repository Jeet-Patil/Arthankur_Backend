const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all meetings for the current user (both requested by and requested to)
router.get('/', auth, async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [
                { requestedBy: req.user.id },
                { requestedTo: req.user.id }
            ]
        })
        .populate('requestedBy', 'name email')
        .populate('requestedTo', 'name email')
        .sort({ createdAt: -1 });

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});

// Create a new meeting request
router.post('/', auth, async (req, res) => {
    try {
        const { email, title, description, dateTime, duration } = req.body;

        // Find the user by email
        const requestedToUser = await User.findOne({ email });
        if (!requestedToUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a unique meeting link (you can use a more sophisticated method)
        const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;

        const meeting = new Meeting({
            requestedBy: req.user.id,
            requestedTo: requestedToUser._id,
            title,
            description,
            dateTime,
            duration,
            meetingLink
        });

        await meeting.save();

        // Populate user details before sending response
        await meeting.populate('requestedBy', 'name email');
        await meeting.populate('requestedTo', 'name email');

        res.status(201).json(meeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(400).json({ message: 'Error creating meeting' });
    }
});

// Update meeting status (accept/decline)
router.patch('/:meetingId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { meetingId } = req.params;

        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const meeting = await Meeting.findOne({
            _id: meetingId,
            requestedTo: req.user.id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found or unauthorized' });
        }

        meeting.status = status;
        await meeting.save();

        // Populate user details before sending response
        await meeting.populate('requestedBy', 'name email');
        await meeting.populate('requestedTo', 'name email');

        res.json(meeting);
    } catch (error) {
        console.error('Error updating meeting status:', error);
        res.status(400).json({ message: 'Error updating meeting status' });
    }
});

// Update meeting (for changing meetingLink)
router.patch('/:meetingId', auth, async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { meetingLink } = req.body;

        const meeting = await Meeting.findOne({
            _id: meetingId,
            $or: [
                { requestedBy: req.user.id },
                { requestedTo: req.user.id }
            ]
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found or unauthorized' });
        }

        // Update only allowed fields
        if (meetingLink) meeting.meetingLink = meetingLink;

        await meeting.save();

        // Populate user details before sending response
        await meeting.populate('requestedBy', 'name email');
        await meeting.populate('requestedTo', 'name email');

        res.json(meeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(400).json({ message: 'Error updating meeting' });
    }
});

// Get all users (for user selection in meeting creation)
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user.id } },
            'name email userType'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router; 