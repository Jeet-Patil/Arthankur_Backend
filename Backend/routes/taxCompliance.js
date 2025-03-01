const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GSTDetails, Deadline, TaxReport } = require('../models/TaxCompliance');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/tax';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Apply auth middleware to all routes
router.use(auth);

// GST Routes
router.post('/gst', upload.array('documents'), async (req, res) => {
    try {
        const { gstNumber, turnover, taxPeriod, taxableAmount } = req.body;
        const documents = req.files.map(file => ({
            fileName: file.originalname,
            filePath: file.path
        }));

        const gstDetails = new GSTDetails({
            gstNumber,
            turnover,
            taxPeriod,
            taxableAmount,
            documents,
            userId: req.user._id
        });

        await gstDetails.save();
        res.status(201).json(gstDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/gst', async (req, res) => {
    try {
        const gstDetails = await GSTDetails.find({ userId: req.user._id });
        res.json(gstDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Deadline Routes
router.post('/deadlines', async (req, res) => {
    try {
        const deadline = new Deadline({
            ...req.body,
            userId: req.user._id
        });
        await deadline.save();
        res.status(201).json(deadline);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/deadlines', async (req, res) => {
    try {
        const deadlines = await Deadline.find({ userId: req.user._id });
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/deadlines/:id', async (req, res) => {
    try {
        const deadline = await Deadline.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }
        res.json(deadline);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/deadlines/:id', async (req, res) => {
    try {
        const deadline = await Deadline.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }
        res.json({ message: 'Deadline deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tax Report Routes
router.post('/reports', async (req, res) => {
    try {
        const report = new TaxReport({
            ...req.body,
            userId: req.user._id
        });
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/reports', async (req, res) => {
    try {
        const reports = await TaxReport.find({ userId: req.user._id });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/reports/:id/status', async (req, res) => {
    try {
        const report = await TaxReport.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { status: req.body.status } },
            { new: true }
        );
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 