const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Create a new notification
router.post('/', auth, async (req, res) => {
    try {
        const { userId, title, message, type, relatedTo } = req.body;
        
        const notification = new Notification({
            userId,
            title,
            message,
            type,
            relatedTo
        });
        
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error creating notification' });
    }
});

module.exports = router; 