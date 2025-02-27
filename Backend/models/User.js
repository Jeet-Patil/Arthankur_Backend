const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['startup', 'investor'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    // Profile fields
    bio: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    interests: {
        type: [String],
        default: []
    },
    connections: {
        type: Number,
        default: 0
    },
    // Startup specific fields
    registrationNumber: String,
    industry: String,
    about: String,
    fundingRequests: {
        type: Number,
        default: 0
    },
    
    // Investor specific fields
    investmentExperience: String,
    investments: {
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);