const mongoose = require('mongoose');

const gstDetailsSchema = new mongoose.Schema({
    gstNumber: {
        type: String,
        required: true,
        unique: true
    },
    turnover: {
        type: Number,
        required: true
    },
    taxPeriod: {
        type: String,
        required: true
    },
    taxableAmount: {
        type: Number,
        required: true
    },
    documents: [{
        fileName: String,
        filePath: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending'
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const deadlineSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'pending', 'completed'],
        default: 'upcoming'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const taxReportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    reportPeriod: {
        type: String,
        required: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['generated', 'downloaded', 'archived'],
        default: 'generated'
    },
    filePath: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const GSTDetails = mongoose.model('GSTDetails', gstDetailsSchema);
const Deadline = mongoose.model('Deadline', deadlineSchema);
const TaxReport = mongoose.model('TaxReport', taxReportSchema);

module.exports = {
    GSTDetails,
    Deadline,
    TaxReport
}; 