const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loanTitle: {
        type: String,
        required: true
    },
    bank: {
        name: { type: String, required: true },
        interestRate: { type: String, required: true },
        processingFee: { type: String, required: true }
    },
    loanType: {
        type: String,
        enum: ['business', 'equipment', 'working_capital', 'term_loan'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    tenure: {
        type: Number,
        required: true
    },
    businessDetails: {
        businessName: { type: String, required: true },
        businessType: { type: String, required: true },
        yearEstablished: { type: Number, required: true },
        annualRevenue: { type: Number, required: true }
    },
    documents: [{
        filename: String,
        path: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    interestRate: {
        type: Number,
        default: null
    },
    approvedAmount: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema); 