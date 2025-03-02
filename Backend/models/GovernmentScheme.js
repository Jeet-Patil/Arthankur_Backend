const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ministry: {
        type: String,
        required: true
    },
    fundingAmount: {
        type: String,
        required: true
    },
    eligibility: {
        startupStages: {
            type: [String],
            default: []
        },
        industryTypes: {
            type: [String],
            default: []
        },
        annualRevenue: {
            type: [String],
            default: []
        },
        employeeRanges: {
            type: [String],
            default: []
        },
        locations: {
            type: [String],
            default: []
        },
        existingSupport: {
            type: Boolean,
            default: null // null means doesn't matter
        }
    },
    applicationLink: {
        type: String,
        default: ''
    },
    targetAudience: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema); 