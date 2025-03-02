const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15,
        max: 180
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    meetingLink: {
        type: String
    },
    virtualPitchRoomId: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);