const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true,
        enum: ['startup', 'investor']
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
    phoneNumber: {
        type: String,
        required: true
    },
    // Startup specific fields
    registrationNumber: String,
    industry: String,
    about: String,
    
    // Investor specific fields
    name: String,
    investmentExperience: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 