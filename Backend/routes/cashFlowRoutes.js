const express = require('express');
const router = express.Router();
const CashFlow = require('../models/CashFlow');
const auth = require('../middleware/auth');

// Create a new cash flow forecast
router.post('/forecast', auth, async (req, res) => {
  try {
    const { 
      historicalData, 
      forecastPeriod, 
      forecasts, 
      name, 
      description 
    } = req.body;

    // Validate inputs
    if (!historicalData || !forecastPeriod || !forecasts || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCashFlow = new CashFlow({
      userId: req.user.id,
      historicalData,
      forecastPeriod,
      forecasts,
      name,
      description
    });

    const savedCashFlow = await newCashFlow.save();
    res.status(201).json(savedCashFlow);
  } catch (error) {
    console.error('Error creating cash flow forecast:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all cash flow forecasts for a user
router.get('/forecasts', auth, async (req, res) => {
  try {
    const cashFlows = await CashFlow.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(cashFlows);
  } catch (error) {
    console.error('Error fetching cash flows:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific cash flow forecast
router.get('/forecast/:id', auth, async (req, res) => {
  try {
    const cashFlow = await CashFlow.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cashFlow) {
      return res.status(404).json({ message: 'Cash flow forecast not found' });
    }

    res.json(cashFlow);
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a cash flow forecast
router.put('/forecast/:id', auth, async (req, res) => {
  try {
    const {
      historicalData,
      forecastPeriod,
      forecasts,
      name,
      description
    } = req.body;

    // Validate inputs
    if (!historicalData || !forecastPeriod || !forecasts || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const cashFlow = await CashFlow.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cashFlow) {
      return res.status(404).json({ message: 'Cash flow forecast not found' });
    }

    // Update the fields
    cashFlow.historicalData = historicalData;
    cashFlow.forecastPeriod = forecastPeriod;
    cashFlow.forecasts = forecasts;
    cashFlow.name = name;
    cashFlow.description = description;

    const updatedCashFlow = await cashFlow.save();
    res.json(updatedCashFlow);
  } catch (error) {
    console.error('Error updating cash flow:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a cash flow forecast
router.delete('/forecast/:id', auth, async (req, res) => {
  try {
    const cashFlow = await CashFlow.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cashFlow) {
      return res.status(404).json({ message: 'Cash flow forecast not found' });
    }

    await cashFlow.remove();
    res.json({ message: 'Cash flow forecast deleted' });
  } catch (error) {
    console.error('Error deleting cash flow:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
