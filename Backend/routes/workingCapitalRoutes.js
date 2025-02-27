const express = require('express');
const router = express.Router();
const WorkingCapital = require('../models/WorkingCapital');
const authMiddleware = require('../middleware/auth');

// Create a new working capital analysis
router.post('/working-capital/analysis', authMiddleware, async (req, res) => {
    console.log('Received working capital analysis request');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('User ID from auth:', req.user?.id);
    
    try {
        const { financialData, analysis, name, description } = req.body;
        
        console.log('Extracted data:', { 
            financialDataExists: !!financialData, 
            analysisExists: !!analysis,
            name,
            description: description || 'Working capital analysis'
        });
        
        const workingCapitalAnalysis = new WorkingCapital({
            userId: req.user.id,
            financialData,
            analysis,
            name,
            description: description || 'Working capital analysis'
        });
        
        console.log('Created WorkingCapital document');
        
        try {
            const savedAnalysis = await workingCapitalAnalysis.save();
            console.log('Successfully saved analysis with ID:', savedAnalysis._id);
            res.status(201).json(savedAnalysis);
        } catch (saveError) {
            console.error('Error saving analysis document:', saveError);
            console.error('Validation errors:', saveError.errors);
            res.status(400).json({ error: 'Invalid data format', details: saveError.message });
        }
    } catch (error) {
        console.error('Error creating working capital analysis:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

// Get all working capital analyses for a user
router.get('/working-capital/analyses', authMiddleware, async (req, res) => {
    try {
        const analyses = await WorkingCapital.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        
        res.status(200).json(analyses);
    } catch (error) {
        console.error('Error fetching working capital analyses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific working capital analysis
router.get('/working-capital/analysis/:id', authMiddleware, async (req, res) => {
    try {
        const analysis = await WorkingCapital.findById(req.params.id);
        
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        // Check if the analysis belongs to the authenticated user
        if (analysis.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to access this analysis' });
        }
        
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Error fetching working capital analysis:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a working capital analysis
router.put('/working-capital/analysis/:id', authMiddleware, async (req, res) => {
    try {
        const { financialData, analysis, name, description } = req.body;
        
        // Find the analysis
        const existingAnalysis = await WorkingCapital.findById(req.params.id);
        
        if (!existingAnalysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        // Check if the analysis belongs to the authenticated user
        if (existingAnalysis.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this analysis' });
        }
        
        // Update the analysis
        existingAnalysis.financialData = financialData;
        existingAnalysis.analysis = analysis;
        existingAnalysis.name = name;
        if (description) existingAnalysis.description = description;
        
        const updatedAnalysis = await existingAnalysis.save();
        res.status(200).json(updatedAnalysis);
    } catch (error) {
        console.error('Error updating working capital analysis:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a working capital analysis
router.delete('/working-capital/analysis/:id', authMiddleware, async (req, res) => {
    try {
        // Find the analysis
        const analysis = await WorkingCapital.findById(req.params.id);
        
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        // Check if the analysis belongs to the authenticated user
        if (analysis.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this analysis' });
        }
        
        await WorkingCapital.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Analysis deleted successfully' });
    } catch (error) {
        console.error('Error deleting working capital analysis:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
