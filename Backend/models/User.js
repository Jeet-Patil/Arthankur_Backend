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
    profilePhoto: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    company: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        required: true
    },
    // Profile fields
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
    
    // Additional startup fields for government scheme eligibility
    startupStage: {
        type: String,
        enum: ['Idea', 'Prototype', 'Early Stage', 'Growth', 'Mature'],
        default: ''
    },
    industryType: {
        type: String,
        default: ''
    },
    annualRevenue: {
        type: String,
        default: ''
    },
    numberOfEmployees: {
        type: Number,
        default: 0
    },
    registeredLocation: {
        type: String,
        default: ''
    },
    existingGovernmentSupport: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
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