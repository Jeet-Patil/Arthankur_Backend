const mongoose = require('mongoose');

const cashFlowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  historicalData: {
    revenue: {
      type: Number,
      required: true
    },
    expenses: {
      type: Number,
      required: true
    },
    operatingExpenses: {
      type: Number,
      required: true
    },
    capitalExpenditures: {
      type: Number,
      required: true
    },
    accountsReceivable: Number,
    accountsPayable: Number,
    inventory: Number
  },
  forecastPeriod: {
    type: Number,
    required: true
  },
  forecasts: [{
    month: Number,
    revenue: Number,
    expenses: Number,
    operatingExpenses: Number,
    capitalExpenditures: Number,
    netCashFlow: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('CashFlow', cashFlowSchema);
