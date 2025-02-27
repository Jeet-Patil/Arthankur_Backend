const mongoose = require('mongoose');

const workingCapitalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    financialData: {
        currentAssets: {
            type: Number,
            required: true
        },
        currentLiabilities: {
            type: Number,
            required: true
        },
        inventory: {
            type: Number,
            required: true
        },
        accountsReceivable: {
            type: Number,
            required: true
        },
        accountsPayable: {
            type: Number,
            required: true
        },
        cashAndEquivalents: {
            type: Number,
            required: true
        },
        annualSales: {
            type: Number,
            default: 0
        },
        costOfGoodsSold: {
            type: Number,
            default: 0
        },
        annualPurchases: {
            type: Number,
            default: 0
        },
        shortTermDebt: {
            type: Number,
            default: 0
        }
    },
    analysis: {
        workingCapital: Number,
        currentRatio: Number,
        quickRatio: Number,
        cashRatio: Number,
        workingCapitalRatio: Number,
        daysReceivable: Number,
        daysPayable: Number,
        inventoryTurnover: Number,
        daysInventoryOutstanding: Number,
        cashConversionCycle: Number,
        recommendations: [String]
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'Working capital analysis'
    }
}, { timestamps: true });

module.exports = mongoose.model('WorkingCapital', workingCapitalSchema);
