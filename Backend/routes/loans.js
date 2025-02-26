const express = require('express');
const router = express.Router();
const multer = require('multer');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/loans')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage });

// Create loan application
router.post('/', auth, upload.array('documents'), async (req, res) => {
    try {
        console.log('Received loan application:', req.body);
        console.log('Files received:', req.files);
        console.log('User from token:', req.user);
        
        const {
            loanTitle,
            loanType,
            amount,
            purpose,
            tenure,
            businessName,
            businessType,
            yearEstablished,
            annualRevenue,
            bankName,
            bankInterestRate,
            bankProcessingFee
        } = req.body;

        // Validate required fields
        if (!loanTitle || !loanType || !amount || !purpose || !tenure) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const loan = new Loan({
            userId: req.user.id,
            loanTitle,
            loanType,
            amount: Number(amount),
            purpose,
            tenure: Number(tenure),
            bank: {
                name: bankName,
                interestRate: bankInterestRate,
                processingFee: bankProcessingFee
            },
            businessDetails: {
                businessName,
                businessType,
                yearEstablished: Number(yearEstablished),
                annualRevenue: Number(annualRevenue)
            },
            documents: req.files ? req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            })) : []
        });

        console.log('Attempting to save loan:', loan);

        await loan.save();
        console.log('Loan saved successfully');

        res.status(201).json(loan);
    } catch (error) {
        console.error('Error creating loan application:', error);
        res.status(500).json({ error: error.message || 'Error creating loan application' });
    }
});

// Get all loan applications for a user
router.get('/', auth, async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching loan applications' });
    }
});

// Get loan statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Loan.aggregate([
            { $match: { userId: req.user.id } },
            {
                $group: {
                    _id: null,
                    totalLoans: { $sum: '$amount' },
                    activeApplications: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approvedLoans: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    averageInterestRate: { 
                        $avg: {
                            $cond: [
                                { $eq: ['$status', 'approved'] },
                                '$interestRate',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            totalLoans: 0,
            activeApplications: 0,
            approvedLoans: 0,
            averageInterestRate: 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching loan statistics' });
    }
});

// Get a specific loan application
router.get('/:id', auth, async (req, res) => {
    try {
        const loan = await Loan.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!loan) {
            return res.status(404).json({ error: 'Loan application not found' });
        }
        
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching loan application' });
    }
});

// Update loan application status (for admin/bank)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, interestRate, approvedAmount } = req.body;
        
        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                    interestRate,
                    approvedAmount
                }
            },
            { new: true }
        );

        if (!loan) {
            return res.status(404).json({ error: 'Loan application not found' });
        }

        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Error updating loan application' });
    }
});

// Update the test route to include bank details
router.get('/test', async (req, res) => {
    try {
        // Test database connection
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections);
        
        // Test creating a document
        const testLoan = new Loan({
            userId: "507f1f77bcf86cd799439011", // Test ID
            loanTitle: "Test Loan",
            loanType: "business",
            amount: 10000,
            purpose: "Test",
            tenure: 12,
            bank: {
                name: "Test Bank",
                interestRate: "10.5%",
                processingFee: "1%"
            },
            businessDetails: {
                businessName: "Test Business",
                businessType: "Test Type",
                yearEstablished: 2020,
                annualRevenue: 100000
            }
        });
        
        await testLoan.save();
        res.json({ message: 'Test successful', loan: testLoan });
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 