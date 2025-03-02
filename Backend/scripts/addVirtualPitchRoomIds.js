/**
 * Migration script to add virtualPitchRoomId to all existing accepted meetings
 * that don't already have one.
 * 
 * Run with: node scripts/addVirtualPitchRoomIds.js
 */

const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
require('dotenv').config();

const addVirtualPitchRoomIds = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Find all accepted meetings without a virtualPitchRoomId
        const meetings = await Meeting.find({
            status: 'accepted',
            $or: [
                { virtualPitchRoomId: { $exists: false } },
                { virtualPitchRoomId: null },
                { virtualPitchRoomId: '' }
            ]
        });
        
        console.log(`Found ${meetings.length} accepted meetings without virtualPitchRoomId`);
        
        // Update each meeting with a new virtualPitchRoomId
        for (const meeting of meetings) {
            const virtualPitchRoomId = `pitch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            meeting.virtualPitchRoomId = virtualPitchRoomId;
            await meeting.save();
            console.log(`Added virtualPitchRoomId to meeting ${meeting._id}: ${virtualPitchRoomId}`);
            
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

// Run the migration
addVirtualPitchRoomIds();
