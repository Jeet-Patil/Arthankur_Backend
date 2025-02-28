const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up storage for GST return files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/gst');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /json|xlsx|csv|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only JSON, XLSX, CSV, and PDF files are allowed'));
    }
});

// Route to upload and submit GST return
router.post('/gst-return', auth, upload.single('gstData'), async (req, res) => {
    try {
        // In a real application, this would process the uploaded file
        // and potentially submit it to the GST portal via their API
        
        // For now, we'll just send back a success response
        res.status(200).json({
            success: true,
            message: 'GST return data uploaded successfully',
            file: req.file ? req.file.filename : null,
            submissionDate: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading GST return data',
            error: error.message
        });
    }
});

// Route to generate tax reports
router.get('/reports/:type', auth, async (req, res) => {
    try {
        const { type } = req.params;
        
        // In a real application, this would query the database for financial data
        // and generate the appropriate report
        
        // For demonstration, we'll return mock data
        let reportData = {};
        
        switch (type) {
            case 'gst':
                reportData = {
                    type: 'GST Report',
                    period: 'Feb 2025',
                    totalTaxable: 120000,
                    totalGST: 21600,
                    sections: [
                        { category: 'Goods', taxable: 70000, gst: 12600 },
                        { category: 'Services', taxable: 50000, gst: 9000 }
                    ]
                };
                break;
            case 'tds':
                reportData = {
                    type: 'TDS Report',
                    period: 'Q4 FY 2024-25',
                    totalDeduction: 15000,
                    sections: [
                        { category: 'Salary', amount: 100000, tds: 10000 },
                        { category: 'Professional Fees', amount: 50000, tds: 5000 }
                    ]
                };
                break;
            case 'income-tax':
                reportData = {
                    type: 'Income Tax Report',
                    period: 'FY 2024-25',
                    totalIncome: 1200000,
                    totalTax: 240000,
                    sections: [
                        { category: 'Business Income', amount: 1000000, tax: 200000 },
                        { category: 'Other Income', amount: 200000, tax: 40000 }
                    ]
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }
        
        res.status(200).json({
            success: true,
            data: reportData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating tax report',
            error: error.message
        });
    }
});

// Route to get compliance calendar events
router.get('/calendar', auth, async (req, res) => {
    try {
        // In a real application, this would query the database for compliance deadlines
        
        // For demonstration, we'll return mock data
        const events = [
            {
                id: 1,
                title: 'GST Filing - GSTR-3B',
                description: 'Monthly GSTR-3B return filing',
                dueDate: '2025-03-20T23:59:59',
                category: 'GST',
                status: 'pending'
            },
            {
                id: 2,
                title: 'TDS Return - Q4',
                description: 'Quarterly TDS return filing',
                dueDate: '2025-03-31T23:59:59',
                category: 'TDS',
                status: 'pending'
            },
            {
                id: 3,
                title: 'Income Tax Advance Payment - Q4',
                description: 'Fourth installment of advance tax',
                dueDate: '2025-04-15T23:59:59',
                category: 'Income Tax',
                status: 'pending'
            },
            {
                id: 4,
                title: 'GST Annual Return',
                description: 'Annual GST return for FY 2024-25',
                dueDate: '2025-12-31T23:59:59',
                category: 'GST',
                status: 'pending'
            }
        ];
        
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching compliance calendar',
            error: error.message
        });
    }
});

module.exports = router;
