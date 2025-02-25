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
    // Startup specific fields
    registrationNumber: String,
    industry: String,
    about: String,
    
    // Investor specific fields
    investmentExperience: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 